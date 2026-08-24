import type { Metadata } from "next";
import "../../styles/about.css";
import { AboutPage } from "@/components/about/AboutPage";
import { RevealFx } from "@/components/site/RevealFx";

export const metadata: Metadata = {
  title: "About — Navigating the Sea of Ideas",
  description:
    "Bahir Tech PLC (founded 2025) is an Ethiopian technology company focused on IT infrastructure, cybersecurity, software development, and digital transformation.",
};

export default function AboutRoute() {
  return (
    <>
      <AboutPage />
      <RevealFx />
    </>
  );
}