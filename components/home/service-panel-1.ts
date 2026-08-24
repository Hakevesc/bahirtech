import type { SrvPanel } from "./service-types";

export const PANEL_SOFTWARE: SrvPanel = {
  panelId: "srvpanel-1",
  catId: "srvcat-1",
  label: "Software Development",
  blurb:
    "We build reliable, scalable, and secure software that helps your business move faster and grow without limits.",
  features: [
    {
      icon: "wrench",
      title: "Built to Fit",
      body: "Shaped around the process you already run, not a template you have to adopt.",
    },
    {
      icon: "plug",
      title: "Connected Systems",
      body: "Documented APIs so your tools exchange data without a person in the middle.",
    },
    {
      icon: "layers",
      title: "Yours to Keep",
      body: "Source, documentation and training handed over at the end of every build.",
    },
    {
      icon: "bolt",
      title: "Ships in Small Steps",
      body: "Releases you can use as they land, rather than one delivery at the end.",
    },
  ],
  tabs: [
    { id: "srvtab-1-0", label: "Custom Software" },
    { id: "srvtab-1-1", label: "APIs" },
    { id: "srvtab-1-2", label: "Integration" },
    { id: "srvtab-1-3", label: "Mobile Apps" },
    { id: "srvtab-1-4", label: "Cloud-Native" },
  ],
  cards: [
    {
      id: "srvcard-1-0",
      tabId: "srvtab-1-0",
      h: "Custom software, shaped around your operation.",
      p: "We start with the process rather than the screens, ship in small releases you can use as they land, and hand over the source and the documentation. What we build fits how your team already works.",
      href: "/services#software",
      photo: {
        src: "/assets/Images/srv_devs.jpg",
        alt: "Two developers pair-programming, code and a product screen side by side on one monitor",
      },
    },
    {
      id: "srvcard-1-1",
      tabId: "srvtab-1-1",
      h: "API development and integration.",
      p: "Documented APIs so your systems stop needing a person in the middle. Built to versioned contracts, with monitoring on every endpoint we hand over, so a change on one side does not quietly break the other.",
      href: "/services#software",
      photo: {
        src: "/assets/Images/srv_api.jpg",
        alt: "A hand-drawn service diagram on a whiteboard with API documentation open on a laptop below",
      },
    },
    {
      id: "srvcard-1-2",
      tabId: "srvtab-1-2",
      h: "Enterprise application integration.",
      p: "We connect the systems you already own — ERP, HR, finance, the bespoke tool someone built years ago — so data moves once and matches everywhere. Nothing gets replaced that does not need replacing.",
      href: "/services#software",
      photo: {
        src: "/assets/Images/srv_integration.jpg",
        alt: "A working session reviewing data flow between ERP, HR and finance systems on screen",
      },
    },
    {
      id: "srvcard-1-3",
      tabId: "srvtab-1-3",
      h: "Mobile apps for the people doing the work.",
      p: "Android and iOS for field staff, drivers and agents. Built to keep working on a bad connection and to survive a full day away from a charger, because that is the condition they will actually be used in.",
      href: "/services#software",
      photo: {
        src: "/assets/Images/srv_mobile_field.jpg",
        alt: "A field agent recording a delivery on a rugged phone beside a van on a rural road",
      },
    },
    {
      id: "srvcard-1-4",
      tabId: "srvtab-1-4",
      h: "Cloud-native development.",
      p: "Containers, pipelines and infrastructure as code, so a release is routine rather than an event. It scales with load, and it costs less on the quiet days instead of billing for a peak that is not there.",
      href: "/services#software",
      photo: {
        src: "/assets/Images/srv_pipeline.jpg",
        alt: "A build and deploy pipeline running green across its stages on a monitor",
      },
    },
  ],
};