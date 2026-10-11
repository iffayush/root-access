export type Meridian = {
  label: string;
  url?: string;
};

export const siteConfig: {
  name: string;
  title: string;
  description: string;
  year: number;
  location: string;
  focusAreas: readonly string[];
  meridian: Meridian;
  links: {
    email: string;
    linkedin: string;
    github: string;
  };
  nav: readonly { label: string; href: string }[];
} = {
  name: "Ayush Kumar",
  title: "Cybersecurity Engineer",
  description:
    "Cybersecurity engineer focused on application security, cloud security, detection and response, and DevSecOps.",
  year: 2026,
  location: "India",
  focusAreas: ["Application Security", "Cloud Security", "Detection & Response", "DevSecOps"],
  meridian: {
    label: "Founder — Meridian Studio",
  },
  links: {
    email: "iffayush.work@gmail.com",
    linkedin: "linkedin.com/in/iffayush",
    github: "github.com/iffayush",
  },
  nav: [
    { label: "Work", href: "/#work" },
    { label: "About", href: "/#profile" },
    { label: "Field Notes", href: "/#field-notes" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/#contact" },
  ],
};

export function resolveExternalHref(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.includes("[ADD")) {
    return null;
  }
  if (
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  if (trimmed.includes("@") && !trimmed.includes(" ")) {
    return `mailto:${trimmed}`;
  }
  // Bare domains like "linkedin.com/in/iffayush" — assume https.
  if (!trimmed.includes(" ") && /^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}
