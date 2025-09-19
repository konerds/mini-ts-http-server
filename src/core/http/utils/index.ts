function getWrappedWithCharset(contentType: string, charset = 'utf-8') {
  return `${contentType}; charset=${charset}`;
}

export { getWrappedWithCharset };
