import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sends an admin email for a record the signed-in student just created.
 * The record is re-read server-side and ownership is verified before sending.
 */
export const notifySubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { kind: "tuition_request" | "complaint" | "replacement_request"; id: string }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { notifyAdmin } = await import("@/lib/notify.server");

    const profile = await supabaseAdmin
      .from("profiles")
      .select("full_name, phone")
      .eq("id", context.userId)
      .maybeSingle();
    const who = profile.data;

    if (data.kind === "tuition_request") {
      const { data: row } = await supabaseAdmin
        .from("tuition_requests")
        .select("*")
        .eq("id", data.id)
        .eq("student_id", context.userId)
        .maybeSingle();
      if (!row) throw new Error("Request not found");
      await notifyAdmin({
        type: "tuition_request",
        subject: "New Tuition Requirement Posted",
        lines: [
          ["Student", who?.full_name ?? "—"],
          ["Mobile", who?.phone ?? "—"],
          ["Class", row.student_class],
          ["Board", row.board],
          ["Subjects", (row.subjects ?? []).join(", ")],
          ["Location", row.location],
          ["Preferred days", (row.preferred_days ?? []).join(", ")],
          ["Preferred time", row.preferred_time],
          ["Mode", row.teaching_mode],
          ["Requirements", row.requirements],
        ],
        payload: { id: row.id },
      });
      return { ok: true as const };
    }

    if (data.kind === "complaint") {
      const { data: row } = await supabaseAdmin
        .from("complaints")
        .select("*, teachers(full_name)")
        .eq("id", data.id)
        .eq("student_id", context.userId)
        .maybeSingle();
      if (!row) throw new Error("Complaint not found");
      await notifyAdmin({
        type: "complaint",
        subject: "New Complaint Submitted",
        lines: [
          ["Student", who?.full_name ?? "—"],
          ["Mobile", who?.phone ?? "—"],
          ["Category", row.category],
          ["Teacher", (row as { teachers?: { full_name?: string } }).teachers?.full_name ?? "—"],
          ["Details", row.details],
        ],
        payload: { id: row.id },
      });
      return { ok: true as const };
    }

    const { data: row } = await supabaseAdmin
      .from("replacement_requests")
      .select("*, teachers:current_teacher_id(full_name)")
      .eq("id", data.id)
      .eq("student_id", context.userId)
      .maybeSingle();
    if (!row) throw new Error("Replacement request not found");
    await notifyAdmin({
      type: "replacement_request",
      subject: "Teacher Replacement Request",
      lines: [
        ["Student", who?.full_name ?? "—"],
        ["Mobile", who?.phone ?? "—"],
        ["Current teacher", (row as { teachers?: { full_name?: string } }).teachers?.full_name ?? "—"],
        ["Reason", row.reason],
        ["Requirements", row.requirements],
        ["Preferred timing", row.preferred_timing],
        ["Additional info", row.extra_info],
      ],
      payload: { id: row.id },
    });
    return { ok: true as const };
  });
