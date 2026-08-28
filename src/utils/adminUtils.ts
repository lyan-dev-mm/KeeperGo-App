// Lista de correos con acceso al panel de administración.
// Agrega aquí más correos si otros compañeros de equipo necesitan acceso.
const ADMIN_EMAILS = ['jose1@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}