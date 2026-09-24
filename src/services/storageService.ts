import { supabase } from '../../utils/supabase';

// Bucket rotation: seniors-1 → seniors-2 → seniors-3
const BUCKETS = ['seniors-1', 'seniors-2', 'seniors-3'];
const BUCKET_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB per bucket

/**
 * Finds the first bucket that still has space (< 50MB used).
 * Falls back to last bucket if all are full.
 */
async function getAvailableBucket(): Promise<string> {
  for (const bucket of BUCKETS) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', {
        limit: 1000,
      });

      if (error) {
        console.warn(`Error checking bucket ${bucket}:`, error.message);
        continue;
      }

      // Calculate total size of files in bucket
      const totalSize = (data || []).reduce((sum, file) => sum + (file.metadata?.size || 0), 0);

      if (totalSize < BUCKET_SIZE_LIMIT) {
        return bucket;
      }
    } catch (err) {
      console.warn(`Failed to check bucket ${bucket}:`, err);
      continue;
    }
  }

  // All full — use last bucket as fallback
  return BUCKETS[BUCKETS.length - 1];
}

/**
 * Convert a base64 data URI to a Blob/File for upload.
 */
function base64ToBlob(base64DataUri: string): { blob: Blob; extension: string } {
  const [header, data] = base64DataUri.split(',');
  const mimeMatch = header.match(/data:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const extension = mime.split('/')[1] || 'jpg';

  const byteString = atob(data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return {
    blob: new Blob([uint8Array], { type: mime }),
    extension,
  };
}

/**
 * Upload a profile photo (base64) to Supabase Storage.
 * Returns the public URL of the uploaded file.
 * 
 * Auto-selects bucket with available space (seniors-1 → seniors-2 → seniors-3).
 */
export async function uploadProfilePhoto(
  base64DataUri: string,
  seniorId: string
): Promise<string> {
  if (!base64DataUri || !base64DataUri.startsWith('data:')) {
    throw new Error('Invalid base64 image data');
  }

  const { blob, extension } = base64ToBlob(base64DataUri);
  const bucket = await getAvailableBucket();
  const fileName = `${seniorId}_${Date.now()}.${extension}`;
  const filePath = `photos/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload a user profile photo (base64) to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadUserPhoto(
  base64DataUri: string,
  userId: string
): Promise<string> {
  if (!base64DataUri || !base64DataUri.startsWith('data:')) {
    throw new Error('Invalid base64 image data');
  }

  const { blob, extension } = base64ToBlob(base64DataUri);
  const bucket = await getAvailableBucket();
  const fileName = `${userId}_${Date.now()}.${extension}`;
  const filePath = `user-photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`User photo upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload a signature image (base64) to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadSignature(
  base64DataUri: string,
  seniorId: string
): Promise<string> {
  if (!base64DataUri || !base64DataUri.startsWith('data:')) {
    throw new Error('Invalid base64 signature data');
  }

  const { blob, extension } = base64ToBlob(base64DataUri);
  const bucket = await getAvailableBucket();
  const fileName = `${seniorId}_sig_${Date.now()}.${extension}`;
  const filePath = `signatures/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Signature upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Delete a file from storage by its public URL.
 */
export async function deleteStorageFile(publicUrl: string): Promise<void> {
  if (!publicUrl) return;

  // Extract bucket and path from URL
  // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return;

  const [, bucket, filePath] = match;

  await supabase.storage.from(bucket).remove([filePath]);
}
