import { createServerFn } from "@tanstack/react-start";

import { phoneToEmail } from "@/lib/brand";
import { studentRegistrationSchema, teacherRegistrationSchema } from "@/lib/validation";

export const registerStudent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => studentRegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { notifyAdmin } = await import("@/lib/notify.server");

    const existing = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", data.phone)
      .maybeSingle();
    if (existing.data) {
      throw new Error("This mobile number is already registered. Please login instead.");
    }

    const created = await supabaseAdmin.auth.admin.createUser({
      email: phoneToEmail(data.phone),
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, phone: data.phone, role: "student" },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create the account");
    }
    const userId = created.data.user.id;

    const profile = await supabaseAdmin.from("profiles").insert({
      id: userId,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
    });
    if (profile.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profile.error.message);
    }

    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "student" });
    const student = await supabaseAdmin.from("students").insert({
      id: userId,
      student_class: data.studentClass,
      board: data.board,
      subjects: data.subjects,
      location: data.location,
      preferred_timing: data.preferredTiming || null,
      teaching_mode: data.teachingMode,
    });
    if (student.error) throw new Error(student.error.message);

    await notifyAdmin({
      type: "student_registration",
      subject: "New Student Registration",
      lines: [
        ["Name", data.fullName],
        ["Mobile", data.phone],
        ["Email", data.email || "—"],
        ["Class", data.studentClass],
        ["Board", data.board],
        ["Subjects", data.subjects.join(", ")],
        ["Location", data.location],
        ["Preferred timing", data.preferredTiming || "—"],
        ["Mode", data.teachingMode],
      ],
      payload: { userId, ...data, password: undefined },
    });

    return { ok: true as const, userId };
  });

export const registerTeacher = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => teacherRegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { notifyAdmin } = await import("@/lib/notify.server");

    const existing = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", data.phone)
      .maybeSingle();
    if (existing.data) {
      throw new Error("This mobile number is already registered. Please login instead.");
    }

    const created = await supabaseAdmin.auth.admin.createUser({
      email: phoneToEmail(data.phone),
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, phone: data.phone, role: "teacher" },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create the account");
    }
    const userId = created.data.user.id;

    const profile = await supabaseAdmin.from("profiles").insert({
      id: userId,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
    });
    if (profile.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profile.error.message);
    }

    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "teacher" });

    const teacher = await supabaseAdmin
      .from("teachers")
      .insert({
        profile_id: userId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email || null,
        qualification: data.qualification,
        experience_years: data.experienceYears,
        subjects: data.subjects,
        classes: data.classes,
        boards: data.boards,
        location: data.location,
        teaching_modes: data.teachingModes,
        available_days: data.availableDays,
        available_from: data.availableFrom || null,
        available_to: data.availableTo || null,
        bio: data.bio || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (teacher.error) throw new Error(teacher.error.message);

    await notifyAdmin({
      type: "teacher_application",
      subject: "New Teacher Application",
      lines: [
        ["Name", data.fullName],
        ["Mobile", data.phone],
        ["Email", data.email || "—"],
        ["Qualification", data.qualification],
        ["Experience", `${data.experienceYears} years`],
        ["Subjects", data.subjects.join(", ")],
        ["Classes", data.classes.join(", ")],
        ["Boards", data.boards.join(", ")],
        ["Location", data.location],
        ["Modes", data.teachingModes.join(", ")],
        ["Available", `${data.availableDays.join(", ")} ${data.availableFrom ?? ""}-${data.availableTo ?? ""}`],
      ],
      payload: { userId, teacherId: teacher.data.id },
    });

    return { ok: true as const, userId, teacherId: teacher.data.id };
  });

/** One-time bootstrap of the platform administrator. No-op once an admin exists. */
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string; password: string; fullName: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const existingAdmin = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);
    if (existingAdmin.data && existingAdmin.data.length > 0) {
      return { ok: false as const, reason: "admin_exists" };
    }

    const created = await supabaseAdmin.auth.admin.createUser({
      email: phoneToEmail(data.phone),
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, phone: data.phone, role: "admin" },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create admin");
    }
    const userId = created.data.user.id;
    await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, full_name: data.fullName, phone: data.phone });
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
    return { ok: true as const, userId };
  });
