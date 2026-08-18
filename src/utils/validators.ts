export const Validators = {
  validateEmail(value: string): string | null {
    if (!value) return 'El correo es obligatorio';
    const emailRegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegExp.test(value)) return 'Correo electrónico inválido';
    return null;
  },

  validatePassword(value: string): string | null {
    if (!value) return 'La contraseña es obligatoria';
    if (value.length < 8) return 'Mínimo 8 caracteres';
    return null;
  },

  validateConfirmPassword(value: string, password: string): string | null {
    if (!value) return 'Confirma tu contraseña';
    if (value !== password) return 'Las contraseñas no coinciden';
    return null;
  },
};