import prisma from '@ism/prisma';
import fs from 'fs';
import path from 'path';

type ServiceCallback = (status: number, data: unknown) => void;

function formatFile(file: {
    id: string;
    title: string;
    cid: number;
    author: string;
    description: string;
    did: string;
    view: number;
    category?: { name: string };
    history: { fid: string; modified_at: Date }[];
}) {
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
        ...(file.category && { category_name: file.category.name }),
        modified_at: sortedHistory[0]?.modified_at.toISOString(),
        history: sortedHistory.map(h => h.modified_at.toISOString()),
    };
}

export const createFile = async (
    body: Record<string, unknown>,
    fid: string,
    callback: ServiceCallback
): Promise<void> => {
    const { title, cid, author, did, description } = body as {
        title: string;
        cid: string;
        author: string;
        did: string;
        description: string;
    };

    const file = await prisma.file.create({
        data: {
            id: fid,
            title,
            cid: parseInt(cid, 10),
            author,
            description,
            did,
            view: 0,
            history: { create: { modified_at: new Date() } },
        },
        include: { category: true, history: true },
    });

    callback(200, formatFile(file));
};

export const editFileInformation = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { id, title, cid, description } = body as {
        id?: string;
        title?: string;
        cid?: string;
        description?: string;
    };

    if (!id || (!title && !cid && !description)) {
        return callback(400, { message: 'missing parameter.' });
    }

    if (cid) {
        const category = await prisma.category.findUnique({ where: { id: parseInt(cid, 10) } });
        if (!category) {
            return callback(404, { message: 'category not found.' });
        }
    }

    const file = await prisma.file.update({
        where: { id },
        data: {
            ...(title && { title }),
            ...(cid && { cid: parseInt(cid, 10) }),
            ...(description && { description }),
            history: { create: { modified_at: new Date() } },
        },
        include: { category: true, history: true },
    });

    callback(200, formatFile(file));
};

export const getFile = async (id: string, callback: ServiceCallback): Promise<void> => {
    const file = await prisma.file.findUnique({
        where: { id },
        select: { id: true, did: true, title: true },
    });

    if (!file) {
        return callback(404, { message: 'file not found.' });
    }

    const storagePath = path.join(process.cwd(), process.env.STORAGE_DIR!, file.did);
    if (!fs.existsSync(storagePath)) {
        throw new Error('document not exist.');
    }

    const files = fs.readdirSync(storagePath);
    const matchedFile = files.find(f => f.startsWith(file.id + '.'));
    if (!matchedFile) {
        throw new Error('file not exist.');
    }

    callback(200, { filePath: path.join(storagePath, matchedFile), fileName: `${file.title}.pdf` });
};

export const getFileInformation = async (id: string, callback: ServiceCallback): Promise<void> => {
    const file = await prisma.file.findUnique({
        where: { id },
        include: { history: true },
    });

    if (!file) {
        return callback(404, { message: 'file not found.' });
    }

    callback(200, formatFile(file));
};

export const deleteFile = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { id } = body as { id?: string };
    if (!id) {
        return callback(400, { message: 'missing parameter.' });
    }

    const file = await prisma.file.findUnique({
        where: { id },
        select: { did: true },
    });

    if (!file) {
        return callback(404, { message: 'file not found' });
    }

    const storagePath = path.join(process.cwd(), process.env.STORAGE_DIR!, file.did);
    if (!fs.existsSync(storagePath)) {
        return callback(404, { message: 'document not found' });
    }

    const files = fs.readdirSync(storagePath);
    const matchedFile = files.find(f => f.startsWith(id + '.'));
    if (!matchedFile) {
        return callback(404, { message: 'file not found' });
    }

    // Cascade handles FileHistory
    await prisma.file.delete({ where: { id } });
    fs.unlinkSync(path.join(storagePath, matchedFile));
    callback(200, { message: 'delete successfully.' });
};

export const addView = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { id } = body as { id?: string };
    if (!id) {
        return callback(400, { message: 'missing parameter.' });
    }

    const existing = await prisma.file.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
        return callback(404, { message: 'file not found.' });
    }

    const file = await prisma.file.update({
        where: { id },
        data: { view: { increment: 1 } },
        include: { history: true },
    });

    callback(200, formatFile(file));
};
