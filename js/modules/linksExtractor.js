// linksExtractor.js
// Exports: extract(rawHtml, baseUrl, options) -> Array of sorted unique links
export function extract(rawHtml, baseUrl = '', options = {}){
  const out = new Set();
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml || '', 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a[href]'));
    for (const a of anchors){
      let href = (a.getAttribute('href') || '').trim();
      if (!href) continue;
      // resolve relative URLs if base provided
      try {
        if (baseUrl && !/^https?:\/\//i.test(href)) {
          href = new URL(href, baseUrl).href;
        }
      } catch (e) {
        // ignore resolution errors
      }
      // Remove fragment if removeFragments option is enabled
      if (options.removeFragments) {
        try {
          const url = new URL(href);
          url.hash = '';
          href = url.href;
        } catch (e) {
          // If URL parsing fails, try simple string replacement
          const hashIndex = href.indexOf('#');
          if (hashIndex !== -1) {
            href = href.substring(0, hashIndex);
          }
        }
      }
      out.add(href);
    }
  } catch (e) {
    console.warn('linksExtractor parse error', e);
  }
  return Array.from(out).sort();
}
