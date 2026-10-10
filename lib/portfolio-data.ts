export type ProjectResult = {
  label: string;
  value: string;
  method: string;
};

export type Project = {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  status: "completed" | "in-progress";
  tags: readonly string[];
  results?: readonly ProjectResult[];
  imageName: string;
  imageWidth: number;
  imageHeight: number;
};

export type FieldNote = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  status: "published" | "placeholder";
  summary: string;
};

export type CapabilityGroup = {
  id: string;
  title: string;
  menuLabel: string;
  description: string;
  skills: readonly string[];
  image: string;
};

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  status: "verified" | "placeholder";
  brandPrimary: string;
  brandSecondary: string;
  logo: "google";
};

export type PracticePlatform = {
  id: string;
  name: string;
  role: string;
  focus: string;
  platformUrl: string;
  brandPrimary: string;
  brandSecondary: string;
  logo: "bugcrowd" | "tryhackme" | "hackthebox" | "hacker101";
};

export const projects: readonly Project[] = [
  {
    id: "aegis",
    slug: "aegis",
    number: "01",
    title: "AEGIS",
    subtitle: "Single-Binary Edge Proxy & Rate-Limiting Gate",
    description:
      "Single Go binary deployed as a reverse proxy in front of HTTP applications — inspecting requests, rate-limiting clients per IP and time window, and forwarding only what passes its SQL injection, XSS, and path traversal rules. Ships with an observe mode that audits would-be blocks, an enforce mode that applies them, and a built-in terminal UI.",
    status: "in-progress",
    tags: ["Go", "Reverse Proxy", "Rate Limiting", "Request Filtering", "Self-Hosted"],
    imageName: "dashboard_aegis.png",
    imageWidth: 1155,
    imageHeight: 1040,
  },
  {
    id: "aws-threat-detection",
    slug: "aws-threat-detection",
    number: "02",
    title: "AWS Threat Detection",
    subtitle: "Cloud Trail & VPC Log Analysis Pipeline",
    description:
      "Threat detection and incident response pipeline analyzing AWS CloudTrail and VPC Flow logs to detect suspicious activity mapped to MITRE ATT&CK techniques.",
    status: "completed",
    tags: ["AWS CloudTrail", "GuardDuty", "Python", "SIEM", "Detection Engineering"],
    imageName: "aws-architecture.png",
    imageWidth: 1337,
    imageHeight: 353,
  },
  {
    id: "wass",
    slug: "wass",
    number: "03",
    title: "WASS",
    subtitle: "Web Application Security Scanner",
    description:
      "Automated web application security scanner designed to detect web vulnerabilities (including XSS, SQLi, and misconfigurations) through non-destructive dynamic analysis and structured security reporting.",
    status: "in-progress",
    tags: ["Python", "DAST", "OWASP Top 10", "Docker", "Security Automation"],
    results: [
      {
        label: "Benchmark Test Cases",
        value: "100+",
        method: "Automated validation runs against OWASP Juice Shop test environment",
      },
    ],
    imageName: "hero_wass.png",
    imageWidth: 1902,
    imageHeight: 971,
  },
];

export type ExperienceEntry = {
  id: string;
  role: string;
  organisation: string;
  period: string;
  location: string;
  summary: string;
  tags?: readonly string[];
  status: "active" | "complete" | "placeholder";
};

// Zero fabrication: entries stay placeholders until Ayush supplies verified roles.
export const experience: readonly ExperienceEntry[] = [
  {
    id: "exp-01",
    role: "Software Engineer",
    organisation: "Raidcloud Technologies",
    period: "Aug 26' — Present",
    location: "India",
    summary: "Engineered and secured critical full-stack workflows for the core enterprise application, implementing stringent input validation pipelines and executing comprehensive dependency audits to neutralize vulnerabilities.",
    status: "active",
  },
  {
    id: "exp-02",
    role: "Domain Coordinator",
    organisation: "Google Developer Groups",
    period: "Mar 26' — Present",
    location: "Kolkata, India",
    summary: "Spearheading cloud architecture and DevOps initiatives for the GDG On-Campus chapter, driving technical enablement and championing modern infrastructure practices.",
    status: "active",
  },
  {
    id: "exp-03",
    role: "Creative Director & Founder",
    organisation: "Meridian Studio",
    period: "Sep 26' — Present",
    location: "India",
    summary: "An independent design studio crafting premium digital resources and scalable visual systems for modern creators, professionals, and digital brands.",
    status: "active",
  },
];

export const fieldNotes: readonly FieldNote[] = [
  {
    id: "fn-01",
    slug: "threat-detection-response",
    title: "AI-Based Network Security Threat Detection and Response",
    date: "May 26",
    category: "Network Security",
    status: "published",
    summary: "this report proposes an improved AI-driven network security threat detection and response architecture, rather than relying on a single convolutional model, the proposed system introduces a multi-model ensemble combining convolutional and anomaly-based detection to achieve precise threat coverage. Supported by external threat intelligence integration, along with a confidence-based triage layer to reduce the number of false positives, explainability mechanisms to support expert review, hierarchy based automated response actions and a continuous retraining feedback loop for sustained performance as threats evolve.",
  },
  {
    id: "fn-02",
    slug: "aws-cloudtrail-anomaly",
    title: "AWS Security Lab",
    date: "Oct 25",
    category: "Cloud Security",
    status: "published",
    summary: "This project demonstrates the creation of a Cloud Threat Detection and Automated Response System using AWS CloudTrail, Config, GuardDuty, CloudWatch, and Lambda. The goal was to simulate real-world cloud attacks, detect threats, and automatically respond to incidents, such as disabling compromised IAM users or blocking malicious IPs entirely through AWS automation.",
  },
  {
    id: "fn-03",
    slug: "pentest-report",
    title: "powerdialer.ai Staging Backend Exposure Findings",
    date: "Jun 26",
    category: "Application Security",
    status: "published",
    summary: "Black-box penetration test of PowerDialer.ai's staging environment, identifying a chained vulnerability where an exposed API URL in client-side JavaScript (CVSS 5.3) led to discovery of a publicly accessible, unauthenticated backend (CVSS 7.5). Followed OWASP Testing Guide and PTES methodology; delivered a prioritized findings report with PoCs, remediation code, and a defense-in-depth IAM/tenant-isolation redesign to prevent recurrence.",
  },
];

// Ayush: remove anything you cannot discuss in an interview.
export const capabilityGroups: readonly CapabilityGroup[] = [
  {
    id: "application-security",
    title: "Application Security",
    menuLabel: "Application Security",
    description: "Black-box pentesting and API vulnerability chaining, from recon to exploit path.",
    skills: [
      "Black-Box Web App Penetration Testing (OWASP, PTES)",
      "API Authentication & Authorization Flaw Analysis",
      "Vulnerability Chaining & Blast-Radius Assessment",
      "CVSS Scoring & Findings Reporting",
    ],
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=600&h=400&fit=crop&sat=-100&auto=format",
  },
  {
    id: "cloud-security",
    title: "Cloud Security",
    menuLabel: "Cloud Security",
    description: "GCP/AWS misconfiguration discovery and IAM/network trust-boundary design.",
    skills: [
      "Cloud Run / IAM Ingress & Invoker Policy Hardening",
      "Multi-Tenant Authorization & Row-Level Security Design",
      "JWT-Based Identity Verification (Clerk, OAuth)",
      "Secrets & Environment Variable Exposure Audits",
    ],
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&h=400&fit=crop&sat=-100&auto=format",
  },
  {
    id: "offensive-tooling",
    title: "Offensive Tooling & Network Recon",
    menuLabel: "Offensive Tooling",
    description: "Custom-built tools for reconnaissance and protocol-level network analysis.",
    skills: [
      "Async Network Recon Tooling (Rust, Tokio)",
      "Port Scanning & Service Fingerprinting",
      "HTTP Fuzzing & Endpoint Enumeration (ffuf)",
      "Protocol-Level Traffic Analysis",
    ],
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&h=400&fit=crop&sat=-100&auto=format",
  },
  {
    id: "devsecops",
    title: "DevSecOps & Security Automation",
    menuLabel: "DevSecOps",
    description: "Building and deploying the defensive infrastructure that stops the bugs above.",
    skills: [
      "WAF Design & Deployment (Go, Coraza, Caddy)",
      "CI/CD Security Pipeline Integration",
      "Automated Vulnerability Reporting",
      "Security Tooling in Go & Python",
    ],
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format",
  },
];

export const certifications: readonly Certification[] = [
  {
    id: "google-cybersecurity",
    title: "Google Cybersecurity Certificate",
    issuer: "Google",
    date: "Nov 24",
    credentialUrl: "https://coursera.org/share/1e927bfe1f4c56e38cd00d922494fd36",
    status: "verified",
    brandPrimary: "#174ea6",
    brandSecondary: "#4285f4",
    logo: "google",
  },
];

export const practicePlatforms: readonly PracticePlatform[] = [
  {
    id: "bugcrowd",
    name: "Bugcrowd",
    role: "Security Researcher",
    focus: "Crowdsourced Security Research & Vulnerability Disclosure",
    platformUrl: "https://bugcrowd.com",
    brandPrimary: "#111415",
    brandSecondary: "#ff6900",
    logo: "bugcrowd",
  },
  {
    id: "tryhackme",
    name: "TryHackMe",
    role: "Hands-on Practice",
    focus: "Offensive & Defensive Security Labs",
    platformUrl: "https://tryhackme.com",
    brandPrimary: "#212c42",
    brandSecondary: "#e63f31",
    logo: "tryhackme",
  },
  {
    id: "hacker101",
    name: "Hacker101",
    role: "Hands-on Practice",
    focus: "Web Security & Capture The Flag (CTF)",
    platformUrl: "https://www.hacker101.com",
    brandPrimary: "#1a1a1a",
    brandSecondary: "#ff6600",
    logo: "hacker101",
  },
];
