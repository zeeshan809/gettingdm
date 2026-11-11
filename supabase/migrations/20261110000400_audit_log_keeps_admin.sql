-- audit_logs is append-only, so "on delete set null" made admin accounts
-- undeletable once they had logged anything. Keep the id as plain history
-- (plus an email snapshot) instead of a foreign key.
alter table public.audit_logs drop constraint audit_logs_admin_id_fkey;
alter table public.audit_logs add column admin_email text;
