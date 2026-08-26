import { getAuth } from '@react-native-firebase/auth';
const auth = getAuth();
console.log('Usuario actual:', auth.currentUser);

import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';

import { pickAndUploadImageToCloudinary } from '../cloudinary/cloudinaryUploadService';

export async function uploadCurrentUserProfileImage() {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No hay un usuario autenticado.');
  }

  const uploadedImage = await pickAndUploadImageToCloudinary();

  if (!uploadedImage) {
    return null;
  }

  const db = getFirestore();

  const userRef = doc(db, 'users', currentUser.uid);

  await setDoc(
    userRef,
    {
      profileImage: {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
        format: uploadedImage.format ?? null,
        width: uploadedImage.width ?? null,
        height: uploadedImage.height ?? null,
        bytes: uploadedImage.bytes ?? null,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );

  return uploadedImage;
}