import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@ism/prisma';
import fs from 'fs';

declare global {
    namespace Express {
        interface Request {
            savedFileId?: string;
        }
    }
}

async function generateId(): Promise<string> {
    while (true) {
        const id = uuidv4();
        const existing = await prisma.file.findUnique({ where: { id }, select: { id: true } });
        if (!existing) return id;
    }
}

const storage = multer.diskStorage({
    destination: async (req, _file, cb) => {
        const { title, cid, author, did, description } = req.body as {
            title?: string;
            cid?: string;
            author?: string;
            did?: string;
            description?: string;
        };
        if (!(title && cid && author && did && description)) {
            return cb(new Error('missing parameter.'), '');
        }

        const category = await prisma.category.findUnique({ where: { id: parseInt(cid, 10) }, select: { id: true } });
        if (!category) {
            return cb(new Error('category not found.'), '');
        }

        const document = await prisma.document.findUnique({ where: { id: did }, select: { id: true } });
        if (!document) {
            return cb(new Error('document not found.'), '');
        }

        const documentPath = path.join(process.cwd(), process.env.STORAGE_DIR!, did);
        if (!fs.existsSync(documentPath)) {
            return cb(new Error('document not found in server.'), '');
        }

        cb(null, documentPath);
    },
    filename: async (req, file, cb) => {
        const fid = await generateId();
        req.savedFileId = fid;
        const ext = path.extname(file.originalname);
        cb(null, `${fid}${ext}`);
    },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('allow PDF file only.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
