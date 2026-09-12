-- Apply once with the migration/owner account. Never run on startup.
-- Duplicate normalized emails abort the entire migration without deleting data.
BEGIN;
CREATE UNIQUE INDEX users_email_normalized_key ON public.users (lower(btrim(email)));
CREATE TABLE public.auth_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (expires_at > created_at)
);
CREATE INDEX auth_sessions_user_active ON public.auth_sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX auth_sessions_expiry ON public.auth_sessions(expires_at);
CREATE TABLE public.password_reset_tokens (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (expires_at > created_at)
);
CREATE INDEX password_reset_user_unused ON public.password_reset_tokens(user_id) WHERE used_at IS NULL;
CREATE INDEX password_reset_expiry ON public.password_reset_tokens(expires_at);
COMMIT;
