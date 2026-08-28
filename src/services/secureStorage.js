// src/services/SecureStorage.js
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const SecureStorage = {
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (isWeb) {
        localStorage.setItem(key, stringValue);
        console.log(` [SecureStorage] Guardado en localStorage: ${key}`);
        return true;
      }
      await SecureStore.setItemAsync(key, stringValue);
      console.log(` [SecureStorage] Guardado: ${key}`);
      return true;
    } catch (error) {
      console.error(` [SecureStorage] Error guardando [${key}]:`, error);
      return false;
    }
  },

  async getItem(key) {
    try {
      if (isWeb) {
        const value = localStorage.getItem(key);
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(` [SecureStorage] Error recuperando [${key}]:`, error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
        console.log(` [SecureStorage] Eliminado de localStorage: ${key}`);
        return true;
      }
      await SecureStore.deleteItemAsync(key);
      console.log(` [SecureStorage] Eliminado: ${key}`);
      return true;
    } catch (error) {
      console.error(` [SecureStorage] Error eliminando [${key}]:`, error);
      return false;
    }
  },
  async clearAll() {
    try {
      await this.removeItem('auth_token');
      await this.removeItem('user_data');
      await this.removeItem('session_start');
      await this.removeItem('bitacora_historial');
      await this.removeItem('bitacora_ultimo');
      console.log(' [SecureStorage] Almacenamiento limpiado');
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error limpiando:', error);
      return false;
    }
  },

  async saveSession(token, userData = null) {
    try {
      await this.setItem('auth_token', token);
      if (userData) {
        await this.setItem('user_data', userData);
      }
      await this.setItem('session_start', Date.now());
      console.log(' [SecureStorage] Sesión guardada');
      return true;
    } catch (error) {
      console.error(' [SecureStorage] Error guardando sesión:', error);
      return false;
    }
  },

  async getSession() {
    try {
      const token = await this.getItem('auth_token');
      if (!token) return null;
      const userData = await this.getItem('user_data');
      const sessionStart = await this.getItem('session_start');
      return { token, userData, sessionStart };
    } catch (error) {
      console.error(' [SecureStorage] Error recuperando sesión:', error);
      return null;
    }
  },

  async clearSession() {
    try {
      await this.removeItem('auth_token');
      await this.removeItem('user_data');
      await this.removeItem('session_start');
      console.log(' [SecureStorage] Sesión eliminada');
      return true;
    } catch (error) {
      console.error(' [SecureStorage] Error eliminando sesión:', error);
      return false;
    }
  },

  async hasSession() {
    try {
      const token = await this.getItem('auth_token');
      return token !== null;
    } catch (error) {
      return false;
    }
  }
};

export default SecureStorage;