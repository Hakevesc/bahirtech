/** Shared site config for SEO metadata. */
export const SITE = {
  name: "Bahir Tech",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://bahirtech.com",
  description:
    "Bahir Tech builds reliable, secure and scalable digital systems for Ethiopian enterprises, public institutions and growing businesses.",
  defaultLogo: "/assets/logo/Bahir Tech Logo.svg",
  ogImage: "/assets/Images/blog_team.jpg",
  contactEmail: "info@bahirtech.com",
  phone: "+251 930 573 337",
  address: "Laphto Mall, Bisrate Gebriel, Addis Ababa, Ethiopia",
};

export function absolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE.url + path;
}

/** JSON-LD Organization markup injected into the document head. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absolute(SITE.defaultLogo),
    email: SITE.contactEmail,
    address: { "@type": "PostalAddress", streetAddress: SITE.address, addressCountry: "ET" },
    contactPoint: [{ "@type": "ContactPoint", telephone: SITE.phone, contactType: "customer service" }],
  };
}