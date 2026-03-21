export const ADMIN_EMAIL = "anshulraturi51@gmail.com";
export const WORKSPACE_STORAGE_KEY = "max-ai.workspace";
export const LEGACY_WORKSPACE_STORAGE_KEYS = ["raturihub.workspace"];

export function isAdminEmail(email = "") {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
