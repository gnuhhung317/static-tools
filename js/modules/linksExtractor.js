// linksExtractor.js
// Exports: extract(rawHtml, baseUrl) -> Array of sorted unique links
export function extract(rawHtml, baseUrl = ''){
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
      out.add(href);
    }
  } catch (e) {
    console.warn('linksExtractor parse error', e);
  }
  return Array.from(out).sort();
}
