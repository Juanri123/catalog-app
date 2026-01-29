import { getCategories } from '@/lib/catalog';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-24 bg-neutral-950 text-white selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-100 to-amber-600">
              Catálogo Exclusivo
            </span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
            Descubre nuestra colección de piezas únicas diseñadas para resaltar tu elegancia.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="group relative block aspect-[4/5] md:aspect-square lg:aspect-[4/3] overflow-hidden rounded-xl bg-neutral-900 shadow-2xl ring-1 ring-white/10 transition-transform duration-500 hover:-translate-y-2"
            >
              {category.previewImage ? (
                <div className="absolute inset-0">
                  <Image
                    src={category.previewImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                  <span className="text-neutral-700">Sin imagen de portada</span>
                </div>
              )}

              {/* Overlay - Z-index fixed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-80 transition-opacity duration-500 z-10" />

              {/* Text content - Z-index fixed and mobile adjustments */}
              <div
                className="
                  absolute bottom-0 left-0 w-full z-20
                  p-6 md:p-8
                  translate-y-0
                  md:translate-y-6
                  transition-transform duration-500
                  md:group-hover:translate-y-0
                "
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white font-serif tracking-wide border-l-4 border-amber-500 pl-4">
                  {category.name}
                </h2>

                <div
                  className="
                    pl-5
                    h-8
                    md:h-0
                    overflow-hidden
                    transition-[height] duration-500
                    md:group-hover:h-8
                  "
                >
                  <span className="text-sm text-amber-300 font-medium uppercase tracking-widest">
                    {category.imageCount} diseños disponibles
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
