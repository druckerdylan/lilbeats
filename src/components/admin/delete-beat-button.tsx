"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteBeatButton({ beatId, beatTitle }: { beatId: string; beatTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${beatTitle}"? This cannot be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/beats/${beatId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      toast.success("Beat deleted.");
      router.refresh();
    } else {
      toast.error("Could not delete beat.");
    }
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={loading}
      onClick={handleDelete}
      aria-label={`Delete ${beatTitle}`}
      /* size-9 rather than the variant's size-7/8 — this is the only control
         in the row and it needs to be hittable on a touch screen. */
      className="size-9 rounded-none text-smoke hover:bg-destructive/15 hover:text-destructive dark:hover:bg-destructive/15"
    >
      <Trash2 aria-hidden className="size-4" />
    </Button>
  );
}
