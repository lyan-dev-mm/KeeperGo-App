import { auth } from './firebaseConfig';
import { UserProfileRepositoryImpl } from '../../data/repositories/auth/UserProfileRepositoryImpl';
import { UserProfileEntity } from '../../domain/entities/auth/UserProfile';

const repository = new UserProfileRepositoryImpl();

/**
 * Guarda o actualiza el perfil del usuario autenticado en Firestore.
 * Mapea los datos del formulario a la estructura solicitada.
 */
export async function saveUserProfile(profileData: Partial<UserProfileEntity>): Promise<void> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No hay un usuario autenticado.');
  }

  const uid = currentUser.uid;
  const email = currentUser.email || '';

  // Construimos el objeto base
  const fullProfile: Partial<UserProfileEntity> = {
    ...profileData,
    uid,
    email,
  };

  // Intentamos obtener el perfil existente para decidir si crear o actualizar
  const existingProfile = await repository.getUserProfile(uid);

  if (existingProfile) {
    await repository.updateUserProfile(uid, fullProfile);
  } else {
    // Si no existe, nos aseguramos de que tenga los campos requeridos mínimos según su tipo
    await repository.createUserProfile(fullProfile as UserProfileEntity);
  }
}

/**
 * Recupera el perfil del usuario autenticado.
 */
export async function getUserProfile(): Promise<UserProfileEntity | null> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No hay un usuario autenticado.');
  }

  return await repository.getUserProfile(currentUser.uid);
}
