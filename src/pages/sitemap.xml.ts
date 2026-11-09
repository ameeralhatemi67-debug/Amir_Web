import type { APIRoute } from 'astro';
import { ROUTE } from '../os/core.js';

const origin = 'https://amir-web-alpha.vercel.app';
const at = (lang: string, path: string) => `${origin}/${lang}/${path ? path + '/' : ''}`;
export const GET: APIRoute = () => {
  const entries = ['en', 'ar'].flatMap(lang => Object.values(ROUTE).map(path => `<url><loc>${at(lang, path)}</loc><xhtml:link rel="alternate" hreflang="en" href="${at('en', path)}"/><xhtml:link rel="alternate" hreflang="ar" href="${at('ar', path)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${at('en', path)}"/></url>`));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
