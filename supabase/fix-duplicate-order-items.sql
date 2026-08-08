-- Run once, in the Supabase SQL editor. Safe to re-run.
--
-- WHY
-- ---
-- A real order recorded the same beat and licence twice: order 0525cafd
-- totals $35 but carries two $35 line items. Stripe charged once; the
-- database recorded twice.
--
-- The webhook already tries to prevent this. It reads the existing items,
-- builds a Set of `beat_id::license_id`, and inserts only what is missing —
-- correct for the sequential retry it was written for. But Stripe delivers
-- at-least-once, retries can overlap, and a read-then-write has no defence
-- against two deliveries that both read an empty table before either writes.
-- Nothing in the schema stopped the second insert: `order_items` carries
-- only a surrogate primary key.
--
-- The fix is a constraint, not more application code. With it in place the
-- losing delivery fails its insert and throws, Stripe retries, and the retry
-- finds the item already recorded and returns early without issuing a second
-- download token. The existing logic becomes correct the moment the database
-- makes the duplicate impossible.
--
-- WHAT IT COSTS UNFIXED
-- ---------------------
-- Duplicate line items double-count revenue: anything summed from
-- order_items reports $70 for a $35 order, so the KPI board would drift from
-- Stripe. Each duplicate also mints a redundant download token.
--
-- NOTE ON WHAT THIS DELIBERATELY DOES NOT DO
-- ------------------------------------------
-- It does not delete any download token. Tokens are links that live in
-- customers' inboxes, and `download_tokens.order_item_id` is ON DELETE
-- CASCADE — so removing a duplicate line item would silently break a paying
-- customer's download. Step 1 re-points tokens onto the surviving row first.
-- Two tokens pointing at one line item is harmless: both resolve to the same
-- file and each carries its own download cap.

begin;

-- 1. Re-point every token that references a soon-to-be-deleted duplicate at
--    the row that survives. Must run before the delete, or the cascade takes
--    the customer's link with it.
with ranked as (
  select
    id,
    first_value(id) over (
      partition by order_id, beat_id, license_id
      order by id
    ) as keep_id
  from public.order_items
)
update public.download_tokens t
set order_item_id = r.keep_id
from ranked r
where t.order_item_id = r.id
  and r.id <> r.keep_id;

-- 2. Remove the duplicate line items, keeping one per (order, beat, licence).
delete from public.order_items o
using (
  select
    id,
    row_number() over (
      partition by order_id, beat_id, license_id
      order by id
    ) as rn
  from public.order_items
) d
where o.id = d.id
  and d.rn > 1;

-- 3. Make it impossible from here. Nobody can own two identical licences for
--    the same beat on one order — a second copy of the same rights is not a
--    thing that exists.
alter table public.order_items
  drop constraint if exists order_items_unique_line;

alter table public.order_items
  add constraint order_items_unique_line
  unique (order_id, beat_id, license_id);

commit;

-- Verify — both should return zero rows:
--
--   select order_id, beat_id, license_id, count(*)
--   from public.order_items group by 1,2,3 having count(*) > 1;
--
--   select t.id from public.download_tokens t
--   left join public.order_items o on o.id = t.order_item_id
--   where o.id is null;
