/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 */
export const publicRoutes: string[] = [
  "^/$",
  "^/blog$",
  "^/blog/[^/]+$",
  "^/new-verification$",
  "^/practice(/.*)?$",   // Matches /practice and any subpath
  "^/notes(/.*)?$",       // Matches /note and any subpath
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged-in users to /settings
 */
export const authRoutes: string[] = [
  "^/sign-in$",
  "^/sign-up$",
  "^/auth/error$",
  "^/forgot-password$",
  "^/new-password$"
];

/**
 * Dynamic route patterns that require authentication
 */
export const dynamicAuthRoutes: string[] = [
  // Add patterns here if you have routes that require authentication
  "^/studio$",
  "^/home$",
  "^/settings$",
  "^/summaries$",
  "^/flash-cards$",
  "^/edit-deck(/.*)?$",  // Matches /edit-deck and any subpath
];

/**
 * The prefix for API authentication routes
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/home";

/**
 * Check if a route matches any of the given patterns
 * @param route - The route to check
 * @param patterns - An array of regex patterns
 * @returns True if the route matches any pattern
 */
export const isRouteMatch = (route: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => new RegExp(pattern).test(route));
};
