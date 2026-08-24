/** Return an error message string, or null if valid. */
export function validEmail(email: string): string | null {
  const e = email.trim();
  if (!e) return "Email is required.";
  if (e.length > 320) return "Email is too long.";
  // pragmatic RFC-ish check; the browser also enforces type="email"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return "Enter a valid email address.";
  return null;
}

export function validName(name: string, max = 80): string | null {
  const n = name.trim();
  if (!n) return "This field is required.";
  if (n.length > max) return `Keep it under ${max} characters.`;
  return null;
}

export function validText(v: string | undefined | null, required: boolean, max = 5000): string | null {
  const t = (v ?? "").trim();
  if (required && !t) return "This field is required.";
  if (t.length > max) return `Keep it under ${max} characters.`;
  return null;
}

/** Single-audience dedupe: drop empty/whitespace strings. */
export function cleanOptional(v: string | undefined | null): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}