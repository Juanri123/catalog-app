import { getDirectoryContent, getCategories } from '@/lib/catalog';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BiArrowBack } from 'react-icons/bi';

export async function generateStaticParams() {
    // For now we don't pre-generate deep paths to avoid complexity, 
    // but Next.js will generate them on demand.
    // We can at least generate top level
    const categories = await getCategories();
    return categories.map(c => ({ slug: [c.slug] }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const content = await getDirectoryContent(slug);

    if (!content) {
        return notFound();
    }

    const { name, subcategories, images } = content;

    // Construct parent URL for back button
    const parentPath = slug.length > 1 ? `/${slug.slice(0, -1).join('/')}` : '/';

    return (
        <main className="min-h-screen p-6 md:p-12 bg-neutral-950 text-white selection:bg-amber-500/30">
            <div className="max-w-7xl mx-auto">
                <Link
                    href={parentPath}
                    className="inline-flex items-center gap-2 text-neutral-400 hover:text-amber-400 mb-8 transition-colors group px-4 py-2 rounded-lg hover:bg-white/5 w-fit"
                >
                    <BiArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Volver</span>
                </Link>

                <header className="mb-12 border-b border-neutral-800 pb-8 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white capitalize tracking-tight">
                        {name}
                    </h1>
                    <div className="flex gap-4 mt-4">
                        {subcategories.length > 0 && (
                            <span className="text-neutral-500 text-lg font-light flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                {subcategories.length} colecciones
                            </span>
                        )}
                        {images.length > 0 && (
                            <span className="text-neutral-500 text-lg font-light flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                {images.length} piezas
                            </span>
                        )}
                    </div>
                </header>

                {/* Render Subcategories */}
                {subcategories.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-serif text-amber-100 mb-6 border-l-4 border-amber-600 pl-4">Colecciones</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subcategories.map((sub) => (
                                <Link
                                    key={sub.name}
                                    href={`/${slug.join('/')}/${sub.slug}`}
                                    className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-neutral-900 shadow-xl ring-1 ring-white/10 transition-transform duration-500 hover:-translate-y-2"
                                >
                                    {sub.preview ? (
                                        <div className="absolute inset-0">
                                            <Image
                                                src={sub.preview}
                                                alt={sub.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-600">
                                            <span className="text-sm">Sin portada</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">{sub.name}</h3>
                                        <p className="text-sm text-neutral-400">{sub.count} artículos</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Render Images */}
                {images.length > 0 ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {images.map((img, index) => (
                            <div
                                key={img.name}
                                className="break-inside-avoid relative group rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-500"
                            >
                                <div className="relative w-full">
                                    {img.src && (
                                        <Image
                                            src={img.src}
                                            alt={img.name}
                                            width={600}
                                            height={800}
                                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={index < 4}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 md:p-6 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-20">
                                    <p className="text-sm md:text-md font-medium text-white truncate border-l-2 border-amber-500 pl-3">
                                        {img.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    subcategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-600">
                            <p className="text-xl">Esta carpeta está vacía.</p>
                        </div>
                    )
                )}
            </div>
        </main>
    );
}
