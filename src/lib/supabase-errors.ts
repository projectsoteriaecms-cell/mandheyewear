/**
 * Maps Supabase / PostgREST error codes to actionable user-facing messages.
 *
 * Usage:
 *   const { title, detail, isRls } = classifySbError(error);
 */

export interface ClassifiedError {
  title: string;
  detail: string;
  /** True when the failure is an RLS / permission issue. */
  isRls: boolean;
  /** True when it's a transient network / timeout issue worth retrying. */
  isTransient: boolean;
  /** Original error for logging. */
  raw: unknown;
}

// PostgREST error codes that indicate RLS or insufficient privilege
const RLS_CODES = new Set(["42501", "PGRST301", "PGRST302", "PGRST116"]);

// PostgREST / HTTP codes that are transient
const TRANSIENT_CODES = new Set(["PGRST000", "503", "504", "ETIMEDOUT"]);

export function classifySbError(err: unknown): ClassifiedError {
  // Supabase client errors have { code, message, details, hint }
  const code: string = (err as any)?.code ?? (err as any)?.status ?? "";
  const msg: string  = (err as any)?.message ?? String(err ?? "Unknown error");

  const isRls      = RLS_CODES.has(code) || /row.level security|insufficient privilege|permission denied/i.test(msg);
  const isTransient = TRANSIENT_CODES.has(code) || /network|timeout|fetch/i.test(msg);

  if (isRls) {
    return {
      title:  "Access denied",
      detail: "Your account does not have permission to perform this action. "
              + "Contact your administrator to update your role.",
      isRls:      true,
      isTransient: false,
      raw:    err,
    };
  }

  if (isTransient) {
    return {
      title:  "Connection issue",
      detail: "Could not reach the server. Please check your connection and try again.",
      isRls:      false,
      isTransient: true,
      raw:    err,
    };
  }

  // Unique-constraint violation
  if (code === "23505") {
    return {
      title:  "Duplicate entry",
      detail: (err as any)?.details ?? "This record already exists.",
      isRls:      false,
      isTransient: false,
      raw:    err,
    };
  }

  // Foreign-key violation
  if (code === "23503") {
    return {
      title:  "Related record not found",
      detail: (err as any)?.details ?? "A required related record no longer exists.",
      isRls:      false,
      isTransient: false,
      raw:    err,
    };
  }

  return {
    title:  "Something went wrong",
    detail: msg,
    isRls:      false,
    isTransient: false,
    raw:    err,
  };
}
