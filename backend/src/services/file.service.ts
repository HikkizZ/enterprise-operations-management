import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { configEnv } from '../config/configEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const UPLOAD_DIR = path.join(BACKEND_ROOT, configEnv.storage.uploadDir);

const FOLDERS = {
    contracts: path.join(UPLOAD_DIR, 'contracts'),
    leaves: path.join(UPLOAD_DIR, 'leaves'),
    general: path.join(UPLOAD_DIR, 'general'),
} as const;

export type UploadFolder = keyof typeof FOLDERS;

export function ensureUploadDirectories(): void {
    Object.values(FOLDERS).forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
}

function buildStorage(folder: UploadFolder): multer.StorageEngine {
    return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, FOLDERS[folder]),
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${unique}${ext}`);
        }
    });
}

const pdfFilter: NonNullable<multer.Options['fileFilter']> = (_req, file, cb) => {
    const validMime = file.mimetype === 'application/pdf';
    const validExt = path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!validMime || !validExt) {
        cb(new Error('Solo se permiten archivos PDF'));
        return;
    }
    cb(null, true);
}

export function uploadPdf(folder: UploadFolder) {
    return multer({
        storage: buildStorage(folder),
        fileFilter: pdfFilter,
        limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB
    }).single('file');
}

export async function deleteFile(filePath: string): Promise<boolean> {
    try {
        await fs.promises.access(filePath);
        await fs.promises.unlink(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export function getFilePath(folder: UploadFolder, filename: string): string {
    return path.join(FOLDERS[folder], path.basename(filename));
}