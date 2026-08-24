/* Tiny reusable icons so the section components stay readable. */

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/* The services glyph set. Data files name an icon by key (SrvIconName) and this resolves
   it, so panel content stays free of markup. All are 24x24 line icons on currentColor. */
const SRV_PATHS: Record<string, React.ReactNode> = {
  cloud: <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97 6 6 0 0 0-11.66-1.4A3.75 3.75 0 0 0 6.5 19Z" />,
  code: <><path d="m9 18-6-6 6-6" /><path d="m15 6 6 6-6 6" /></>,
  shield: <><path d="M12 22s8-3.4 8-10V5.5L12 2 4 5.5V12c0 6.6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  scale: <><rect x={3} y={3} width={8} height={8} rx={1.5} /><rect x={13} y={13} width={8} height={8} rx={1.5} /><path d="M13 6h8M17 3v6M3 17h8M7 14v6" /></>,
  coin: <><circle cx={12} cy={12} r={9} /><path d="M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 3 0 0 1-3-1.5M12 6.5v11" /></>,
  gauge: <><path d="M3.5 17a9 9 0 1 1 17 0" /><path d="m12 13 4-3.5" /><circle cx={12} cy={14} r={1.6} /></>,
  lock: <><rect x={4} y={10} width={16} height={11} rx={2} /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
  eye: <><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx={12} cy={12} r={2.8} /></>,
  target: <><circle cx={12} cy={12} r={9} /><circle cx={12} cy={12} r={5} /><circle cx={12} cy={12} r={1.4} /></>,
  bolt: <path d="M13.5 2 4 14h6l-.5 8L20 10h-6.5Z" />,
  chart: <><path d="M3 21h18" /><rect x={5} y={12} width={3.5} height={6} rx={1} /><rect x={10.2} y={8} width={3.5} height={10} rx={1} /><rect x={15.5} y={4} width={3.5} height={14} rx={1} /></>,
  plug: <><path d="M9 2v6M15 2v6" /><path d="M6 8h12v3a6 6 0 0 1-12 0Z" /><path d="M12 17v5" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  wrench: <path d="M14.7 6.3a4.5 4.5 0 0 0 5.9 5.9l-8.4 8.4a2.5 2.5 0 0 1-3.5-3.5Z" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.95 6.75 19.7l1-5.85L3.5 9.7l5.9-.9Z" />,
  check: <><circle cx={12} cy={12} r={9} /><path d="m8.5 12.2 2.4 2.4 4.6-4.9" /></>,
  leaf: <><path d="M20 4c0 9-5.2 13.5-11.5 13.5A4.5 4.5 0 0 1 4 13c0-6 6.4-9 16-9Z" /><path d="M4 20c2.5-4.5 6-7 10.5-8.5" /></>,
  monitor: <><rect x={3} y={4} width={18} height={12.5} rx={2} /><path d="M8.5 20.5h7M12 16.5v4" /></>,
  users: <><circle cx={9} cy={8} r={3.2} /><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0" /><path d="M16.5 5.2a3.2 3.2 0 0 1 0 5.9M18 14.4a5.6 5.6 0 0 1 3.2 5.1" /></>,
};

export function SrvIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {SRV_PATHS[name] ?? SRV_PATHS.shield}
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

export function ShotPlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <circle cx={8.5} cy={8.5} r={1.5} />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}