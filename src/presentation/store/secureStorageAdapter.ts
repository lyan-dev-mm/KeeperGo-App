import SecureStorage from '../../services/secureStorage';

/**
 * Adaptador para usar SecureStorage como almacenamiento de Zustand
 * Convierte SecureStorage en un storage compatible con el middleware persist de Zustand
 */
export const secureStorageAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await SecureStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('[secureStorageAdapter] Error al obtener item:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: any) => {
    try {
      await SecureStorage.setItem(key, value);
    } catch (error) {
      console.error('[secureStorageAdapter] Error al guardar item:', error);
    }
  },
  
  removeItem: async (key: string) => {
    try {
      await SecureStorage.removeItem(key);
    } catch (error) {
      console.error('[secureStorageAdapter] Error al eliminar item:', error);
    }
  },
};