import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_ME_KEY = 'rememberMe';

export async function setRememberMe(value: boolean): Promise<void> {
  await AsyncStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(value));
}

export async function getRememberMe(): Promise<boolean> {
  const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
  return value ? JSON.parse(value) : false;
}