import prisma from '@ism/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

type ServiceCallback = (status: number, data: unknown) => void;

async function generateId(): Promise<string> {
    while (true) {
        const id = uuidv4();
        const existing = await prisma.document.findUnique({ where: { id } });
        if (!existing) return id;
    }
}

function formatDocument(doc: {
    id: string;
    title: string;
    history: { did: string; modified_at: Date }[];
    files?: unknown[];
}) {
    const sortedHistory = [...doc.history].sort(
        (a, b) => b.modified_at.getTime() - a.modified_at.getTime()
    );
    return {
        id: doc.id,
        title: doc.title,
        modified_at: sortedHistory[0]?.modified_at.toISOString(),
        history: sortedHistory.map(h => h.modified_at.toISOString()),
        ...(doc.files !== undefined && { files: doc.files }),
    };
}

export const createDocument = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { title } = body as { title?: string };
    if (!title) {
        return callback(400, { message: 'missing parameter.' });
    }

    const did = await generateId();
    const docDirectory = path.join(process.cwd(), process.env.STORAGE_DIR!, did);

    if (fs.existsSync(docDirectory)) {
        return callback(409, { message: 'document directory already exists.' });
    }

    fs.mkdirSync(docDirectory, { recursive: true });

    const doc = await prisma.document.create({
        data: {
            id: did,
            title,
            history: { create: { modified_at: new Date() } },
        },
        include: { history: true },
    });

    callback(201, formatDocument(doc));
};

export const getDocument = async (query: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { id } = query as { id?: string };
    if (!id) {
        return callback(400, { message: 'missing parameter.' });
    }

    const doc = await prisma.document.findUnique({
        where: { id },
        include: {
            history: true,
            files: {
                include: {
                    category: true,
                    history: { orderBy: { modified_at: 'desc' } },
                },
            },
        },
    });

    if (!doc) {
        return callback(404, { message: 'document not found.' });
    }

    const files = doc.files.map(file => {
        const sortedHistory = [...file.history].sort(
            (a, b) => b.modified_at.getTime() - a.modified_at.getTime()
        );
        return {
            id: file.id,
            title: file.title,
            cid: file.cid,
            author: file.author,
            description: file.description,
            did: file.did,
            view: file.view,
            category_name: file.category.name,
            modified_at: sortedHistory[0]?.modified_at.toISOString(),
            history: sortedHistory.map(h => h.modified_at.toISOString()),
        };
    });

    callback(200, formatDocument({ ...doc, files }));
};

export const changeDocumentName = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { id, title } = body as { id?: string; title?: string };
    if (!id || !title) {
        return callback(400, { message: 'missing parameter.' });
    }

    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
        return callback(404, { message: 'document not found.' });
    }

    const doc = await prisma.document.update({
        where: { id },
        data: {
            title,
            history: { create: { modified_at: new Date() } },
        },
        include: { history: true },
    });

    callback(201, formatDocument(doc));
};

export const deleteDocument = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { id } = body as { id?: string };
    if (!id) {
        return callback(400, { message: 'missing parameter.' });
    }

    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
        return callback(404, { message: 'document not found.' });
    }

    const documentPath = path.join(process.cwd(), process.env.STORAGE_DIR!, id);
    if (!fs.existsSync(documentPath)) {
        return callback(404, { message: 'document not found in server.' });
    }

    // Cascade handles File, FileHistory, DocumentHistory
    await prisma.document.delete({ where: { id } });

    try {
        await fs.promises.rm(documentPath, { recursive: true, force: true });
        callback(200, { message: 'delete successfully.' });
    } catch (error) {
        callback(500, { message: error });
    }
};
