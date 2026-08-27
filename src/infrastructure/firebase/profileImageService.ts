import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { pickAndUploadImageToCloudinary } from '../cloudinary/cloudinaryUploadService';

export async function uploadCurrentUserProfileImage() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No hay un usuario autenticado.');
  }

  const uploadedImage = await pickAndUploadImageToCloudinary();

  if (!uploadedImage) {
    return null;
  }

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
