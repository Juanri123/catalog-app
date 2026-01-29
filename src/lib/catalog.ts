import path from 'path';
import { promises as fs } from 'fs';

export type Category = {
    name: string;
    imageCount: number;
    previewImage: string | null;
    slug: string;
};

export type ContentItem = {
    type: 'category' | 'image';
    name: string;
    src?: string; // for images
    slug?: string; // for categories
    count?: number; // for categories
    preview?: string | null; // for categories
};

export type DirectoryContent = {
    name: string;
    subcategories: ContentItem[];
    images: ContentItem[];
};

const IMAGES_DIR = path.join(process.cwd(), 'public/images');

async function getRecursiveImageCount(dirPath: string): Promise<{ count: number; preview: string | null }> {
    let count = 0;
    let preview: string | null = null;

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        // Check direct images
        // Robust check using stats because entry.isDirectory() might be flaky on some Windows setups
        const imageFiles: string[] = [];
        const subDirs: string[] = [];

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            try {
                const stats = await fs.stat(fullPath);
                if (stats.isDirectory()) {
                    subDirs.push(entry.name);
                } else if (/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
                    imageFiles.push(entry.name);
                }
            } catch { }
        }

        count += imageFiles.length;
        if (imageFiles.length > 0 && !preview) {
            // Construct relative path for preview
            const relativePath = path.relative(IMAGES_DIR, path.join(dirPath, imageFiles[0]));
            preview = `/images/${relativePath.replace(/\\/g, '/')}`;
        }

        // Check subdirectories
        for (const dir of subDirs) {
            const subResult = await getRecursiveImageCount(path.join(dirPath, dir));
            count += subResult.count;
            if (!preview) preview = subResult.preview;
        }
    } catch (e) {
        console.error(`Error reading ${dirPath}:`, e);
    }

    return { count, preview };
}

export async function getCategories(): Promise<Category[]> {
    try {
        await fs.access(IMAGES_DIR);
    } catch {
        return [];
    }

    const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true });

    const categories = await Promise.all(entries.map(async (entry) => {
        const categoryPath = path.join(IMAGES_DIR, entry.name);
        try {
            const stats = await fs.stat(categoryPath);
            if (!stats.isDirectory()) return null;

            const { count, preview } = await getRecursiveImageCount(categoryPath);

            return {
                name: entry.name,
                slug: entry.name,
                imageCount: count,
                previewImage: preview
            };
        } catch {
            return null;
        }
    }));

    return categories.filter((cat): cat is Category => cat !== null);
}

export async function getDirectoryContent(slugs: string[]): Promise<DirectoryContent | null> {
    // Decode slugs to handle spaces and special chars
    const relPath = slugs.map(s => decodeURIComponent(s)).join(path.sep);
    // Prevent directory traversal
    if (relPath.includes('..')) return null;

    const fullPath = path.join(IMAGES_DIR, relPath);

    try {
        await fs.access(fullPath);
        const stats = await fs.stat(fullPath);
        if (!stats.isDirectory()) return null;

        const entries = await fs.readdir(fullPath, { withFileTypes: true });

        const subcategories: ContentItem[] = [];
        const images: ContentItem[] = [];

        for (const entry of entries) {
            const entryPath = path.join(fullPath, entry.name);
            try {
                const stats = await fs.stat(entryPath);

                if (stats.isDirectory()) {
                    const { count, preview } = await getRecursiveImageCount(entryPath);
                    subcategories.push({
                        type: 'category',
                        name: entry.name,
                        slug: entry.name,
                        count,
                        preview
                    });
                } else if (/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
                    const relativePath = path.relative(IMAGES_DIR, entryPath);
                    images.push({
                        type: 'image',
                        name: entry.name.replace(/\.(png|jpg|jpeg|webp)$/i, ''),
                        src: `/images/${relativePath.replace(/\\/g, '/')}`
                    });
                }
            } catch { }
        }

        return {
            name: decodeURIComponent(slugs[slugs.length - 1]),
            subcategories,
            images
        };

    } catch {
        return null;
    }
}
