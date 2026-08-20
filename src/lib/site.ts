/**
 * Public deployment origin, provided at build time as SITE_URL. When unset the
 * site still builds; canonical URLs and the sitemap are simply omitted, same
 * as the previous prerender pipeline.
 */
export const siteUrl = (process.env.SITE_URL ?? '').trim().replace(/\/$/, '');
