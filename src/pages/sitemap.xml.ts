import type { APIRoute } from 'astro';
import { projects, site, url, type Locale } from '../data/site';
export const GET: APIRoute = () => {
  const pages = ['', 'projects', 'about', 'contact', 'privacy', ...projects.map(project => `projects/${project.slug}`)];
  const entries = (['en', 'ar'] as Locale[]).flatMap(lang => pages.map(page => `<url><loc>${site.origin}${url(lang, page)}</loc><xhtml:link rel="alternate" hreflang="en" href="${site.origin}${url('en', page)}"/><xhtml:link rel="alternate" hreflang="ar" href="${site.origin}${url('ar', page)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${site.origin}${url('en', page)}"/></url>`));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
