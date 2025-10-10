import urljoin from 'url-join';

export const urlJoin = (...urls: readonly string[]): string => {
  const joined = urljoin(...urls.map((url) => url || '/'));

  if (joined && joined !== '/') {
    return joined.replaceAll('//', '/');
  }

  return '/';
};
