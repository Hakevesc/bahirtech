import type { Metadata } from "next";
import "../../styles/service.css";
import "../../styles/home.css";
import { Services } from "@/components/home/Services";
import { RevealFx } from "@/components/site/RevealFx";
import {
  ServicesHero,
  CoreServices,
  WhatWeDo,
  Industries,
  Cta,
} from "@/components/services/ServicesPage";

export const metadata: Metadata = {
  title: "Services — Custom Systems Designed For Real Operations",
  description:
    "Bahir Tech delivers IT infrastructure & networking, software development, and cybersecurity operations — designed, deployed, and supported for Ethiopian enterprises and institutions.",
};

export default function ServicesRoute() {
  return (
    <>
      <ServicesHero />
      <CoreServices />
      <Services />
      <WhatWeDo />
      <Industries />
      <Cta />
      <RevealFx />
    </>
  );
}