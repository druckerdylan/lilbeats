import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("beats").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not delete beat." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
