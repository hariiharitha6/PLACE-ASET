import multer from 'multer';
import { Request } from 'express';

// Configure multer memory storage
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

export const fileUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const isAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype) ||
      file.originalname.match(/\.(pdf|txt|md|docx|png|jpg|jpeg)$/i);

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a PDF, DOCX, TXT, or image file.`));
    }
  }
});
