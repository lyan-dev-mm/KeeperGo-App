const ADMIN_EMAILS = ['emanuelmorales200523@gmail.com', 'moralesjose7331@gmail.com','lizbethmartinezmtz05@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}