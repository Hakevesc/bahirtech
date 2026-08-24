import type { SrvPanel } from "./service-types";

export const PANEL_INFRA: SrvPanel = {
  panelId: "srvpanel-0",
  catId: "srvcat-0",
  label: "Infrastructure & Networking",
  blurb:
    "Reliable infrastructure. Intelligent networks. Built for performance, security, and scale.",
  features: [
    {
      icon: "scale",
      title: "Scalable Architecture",
      body: "Built to handle growth seamlessly with modern cloud infrastructure.",
    },
    {
      icon: "coin",
      title: "Cost Efficiency",
      body: "Optimize resources and reduce costs with smart scaling and automation.",
    },
    {
      icon: "gauge",
      title: "High Performance",
      body: "Fast, resilient, and reliable systems that perform under pressure.",
    },
    {
      icon: "lock",
      title: "Built-in Security",
      body: "Security best practices built in at every layer from day one.",
    },
  ],
  tabs: [
    { id: "srvtab-0-0", label: "Cloud Solutions" },
    { id: "srvtab-0-1", label: "Data Center" },
    { id: "srvtab-0-2", label: "Network Design" },
    { id: "srvtab-0-3", label: "Cybersecurity" },
    { id: "srvtab-0-4", label: "Managed IT" },
  ],
  cards: [
    {
      id: "srvcard-0-0",
      tabId: "srvtab-0-0",
      h: "Cloud solutions, sized to what you actually run.",
      p: "We move what belongs in the cloud and leave alone what does not. You get a costed migration plan, the work done in staged cutovers outside business hours, and a monthly bill you can read line by line.",
      href: "/services#infrastructure",
      photo: {
        src: "/assets/Images/srv_cloud_console.jpg",
        alt: "An engineer reviewing a cloud cost and capacity console beside a notebook of migration waves",
      },
    },
    {
      id: "srvcard-0-1",
      tabId: "srvtab-0-1",
      h: "Data centre setup and management.",
      p: "Racks, power, cooling and cabling built to a standard you can hand to an auditor. We run the room afterwards, with capacity reviews that reach you before you hit a limit rather than after.",
      href: "/services#infrastructure",
      photo: {
        src: "/assets/Images/srv_datacenter.jpg",
        alt: "The contained cold aisle of a data centre, racks either side and cabling combed overhead",
      },
    },
    {
      id: "srvcard-0-2",
      tabId: "srvtab-0-2",
      h: "Network design and implementation.",
      p: "Switching, routing and Wi-Fi designed around your floor plan and your traffic, not a vendor's catalogue. Documented, labelled and handed over, so your own team can work on it without calling us first.",
      href: "/services#infrastructure",
      photo: {
        src: "/assets/Images/srv_cabling.jpg",
        alt: "Hands terminating colour-coded cabling into a labelled patch panel",
      },
    },
    {
      id: "srvcard-0-3",
      tabId: "srvtab-0-3",
      h: "Security built into the network itself.",
      p: "Segmentation, access control and hardened edges, so one compromised laptop does not become a compromised company. Configured on your live estate, then reviewed on a schedule instead of left to drift.",
      href: "/services#infrastructure",
      photo: {
        src: "/assets/Images/srv_firewall.jpg",
        alt: "An engineer configuring an edge firewall appliance from a laptop at an open network cabinet",
      },
    },
    {
      id: "srvcard-0-4",
      tabId: "srvtab-0-4",
      h: "Managed IT services, on a fixed monthly cost.",
      p: "Your day-to-day IT run by us: monitoring, patching, backups and a help desk your staff can actually reach. Response times are in the contract, and you see the same report we work from.",
      href: "/services#infrastructure",
      photo: {
        src: "/assets/Images/srv_helpdesk.jpg",
        alt: "An IT support technician on a headset working through a ticket queue",
      },
    },
  ],
};
