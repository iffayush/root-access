import type { ReactNode, CSSProperties } from "react";

import "./credentials-bento.css";

type CredentialTileProps = {
  id: string;
  layoutClass: string;
  brandPrimary: string;
  brandAccent: string;
  logo: ReactNode;
  children: ReactNode;
  href?: string | null;
  external?: boolean;
};

export function CredentialTile({
  id,
  layoutClass,
  brandPrimary,
  brandAccent,
  logo,
  children,
  href,
  external = false,
}: CredentialTileProps) {
  const style = {
    "--tile-brand": brandPrimary,
    "--tile-brand-accent": brandAccent,
  } as CSSProperties;

  const body = (
    <>
      <div className="credential-tile__inner">
        <div className="credential-tile__logo-wrap">{logo}</div>
        {children}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        className={`credential-tile ${layoutClass}`}
        style={style}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {body}
      </a>
    );
  }

  return (
    <article id={id} className={`credential-tile ${layoutClass}`} style={style}>
      {body}
    </article>
  );
}
