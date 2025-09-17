import { MIME_JSON, MIME_TEXT_HTML, MIME_TEXT_PLAIN } from './constants.js';

function getContentType(file: string) {
  if (file.endsWith('.html')) {
    return MIME_TEXT_HTML;
  }

  if (file.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  }

  if (file.endsWith('.js')) {
    return 'text/javascript; charset=utf-8';
  }

  if (file.endsWith('.json') || file.endsWith('.map')) {
    return MIME_JSON;
  }

  if (file.endsWith('.txt')) {
    return MIME_TEXT_PLAIN;
  }

  if (file.endsWith('.ico')) {
    return 'image/x-icon';
  }

  if (file.endsWith('.svg')) {
    return 'image/svg+xml';
  }

  if (file.endsWith('.webp')) {
    return 'image/webp';
  }

  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (file.endsWith('.png')) {
    return 'image/png';
  }

  if (file.endsWith('.gif')) {
    return 'image/gif';
  }

  return MIME_TEXT_PLAIN;
}

export { getContentType };
