import { Hero } from "@/components/hero/Hero";
import { SelectedWork } from "@/components/work/SelectedWork";
import { Profile } from "@/components/profile/Profile";
import { Experience } from "@/components/experience/Experience";
import { TechnicalPapers } from "@/components/papers/TechnicalPapers";
import { Capabilities } from "@/components/capabilities/Capabilities";
import { Credentials } from "@/components/credentials/Credentials";
import { Contact } from "@/components/contact/Contact";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteMenu } from "@/components/navigation/SiteMenu";
import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { RatingPrompt } from "@/components/feedback/RatingPrompt";
import "@/components/hero/hero.css";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SiteMenu />
      <main id="content" className="flex-1">
        <Hero />
        <ScrollMotion>
          <Profile />
          <SelectedWork />
          <Experience />
          <TechnicalPapers />
          <Capabilities />
          <Credentials />
          <Contact />
        </ScrollMotion>
      </main>
      {/* Outside ScrollMotion so no animated ancestor can trap its position:fixed;
          placed here so its tab order follows the contact links. */}
      <RatingPrompt />
      <SiteFooter />
    </>
  );
}
