import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendEmailVerification,
  reload,
  AuthError,
} from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/firebaseConfig';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { UserEntity } from '../../domain/entities/User';
import {
  setRememberMe as saveRememberMe,
  getRememberMe as readRememberMe,
} from '../../infrastructure/storage/preferences';
import { UserProfileRepositoryImpl } from './auth/UserProfileRepositoryImpl';

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

const userProfileRepository = new UserProfileRepositoryImpl();

export class AuthRepositoryImpl implements AuthRepository {
  async login(email: string, password: string): Promise<UserEntity | null> {
    const result = await signInWithEmailAndPassword(auth, email, password).catch((error) => {
      throw new Error(handleFirebaseError(error as AuthError));
    });

    const user = result.user;

    // Auto-reparación: si esta cuenta no tiene un documento de perfil en
    // Firestore (por ejemplo, se creó antes de conectar este flujo), lo
    // creamos aquí para que aparezca en el panel de admin.
    let profile = await userProfileRepository.getUserProfile(user.uid);
    if (!profile) {
      await userProfileRepository.createUserProfile({
        uid: user.uid,
        email: user.email ?? '',
        profileType: 'normal',
        generalInfo: {
          username: user.displayName ?? '',
        },
        disabled: false,
      });
      profile = await userProfileRepository.getUserProfile(user.uid);
    }

    if (profile?.disabled) {
      await signOut(auth);
      throw new Error('Tu cuenta ha sido dada de baja. Contacta al administrador.');
    }

    return {
      id: user.uid,
      email: user.email ?? '',
      name: user.displayName ?? '',
      emailVerified: user.emailVerified,
    };
  }

  async register(email: string, password: string, fullName?: string): Promise<UserEntity | null> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateProfile(result.user, { displayName: fullName });
      }

      try {
        await userProfileRepository.createUserProfile({
          uid: result.user.uid,
          email: result.user.email ?? '',
          profileType: 'normal',
          generalInfo: {
            username: fullName ?? '',
          },
          disabled: false,
        });
      } catch (profileError) {
        console.error('❌ Error al crear el perfil del usuario en Firestore:', profileError);
      }

      try {
        await sendEmailVerification(result.user);
      } catch (verificationError) {
        console.warn('No se pudo enviar el correo de verificación al registrar:', verificationError);
      }

      return {
        id: result.user.uid,
        email: result.user.email ?? '',
        name: fullName ?? '',
        emailVerified: result.user.emailVerified,
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

  async sendVerificationEmail(): Promise<void> {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
  }

  async reloadCurrentUser(): Promise<UserEntity | null> {
    if (!auth.currentUser) return null;
    await reload(auth.currentUser);
    const user = auth.currentUser;
    return {
      id: user.uid,
      email: user.email ?? '',
      name: user.displayName ?? '',
      emailVerified: user.emailVerified,
    };
  }

  async isAccountDisabled(uid: string): Promise<boolean> {
    const profile = await userProfileRepository.getUserProfile(uid);
    return profile?.disabled === true;
  }
}