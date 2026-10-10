import { PageGrid } from "@/components/layout/PageGrid";
import { resolveExternalHref, siteConfig } from "@/lib/site-config";

const contactItems = [
  { label: "GitHub", value: siteConfig.links.github },
  { label: "LinkedIn", value: siteConfig.links.linkedin },
  { label: "Email", value: siteConfig.links.email },
] as const;

function ContactItem({ label, value }: { label: string; value: string }) {
  const href = resolveExternalHref(value);

  return (
    <p className="contact-row">
      <span className="contact-label">{label}</span>
      {href ? (
        <a className="contact-value" href={href}>
          {value}
        </a>
      ) : (
        <span className="contact-value">{value}</span>
      )}
    </p>
  );
}

function MeridianLine() {
  const { label, url } = siteConfig.meridian;
  const href = url ? resolveExternalHref(url) : null;

  if (href) {
    return (
      <a className="meridian" href={href}>
        {label}
      </a>
    );
  }

  return <p className="meridian">{label}</p>;
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <PageGrid className="footer-grid">
        <div className="col-span-12 md:col-span-5">
          <p className="footer-name">{siteConfig.name}</p>
          <p className="footer-title">{siteConfig.title}</p>
        </div>
        <ul className="col-span-12 md:col-span-4">
          {contactItems.map((item) => (
            <li key={item.label}>
              <ContactItem label={item.label} value={item.value} />
            </li>
          ))}
        </ul>
        <div className="col-span-12 flex flex-col md:col-span-3 md:items-end">
          <p className="footer-copy">
            © {siteConfig.year} {siteConfig.name}
          </p>
          <MeridianLine />
        </div>
      </PageGrid>
    </footer>
  );
}
