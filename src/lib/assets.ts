import type { ImageMetadata } from 'astro';

type ImageModule = { default: ImageMetadata };

const photos = import.meta.glob<ImageModule>('/src/assets/photos/*.jpg', { eager: true });
const covers = import.meta.glob<ImageModule>('/src/assets/covers/*.jpg', { eager: true });
const thumbs = import.meta.glob<ImageModule>('/src/assets/thumbs/*.jpg', { eager: true });

function pick(modules: Record<string, ImageModule>, folder: string, name: string): ImageMetadata {
  const mod = modules[`/src/assets/${folder}/${name}.jpg`];
  if (!mod) throw new Error(`Image not found: src/assets/${folder}/${name}.jpg`);
  return mod.default;
}

/** Photo from src/assets/photos, by file name without extension. */
export const photo = (name: string) => pick(photos, 'photos', name);
/** Single cover from src/assets/covers. */
export const cover = (name: string) => pick(covers, 'covers', name);
/** Video thumbnail from src/assets/thumbs. */
export const thumb = (name: string) => pick(thumbs, 'thumbs', name);
