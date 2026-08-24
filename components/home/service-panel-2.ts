import type { SrvPanel } from "./service-types";

export const PANEL_SECURITY: SrvPanel = {
  panelId: "srvpanel-2",
  catId: "srvcat-2",
  label: "Cybersecurity Operations",
  blurb:
    "We help organizations strengthen their security posture and protect what matters most through proactive monitoring, detection, and response.",
  features: [
    {
      icon: "eye",
      title: "Threat Visibility",
      body: "Real-time monitoring across your entire environment.",
    },
    {
      icon: "target",
      title: "Risk Reduction",
      body: "Identify weaknesses before attackers can exploit them.",
    },
    {
      icon: "bolt",
      title: "Rapid Response",
      body: "Detect and respond faster to minimize business impact.",
    },
    {
      icon: "chart",
      title: "Operational Resilience",
      body: "Keep your systems secure, available, and business-ready.",
    },
  ],
  tabs: [
    { id: "srvtab-2-0", label: "Network & Firewall" },
    { id: "srvtab-2-1", label: "Endpoints" },
    { id: "srvtab-2-2", label: "Encryption & Backup" },
    { id: "srvtab-2-3", label: "24/7 Monitoring" },
  ],
  cards: [
    {
      id: "srvcard-2-0",
      tabId: "srvtab-2-0",
      h: "Close the gaps attackers actually walk through.",
      p: "Policy written to what your business needs open — nothing more — then enforced at the edge and between segments, so one compromised machine cannot reach the rest of the estate.",
      href: "/cybersecurity#network-firewall",
      urgent: "+251 930 573 337",
      note: "a security engineer reviewing traffic at night",
      photo: {
        src: "/assets/Images/srv_sec_network.jpg",
        alt: "A security engineer reviewing live network traffic on a laptop in a data centre at night",
      },
    },
    {
      id: "srvcard-2-1",
      tabId: "srvtab-2-1",
      h: "Know every device, and reach it in seconds.",
      p: "Every laptop, server and phone accounted for, hardened and watched. When something turns hostile we isolate the device itself rather than waiting for the network to notice.",
      href: "/cybersecurity#endpoints",
      urgent: "+251 930 573 337",
      note: "an endpoint inventory on screen, one device flagged",
    },
    {
      id: "srvcard-2-2",
      tabId: "srvtab-2-2",
      h: "A backup is only real once it has been restored.",
      p: "Encryption at rest and in transit, and backups we restore-test on a schedule. Your recovery time is measured and agreed in advance, not discovered in the middle of an incident.",
      href: "/cybersecurity#encryption-backup",
      urgent: "+251 930 573 337",
      photo: {
        src: "/assets/Images/srv_sec_backup.jpg",
        alt: "An engineer checking a restore job at a rack of backup appliances",
      },
    },
    {
      id: "srvcard-2-3",
      tabId: "srvtab-2-3",
      h: "Watched at 3am as closely as at 3pm.",
      p: "Our team monitors your estate around the clock. Alerts are triaged by a person, contained inside the window we agreed, and written up afterwards with what changed.",
      href: "/cybersecurity#monitoring",
      urgent: "+251 930 573 337",
      photo: {
        src: "/assets/Images/srv_sec_monitoring.jpg",
        alt: "A security analyst watching monitoring dashboards in an operations centre overnight",
      },
    },
  ],
};