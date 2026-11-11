// Creates a platform admin (or promotes an existing admin-only account).
// Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> "<name>" [role]
// Roles: super_admin (default), operations_admin, finance_admin, support_admin
import { createClient } from "@supabase/supabase-js";

const [email, password, name = "", role = "super_admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> "<name>" [role]');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// No username in user_metadata, so the sign-up trigger creates no creator profile.
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { kind: "admin" },
});
if (error) {
  console.error("Could not create user:", error.message);
  process.exit(1);
}

const { error: roleError } = await supabase.from("admin_users").insert({ user_id: data.user.id, role, name });
if (roleError) {
  console.error("Could not assign role:", roleError.message);
  await supabase.auth.admin.deleteUser(data.user.id);
  process.exit(1);
}

console.log(`Admin created: ${email} (${role}). Sign in at /admin/login.`);
