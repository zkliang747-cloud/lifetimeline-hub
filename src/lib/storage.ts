import { S3Storage } from 'coze-coding-dev-sdk';

let storageInstance: S3Storage | null = null;

export function getStorage(): S3Storage {
  if (!storageInstance) {
    storageInstance = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || '',
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME || '',
      region: 'cn-beijing',
    });
  }
  return storageInstance;
}

export async function uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const storage = getStorage();
  // sanitize filename
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `timeline/${Date.now()}_${safeName}`;
  
  const actualKey = await storage.uploadFile({
    fileContent: fileBuffer,
    fileName: key,
    contentType,
  });
  
  // Generate presigned URL
  const url = await storage.generatePresignedUrl({
    key: actualKey,
    expireTime: 86400 * 365, // 1 year for persistent content
  });
  
  return url || actualKey;
}

export async function deleteFile(key: string): Promise<boolean> {
  const storage = getStorage();
  try {
    return await storage.deleteFile({ fileKey: key });
  } catch {
    return false;
  }
}

export function getFileKeyFromUrl(url: string): string {
  // Extract the key from the presigned URL
  // The key is typically the path after the bucket endpoint
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // The key is everything after the bucket name
    // For presigned URLs, it might be encoded differently
    return decodeURIComponent(pathParts.slice(2).join('/'));
  } catch {
    return url;
  }
}