import type { ImageMetadata } from 'astro';

type ImageModule = { default: ImageMetadata };

// Any common image extension, lower or upper case (cameras export `.JPG`).
// Other files in these folders (videos, RAW files) are never imported.
const photos = import.meta.glob<ImageModule>('/src/assets/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', { eager: true });
const covers = import.meta.glob<ImageModule>('/src/assets/covers/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', { eager: true });
const thumbs = import.meta.glob<ImageModule>('/src/assets/thumbs/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', { eager: true });

/** Index a glob result by lower-case file name without extension. */
function byName(modules: Record<string, ImageModule>) {
  const index = new Map<string, ImageMetadata>();
  for (const [path, mod] of Object.entries(modules)) {
    const name = path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
    index.set(name, mod.default);
  }
  return index;
}

const index = { photos: byName(photos), covers: byName(covers), thumbs: byName(thumbs) };

function pick(folder: keyof typeof index, name: string): ImageMetadata {
  const img = index[folder].get(name.toLowerCase());
  if (!img) {
    const available = [...index[folder].keys()].join(', ');
    throw new Error(`Image not found: src/assets/${folder}/${name}.jpg (available: ${available})`);
  }
  return img;
}

/** Photo from src/assets/photos, by file name without extension (case-insensitive). */
export const photo = (name: string) => pick('photos', name);
/** Single cover from src/assets/covers. */
export const cover = (name: string) => pick('covers', name);
/** Video thumbnail from src/assets/thumbs. */
export const thumb = (name: string) => pick('thumbs', name);
