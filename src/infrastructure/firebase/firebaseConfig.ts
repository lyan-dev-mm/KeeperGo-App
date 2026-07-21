import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyCVoDZVwXvzvFuhUVHbn3A_CVi9ebqbVTM',
  authDomain: 'keeper-go-112cf.firebaseapp.com',
  projectId: 'keeper-go-112cf',
  storageBucket: 'keeper-go-112cf.firebasestorage.app',
  messagingSenderId: '501348665334',
  appId: '1:501348665334:android:6c7c606746658d9b6229d7',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(firebaseApp);
} else {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { auth };