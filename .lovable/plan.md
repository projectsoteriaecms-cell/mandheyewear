

## Re-enable Leaked Password Protection

**What**: Enable the Have I Been Pwned (HIBP) password check on the authentication system so that signups and password changes are validated against known breached password databases.

**How**: Use the `configure_auth` tool with `password_hibp_enabled: true`. This is a single configuration change — no code or database modifications needed.

