import { useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../../infrastructure/firebase/userProfileService';
import { UserProfileEntity } from '../../domain/entities/auth/UserProfile';
import { auth } from '../../infrastructure/firebase/firebaseConfig';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserProfile();
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Error al obtener el perfil');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Suscribirse a cambios de autenticación para recargar el perfil si el usuario cambia
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile();
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refreshProfile: fetchProfile
  };
}
