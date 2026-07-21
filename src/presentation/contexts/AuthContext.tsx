import React, { createContext, useState, ReactNode } from 'react';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/RegisterUseCase';
import { UserEntity } from '../../domain/entities/User';

interface AuthContextType {
  user: UserEntity | null;
  isLoading: boolean;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const repository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(repository);
const registerUseCase = new RegisterUseCase(repository);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
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
    fullName?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await registerUseCase.execute(email, password, fullName);
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

  const clearError = () => setErrorMessage(null);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, errorMessage, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}