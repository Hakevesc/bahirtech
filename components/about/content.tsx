/** About Bahir Tech — 1:1 port of legacy/about.html content. */

type ValueCard = { title: string; icon: React.ReactNode; body: string };

export const BAHIR_GLYPH = "ባሕር"; // Amharic: Sea

export const VALUES: ValueCard[] = [
  {
    title: "Professionalism",
    body: "We deliver quality work, every time.",
    icon: (
      <>
        <path d="M9 12l2 2 4-4" />
        <circle cx={12} cy={12} r={10} />
      </>
    ),
  },
  {
    title: "Connection",
    body: "We help people, teams, and systems work together.",
    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  },
  {
    title: "Reliability",
    body: "Your systems will work when you need them most.",
    icon: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />,
  },
  {
    title: "Integrity",
    body: "We are honest, transparent, and accountable.",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    title: "Sustainability",
    body: "We build solutions that last and grow with you.",
    icon: (
      <>
        <path d="M12 3l7 4v5c0 5-3 7-7 9-4-2-7-4-7-9V7l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];