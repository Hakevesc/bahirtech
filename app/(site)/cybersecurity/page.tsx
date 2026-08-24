import type { Metadata } from "next";
import "../../styles/cybersecurity.css";
import { CybersecurityPage } from "@/components/cybersecurity/CybersecurityPage";
import { RevealFx } from "@/components/site/RevealFx";

export const metadata: Metadata = {
  title: "Cybersecurity Operations — Security You Can Point At",
  description:
    "Bahir Tech cybersecurity operations: network & firewall security, endpoint protection, data encryption & backup, and 24/7 security monitoring — each with a scope, a review cycle, and a named engineer.",
};

export default function CybersecurityRoute() {
  return (
    <>
      <CybersecurityPage />
      <RevealFx />
    </>
  );
}