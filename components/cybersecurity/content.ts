/** Cybersecurity — 1:1 port of legacy/cybersecurity.html content. */

export type Capability = {
  id: string;
  num: string;
  title: string;
  lead: string;
  list: string[];
  spec: { dt: string; dd: string }[];
  flip?: boolean;
  shotAlt: string;
};

export const CAPABILITIES: Capability[] = [
  {
    id: "network-firewall",
    num: "01",
    title: "Network & firewall security",
    lead: "Policy written to what your business actually needs open — nothing more — then enforced at the edge and between segments, so one compromised machine cannot reach the rest of the estate.",
    list: [
      "Next-generation firewall design, build and tuning",
      "Segmentation between sites, servers and user networks",
      "Secure remote access for staff and contractors",
      "Scheduled rule review, so policy does not silently rot",
      "A change log you can hand to an auditor",
    ],
    spec: [
      { dt: "Quarterly", dd: "policy and rule review" },
      { dt: "Segmented", dd: "by default, not on request" },
      { dt: "Documented", dd: "every change, with a reason" },
    ],
    shotAlt:
      "A security engineer reviewing network traffic on a laptop in a data centre at night",
  },
  {
    id: "endpoints",
    num: "02",
    title: "Endpoint & device protection",
    lead: "Every laptop, server and phone accounted for, hardened and watched. When something turns hostile we isolate the device itself rather than waiting for the network to notice.",
    list: [
      "Endpoint detection and response, deployed and tuned",
      "A live inventory of what you own and what it runs",
      "Hardening baselines applied and checked, not just written",
      "Patch cover reported monthly, including what was missed",
      "Isolation of a compromised device on command",
    ],
    spec: [
      { dt: "Every device", dd: "inventoried, none assumed" },
      { dt: "Seconds", dd: "to isolate, not hours" },
      { dt: "Monthly", dd: "patch and cover report" },
    ],
    flip: true,
    shotAlt: "An engineer checking managed devices on a laptop at night",
  },
  {
    id: "encryption-backup",
    num: "03",
    title: "Data encryption & backup",
    lead: "Encryption at rest and in transit, and backups we restore-test on a schedule. Your recovery time is measured and agreed in advance, not discovered in the middle of an incident.",
    list: [
      "Encryption at rest and in transit, with keys held properly",
      "Offsite and offline copies, out of ransomware's reach",
      "Scheduled restore tests, with the results written down",
      "A recovery runbook your own team can follow without us",
      "Retention set to what your regulator and your business need",
    ],
    spec: [
      { dt: "Restore-tested", dd: "on a schedule, not in theory" },
      { dt: "Offline copy", dd: "beyond an attacker's reach" },
      { dt: "RTO agreed", dd: "before you ever need it" },
    ],
    shotAlt:
      "An engineer verifying backup and recovery systems on a laptop",
  },
  {
    id: "monitoring",
    num: "04",
    title: "24/7 security monitoring",
    lead: "Our team watches your estate at 3am as closely as at 3pm. Alerts are triaged by a person, not forwarded to your inbox, contained inside the window we agreed, and written up afterwards with what changed and why.",
    list: [
      "Round-the-clock monitoring of network, cloud and endpoints",
      "Human triage, so you are only called for what matters",
      "Containment and recovery, not just a notification",
      "A written incident report, and the fix that follows it",
      "A monthly review of what we saw and what we changed",
    ],
    spec: [
      { dt: "24/7/365", dd: "monitored cover" },
      { dt: "A person", dd: "triages every alert" },
      { dt: "In writing", dd: "response times and reports" },
    ],
    flip: true,
    shotAlt: "A security analyst monitoring systems overnight",
  },
];