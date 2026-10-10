import Link from "next/link";
import { PageGrid } from "@/components/layout/PageGrid";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/navigation/SiteNav";

export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SiteNav />
      <main id="content" className="flex flex-1 items-center">
        <PageGrid className="w-full py-24">
          <h1 className="col-span-12 text-section uppercase">404</h1>
          <p className="col-span-12 mt-6 max-w-xl text-body text-dust md:col-span-7">
            This page is not in the archive.
          </p>
          <Link className="nav-link col-span-12 mt-10 w-fit" href="/">
            Back home
          </Link>
        </PageGrid>
      </main>
      <SiteFooter />
    </>
  );
}
