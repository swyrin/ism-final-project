import prisma from '@ism/prisma';

type ServiceCallback = (status: number, data: unknown) => void;

export const createCategory = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    let { name } = body as { name?: string };
    if (!name) {
        return callback(400, { message: 'missing parameter.' });
    }

    name = name.trim().toUpperCase();

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
        return callback(403, { message: 'this category is exist.' });
    }

    const category = await prisma.category.create({ data: { name } });
    callback(201, category);
};

export const getCategory = async (callback: ServiceCallback): Promise<void> => {
    const categories = await prisma.category.findMany();
    callback(200, categories);
};

export const deleteCategory = async (body: Record<string, unknown>, callback: ServiceCallback): Promise<void> => {
    const { id } = body as { id?: string | number };
    if (!id) {
        return callback(400, { message: 'missing parameter.' });
    }

    if (isNaN(Number(id))) {
        return callback(400, { message: 'id must be an integer.' });
    }

    const numId = parseInt(String(id), 10);
    const existing = await prisma.category.findUnique({ where: { id: numId } });
    if (!existing) {
        return callback(404, { message: 'category not found.' });
    }

    await prisma.category.delete({ where: { id: numId } });
    callback(200, { message: 'delete successfully.' });
};
