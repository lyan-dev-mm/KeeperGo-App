export type CloudinaryAssetInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  asset_id?: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  resource_type?: string;
  created_at?: string;
};

export async function uploadImageToCloudinary(
  asset: CloudinaryAssetInput
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error('Falta EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME en el archivo .env');
  }

  if (!uploadPreset) {
    throw new Error('Falta EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET en el archivo .env');
  }

  const formData = new FormData();

  // En React Native, para subir archivos no debemos usar 'as unknown as Blob'
  // sino pasar el objeto con uri, type y name directamente.
  const fileToUpload = {
    uri: asset.uri,
    type: asset.mimeType || 'image/jpeg',
    name: asset.fileName || `upload_${Date.now()}.jpg`,
  };

  formData.append('file', fileToUpload as any);

  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Error al subir imagen a Cloudinary');
  }

  return data as CloudinaryUploadResult;
}
