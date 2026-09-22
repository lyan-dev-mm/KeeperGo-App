import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/firebaseConfig';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/RegisterUseCase';
import { UserEntity } from '../../domain/entities/User';

interface AuthContextType {
  user: UserEntity | null;
  isLoading: boolean;
  isInitializing: boolean;
  errorMessage: string | null;

  login: (email: string, password: string) => Promise<boolean>;

  register: (
    email: string,
    password: string,
    names: {
      nombres: string;
      primerApellido: string;
      segundoApellido: string;
    }
  ) => Promise<boolean>;

  logout: () => Promise<void>;
  clearError: () => void;

  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<UserEntity | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const repository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(repository);
const registerUseCase = new RegisterUseCase(repository);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        '🔥 onAuthStateChanged disparado. Usuario:',
        firebaseUser?.email ?? 'NINGUNO'
      );

      if (firebaseUser) {
        try {
          // Verificar si la cuenta fue deshabilitada por un administrador.
          const disabled = await repository.isAccountDisabled(
            firebaseUser.uid
          );

          if (disabled) {
            await repository.logout();
            setUser(null);
            setIsInitializing(false);
            return;
          }
        } catch (error) {
          // Si falla la consulta por un problema temporal de conexión,
          // no bloqueamos el acceso del usuario.
          console.warn(
            'No se pudo verificar el estado de la cuenta:',
            error
          );
        }

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName ?? '',
          nombres: firebaseUser.displayName ?? '',
          primerApellido: '',
          segundoApellido: '',
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }

      setIsInitializing(false);
    });

    return unsubscribe;
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginUseCase.execute(email, password);

      setUser(result);
      setIsLoading(false);

      return result != null;
    } catch (error) {
      setErrorMessage((error as Error).message);
      setIsLoading(false);

      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    names: {
      nombres: string;
      primerApellido: string;
      segundoApellido: string;
    }
  ): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await registerUseCase.execute(
        email,
        password,
        names
      );

      setUser(result);
      setIsLoading(false);

      return result != null;
    } catch (error) {
      setErrorMessage((error as Error).message);
      setIsLoading(false);

      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await repository.logout();
    setUser(null);
  };

  const clearError = (): void => {
    setErrorMessage(null);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    await repository.sendVerificationEmail();
  };

  const refreshUser = async (): Promise<UserEntity | null> => {
    const result = await repository.reloadCurrentUser();

    setUser(result);

    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitializing,
        errorMessage,
        login,
        register,
        logout,
        clearError,
        sendVerificationEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}