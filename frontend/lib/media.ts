const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

/**
 * Construit l'URL complète pour un média venant du backend Django.
 * Gère les cas où l'URL est déjà absolue ou si elle est relative.
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return '/images/services/consultation.png';
  
  // Si c'est déjà une URL absolue (http:// ou https://), on la retourne telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) {
    const mediaIndex = path.indexOf('/media/');
    if (mediaIndex !== -1) {
      const afterMedia = path.substring(mediaIndex + '/media/'.length);
      return `/media/${afterMedia}`;
    }
    return path;
  }

  // S'il s'agit d'une image statique locale (commence par /images ou /assets), on la retourne telle quelle
  if (path.startsWith('/images') || path.startsWith('/assets')) {
    return path;
  }

  // Si le backend renvoie directement une URL MEDIA (cas Django ImageField via DRF)
  // On préfère rester en same-origin via le proxy Next (/media/*)
  if (path.startsWith('/media/')) {
    return path;
  }

  // Si le CMS renvoie un chemin relatif vers une ressource connue (alignée avec public/)
  // ex: "hero/hero-1-vision.jpg" ou "services/consultation.png"
  if (path.startsWith('hero/') || path.startsWith('services/')) {
    return `/media/${path}`;
  }

  // Si le CMS renvoie un chemin incluant "media/"
  // ex: "media/hero/hero-1-vision.jpg" ou "/media/services/consultation.png"
  const normalized = path.startsWith('/') ? path.substring(1) : path;
  if (normalized.startsWith('media/')) {
    const afterMedia = normalized.substring('media/'.length);
    return `/media/${afterMedia}`;
  }

  // Sinon, on concatène l'URL du backend
  // Django ImageField retourne généralement le chemin relatif à MEDIA_ROOT
  // On s'assure qu'il n'y a pas de double slash
  const cleanPath = normalized;
  const isMedia = cleanPath.startsWith('media/') ? '' : 'media/';
  
  return `/${isMedia}${cleanPath}`;
}
