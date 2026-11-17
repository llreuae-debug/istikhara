import { useEffect } from "react";
import { SITE_CONFIG } from "@/config/site";
import { getPageSeo, type SeoLang } from "./pages";

interface HeadProps {
  pageKey: string;
  lang: SeoLang;
  title?: string;
  description?: string;
  robots?: string;
  canonicalPath?: string;
  ogImage?: string;
  jsonLd?: Array<Record<string, unknown>>;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Head({
  pageKey,
  lang,
  title,
  description,
  robots,
  canonicalPath,
  ogImage,
  jsonLd = [],
}: HeadProps) {
  const seo = getPageSeo(pageKey, lang, {
    title,
    description,
    robots,
    canonicalPath,
    ogImage,
  });

  const canonicalUrl = `${SITE_CONFIG.appUrl}${seo.canonicalPath}`;
  const pathWithoutLang = seo.canonicalPath.replace(/^\/(ur|en)/, "");
  const urHref = `${SITE_CONFIG.appUrl}/ur${pathWithoutLang || "/"}`;
  const enHref = `${SITE_CONFIG.appUrl}/en${pathWithoutLang || "/"}`;

  useEffect(() => {
    document.title = seo.title;
    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "robots", seo.robots);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", seo.ogImage);
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);
    upsertMeta("name", "twitter:image", seo.ogImage);

    upsertLink("canonical", canonicalUrl);
    upsertLink("alternate", urHref, "ur");
    upsertLink("alternate", enHref, "en");
    upsertLink("alternate", urHref, "x-default");

    // Remove previous dynamic JSON-LD blocks managed by Head
    document.head
      .querySelectorAll('script[data-istikhara-jsonld="true"]')
      .forEach((n) => n.remove());

    for (const block of jsonLd) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.istikharaJsonld = "true";
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
    }
  }, [
    seo.title,
    seo.description,
    seo.robots,
    seo.ogImage,
    canonicalUrl,
    urHref,
    enHref,
    JSON.stringify(jsonLd),
  ]);

  return null;
}
