import { pickImageFromLibrary } from '../media/imagePickerService';
import { uploadImageToCloudinary } from './cloudinaryService';

export async function pickAndUploadImageToCloudinary() {
  const selectedImage = await pickImageFromLibrary();

  if (!selectedImage) {
    return null;
  }

  const uploadedImage = await uploadImageToCloudinary({
    uri: selectedImage.uri,
    fileName: selectedImage.fileName ?? `keepergo_${Date.now()}.jpg`,
    mimeType: selectedImage.mimeType ?? 'image/jpeg',
  });

  return uploadedImage;
}