import EncryptedStorage from 'react-native-encrypted-storage';

export const SecureStorageService = {
    // 1. Guardar datos de forma segura
    async setItem(key, value) {
        try {
            // Si el valor es un objeto o arreglo, lo convertimos a texto
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
            await EncryptedStorage.setItem(key, stringValue);
            return true;
        } catch (error) {
            console.error(`Error guardando de forma segura [${key}]:`, error);
            return false;
        }
    },

    // 2. Recuperar datos encriptados
    async getItem(key) {
        try {
            const value = await EncryptedStorage.getItem(key);
            if (value) {
                // Si el texto parece un objeto/arreglo JSON, lo transformamos de vuelta
                try {
                    return JSON.parse(value);
                } catch {
                    return value; // Es un texto plano
                }
            }
            return null;
        } catch (error) {
            console.error(`Error recuperando datos seguros [${key}]:`, error);
            return null;
        }
    },

    // 3. Eliminar un dato en específico (ej. borrar token al cerrar sesión)
    async removeItem(key) {
        try {
            await EncryptedStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error eliminando dato seguro [${key}]:`, error);
            return false;
        }
    },

    // 4. Limpiar todo el almacén por completo
    async clearAll() {
        try {
            await EncryptedStorage.clear();
            return true;
        } catch (error) {
            console.error("Error limpiando almacenamiento encriptado:", error);
            return false;
        }
    }
};