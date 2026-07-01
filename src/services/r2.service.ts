import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/environment';
import { logger } from '../utils/logger.util';

interface UploadResult {
  fileId: string;
  fileUrl: string;
  fileName: string;
}

class R2Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string,
  ): Promise<UploadResult> {
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = folder
      ? `${folder}/${Date.now()}-${sanitizedName}`
      : `${Date.now()}-${sanitizedName}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const fileUrl = `${env.R2_PUBLIC_URL}/${env.R2_BUCKET_NAME}/${key}`;
      logger.info(`File uploaded to R2: ${key}`);

      return { fileId: key, fileUrl, fileName: sanitizedName };
    } catch (error) {
      logger.error(`R2 upload error: ${error}`);
      throw new Error(`Failed to upload file to R2: ${(error as Error).message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: key,
        }),
      );
      logger.info(`File deleted from R2: ${key}`);
    } catch (error) {
      logger.error(`R2 delete error: ${error}`);
      throw new Error(`Failed to delete file from R2: ${(error as Error).message}`);
    }
  }
}

export const r2Service = new R2Service();
