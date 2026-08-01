type ErrorReportContext = Record<string, unknown>;

export function reportAppError(error: unknown, context: ErrorReportContext = {}) {
  if (typeof window === "undefined") return;

  console.error("[app-error]", {
    error,
    route: window.location.pathname,
    ...context,
  });
}
