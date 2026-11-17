import { SITE_CONFIG } from "@/config/site";

// Note: Google currently limits FAQ/HowTo rich results to certain authoritative sites;
// the structured markup still helps search and answer engines understand the page.

export function buildWebSiteJsonLd(lang: "ur" | "en") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.appName,
    alternateName: SITE_CONFIG.appNameUr,
    url: `${SITE_CONFIG.appUrl}/${lang}/`,
    inLanguage: lang,
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.appName,
    url: SITE_CONFIG.appUrl,
    logo: `${SITE_CONFIG.appUrl}/icons/icon-512.png`,
    sameAs: SITE_CONFIG.socialProfiles,
  };
}

export function buildWebApplicationJsonLd(lang: "ur" | "en") {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_CONFIG.appName,
    alternateName: SITE_CONFIG.appNameUr,
    url: `${SITE_CONFIG.appUrl}/${lang}/`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: ["ur", "en"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleJsonLd(opts: {
  headline: string;
  lang: "ur" | "en";
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    inLanguage: opts.lang,
    mainEntityOfPage: opts.url,
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.appName,
    },
    reviewedBy: {
      "@type": "Person",
      name: SITE_CONFIG.reviewer.name,
      description: SITE_CONFIG.reviewer.bio,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-summary"],
    },
  };
}

export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function buildHowToJsonLd(opts: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
