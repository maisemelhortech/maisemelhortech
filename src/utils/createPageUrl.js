export function createPageUrl(pageName) {
  if (pageName.startsWith('/')) {
    return pageName;
  }
  return `/${pageName}`;
}