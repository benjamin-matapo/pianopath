const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password. Please try again.",
  invalid_grant: "Incorrect email or password. Please try again.",
  email_not_confirmed:
    "Please confirm your email before signing in. Check your inbox for a verification link.",
  user_already_registered:
    "An account with this email already exists. Try signing in instead.",
  weak_password: "Password must be at least 6 characters long.",
  signup_disabled: "New sign-ups are currently disabled. Please try again later.",
  over_email_send_rate_limit:
    "Too many emails sent. Please wait a few minutes and try again.",
  over_request_rate_limit:
    "Too many attempts. Please wait a moment and try again.",
  auth_callback_error:
    "We couldn't complete sign-in. Please try again or use a different method.",
};

export function getAuthErrorMessage(error: unknown, fallback?: string): string {
  if (!error) {
    return fallback ?? "Something went wrong. Please try again.";
  }

  if (typeof error === "string") {
    return AUTH_ERROR_MESSAGES[error] ?? error;
  }

  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();

    if (normalized.includes("invalid login credentials")) {
      return AUTH_ERROR_MESSAGES.invalid_credentials;
    }

    if (normalized.includes("email not confirmed")) {
      return AUTH_ERROR_MESSAGES.email_not_confirmed;
    }

    if (normalized.includes("user already registered")) {
      return AUTH_ERROR_MESSAGES.user_already_registered;
    }

    if (normalized.includes("password")) {
      return AUTH_ERROR_MESSAGES.weak_password;
    }

    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return getAuthErrorMessage(String(error.message), fallback);
  }

  return fallback ?? "Something went wrong. Please try again.";
}
