import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  AuthError,
} from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/firebaseConfig';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { UserEntity } from '../../domain/entities/User';
import {
  setRememberMe as saveRememberMe,
  getRememberMe as readRememberMe,
} from '../../infrastructure/storage/preferences';

function handleFirebaseError(error: AuthError): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Usuario no encontrado.';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta.';
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado.';
    case 'auth/invalid-email':
      return 'Correo electrónico inválido.';
    default:
      return `Error: ${error.message}`;
  }
}

export class AuthRepositoryImpl implements AuthRepository {
  async login(email: string, password: string): Promise<UserEntity | null> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      return {
        id: user.uid,
        email: user.email ?? '',
        name: user.displayName ?? '',
      };
    } catch (error) {
      throw new Error(handleFirebaseError(error as AuthError));
    }
  }

  async register(email: string, password: string, fullName?: string): Promise<UserEntity | null> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateProfile(result.user, { displayName: fullName });
      }
      return {
        id: result.user.uid,
        email: result.user.email ?? '',
        name: fullName ?? '',
      };
    } catch (error) {
      throw new Error(handleFirebaseError(error as AuthError));
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async setRememberMe(value: boolean): Promise<void> {
    await saveRememberMe(value);
  }

  async getRememberMe(): Promise<boolean> {
    return readRememberMe();
  }
}