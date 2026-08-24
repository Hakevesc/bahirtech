import type { ReactNode } from "react";

export const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ARROW = (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 17 17 7m0 0H9m8 0v8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ARROW_MD = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <path d="M7 17 17 7m0 0H9m8 0v8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type Capability = { label: string };

export type Service = {
  id: string;
  num: string;
  title: string;
  icon: ReactNode;
  description: string;
  capabilities: Capability[];
  more?: { href: string; label: string };
};

export const SERVICES: Service[] = [
  {
    id: "infrastructure",
    num: "Service 01",
    title: "IT Infrastructure & Networking",
    icon: (
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    ),
    description:
      "We design, build, and manage reliable networks, data centers, and cloud infrastructure that keep your business always connected and running smoothly.",
    capabilities: [
      { label: "Cloud Solutions" },
      { label: "Data Center Setup & Management" },
      { label: "Network Design & Implementation" },
      { label: "Cybersecurity Integration" },
      { label: "Managed IT Services" },
    ],
  },
  {
    id: "software",
    num: "Service 02",
    title: "Software Development",
    icon: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
    description:
      "Tailored software, APIs, and cloud-native applications built around your real workflows — designed to scale with your business.",
    capabilities: [
      { label: "Custom Software Development" },
      { label: "API Development & Integration" },
      { label: "Enterprise Application Integration" },
      { label: "Mobile App Development" },
      { label: "Cloud-Native Development" },
    ],
  },
  {
    id: "security",
    num: "Service 03",
    title: "Cybersecurity Operations",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    description:
      "Round-the-clock protection for your systems and data with proactive monitoring, hardening, and rapid response to threats.",
    capabilities: [
      { label: "Network & Firewall Security" },
      { label: "Endpoint & Device Protection" },
      { label: "Data Encryption & Backup" },
      { label: "24/7 Security Monitoring" },
    ],
    more: { href: "/cybersecurity", label: "Full cybersecurity detail" },
  },
];

export type ValueCard = {
  title: string;
  body: string;
  icon: ReactNode;
};
export const VALUE_CARDS: ValueCard[] = [
  {
    title: "Implementation & Deployment",
    body: "We take ideas and turn them into reality. Whether it's networks, servers, storage, or virtual environments, we design and build systems that run smoothly.",
    icon: <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2M15 9h4a2 2 0 0 1 2 2v10" />,
  },
  {
    title: "Support & Maintenance",
    body: "We keep systems healthy and running. With preventive checks, quick fixes, and regular updates, downtime becomes a thing of the past.",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    title: "Professional Consulting",
    body: "We guide organizations in making smart IT choices. From audits to planning, we help our clients see clearly and act confidently.",
    icon: (
      <>
        <path d="M9.5 2a2.5 2.5 0 0 0-2.5 2.5v2.5M9.5 2a8.5 8.5 0 0 1 0 17M9.5 2a3 3 0 0 0-3 3v2.5A2.5 2.5 0 0 1 9.5 10" />
        <path d="M14.5 22a2.5 2.5 0 0 0 2.5-2.5V17M14.5 22a8.5 8.5 0 0 1 0-17M14.5 22a3 3 0 0 0 3-3v-4a2.5 2.5 0 0 0-3-2.5" />
      </>
    ),
  },
];
export type Industry = { title: string; body: string; icon: ReactNode };
export const INDUSTRIES: Industry[] = [
  {
    title: "Banks & Financial Institutions",
    body: "Secure and always-on systems.",
    icon: (
      <>
        <rect x={2} y={5} width={20} height={14} rx={2} />
        <line x1={2} y1={10} x2={22} y2={10} />
      </>
    ),
  },
  {
    title: "Government Agencies",
    body: "Scalable, reliable infrastructure.",
    icon: <path d="M3 21h18M4 21V10M9 21V10M15 21V10M20 21V10M2.5 10h19L12 3.5 2.5 10Z" />,
  },
  {
    title: "Private Companies & SMEs",
    body: "Efficient, cost-effective IT.",
    icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  },
  {
    title: "NGOs & Development Programs",
    body: "Dependable technology for critical work.",
    icon: <path d="M12 3l7 4v5c0 5-3 7-7 9-4-2-7-4-7-9V7l7-4z" />,
  },
];