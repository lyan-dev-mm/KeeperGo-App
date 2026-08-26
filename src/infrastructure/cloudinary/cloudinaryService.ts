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

  formData.append('file', {
    uri: asset.uri,
    name: asset.fileName ?? `keepergo_${Date.now()}.jpg`,
    type: asset.mimeType ?? 'image/jpeg',
  } as unknown as Blob);

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
