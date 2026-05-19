import anchor from "@/assets/hmo-logos/anchor.png";
import avon from "@/assets/hmo-logos/avon.png";
import axaMansard from "@/assets/hmo-logos/axa-mansard.png";
import capitolHill from "@/assets/hmo-logos/capitol-hill.png";
import centuryMedicaid from "@/assets/hmo-logos/century-medicaid.svg";
import clearline from "@/assets/hmo-logos/clearline.png";
import dotHmo from "@/assets/hmo-logos/dot-hmo.svg";
import fountain from "@/assets/hmo-logos/fountain.png";
import greenfield from "@/assets/hmo-logos/greenfield.png";
import hallmark from "@/assets/hmo-logos/hallmark.png";
import hci from "@/assets/hmo-logos/hci.png";
import healthassur from "@/assets/hmo-logos/healthassur.png";
import hygeia from "@/assets/hmo-logos/hygeia.png";
import hyssop from "@/assets/hmo-logos/hyssop.png";
import leadway from "@/assets/hmo-logos/leadway-health.png";
import mediplan from "@/assets/hmo-logos/mediplan.png";
import metroHealth from "@/assets/hmo-logos/metro-health.png";
import nemHealth from "@/assets/hmo-logos/nem-health.jpg";
import nnpc from "@/assets/hmo-logos/nnpc.png";
import nonsuch from "@/assets/hmo-logos/nonsuch.png";
import novo from "@/assets/hmo-logos/novo.webp";
import oceanic from "@/assets/hmo-logos/oceanic-health.png";
import prohealth from "@/assets/hmo-logos/prohealth.png";
import redcare from "@/assets/hmo-logos/redcare.png";
import regenix from "@/assets/hmo-logos/regenix.svg";
import reliance from "@/assets/hmo-logos/reliance.svg";
import rothauge from "@/assets/hmo-logos/rothauge.png";
import serene from "@/assets/hmo-logos/serene.png";
import springtide from "@/assets/hmo-logos/springtide.jpeg";
import sterlingHealth from "@/assets/hmo-logos/sterling-health.jpg";
import unitedHealthcare from "@/assets/hmo-logos/united-healthcare.svg";
import venus from "@/assets/hmo-logos/venus.png";
import wellness from "@/assets/hmo-logos/wellness.png";

export interface HmoPartner {
  name: string;
  logo?: string;
  website?: string;
}

export const hmoPartners: HmoPartner[] = [
  { name: "Hygeia HMO", logo: hygeia, website: "https://hygeiahmo.com" },
  { name: "Avon Healthcare", logo: avon, website: "https://avonhealthcare.com" },
  { name: "AXA Mansard", logo: axaMansard, website: "https://axamansard.com" },
  { name: "Leadway Health", logo: leadway, website: "https://leadwayhealth.com" },
  { name: "Reliance HMO", logo: reliance, website: "https://reliancehmo.com" },
  { name: "Clearline HMO", logo: clearline, website: "https://clearlinehmo.com" },
  { name: "Redcare HMO", logo: redcare, website: "https://redcarehmo.com" },
  { name: "Hallmark HMO", logo: hallmark, website: "https://hallmarkhmo.com" },
  { name: "Novo Health Africa", logo: novo, website: "https://novohealthafrica.org" },
  { name: "Anchor HMO", logo: anchor, website: "https://anchorhmo.com" },
  { name: "Metro Health HMO", logo: metroHealth, website: "https://metrohealthhmo.com" },
  { name: "NEM Health", logo: nemHealth, website: "https://nem-insurance.com" },
  { name: "NNPC", logo: nnpc, website: "https://nnpcgroup.com" },
  { name: "Springtide HMO", logo: springtide, website: "https://springtidehmo.com" },
  { name: "Venus Medicare", logo: venus, website: "https://venusmedicare.com" },
  { name: "Health-Assur", logo: healthassur, website: "https://healthassur.com" },
  { name: "Mediplan HMO", logo: mediplan, website: "https://mediplanhealthcare.com" },
  { name: "Capitol Hill", logo: capitolHill, website: "https://capitolhillhospitals.com.ng" },
  { name: "Century Medicaid", logo: centuryMedicaid, website: "https://centurymedicaid.org" },
  { name: "Nonsuch HMO", logo: nonsuch, website: "https://nonsuchmedicare.com" },
  { name: "ProHealth HMO", logo: prohealth, website: "https://www.prohealthhmo.com" },
  { name: "Wellness Healthcare", logo: wellness, website: "https://www.wellnesshealthcare.com.ng" },
  { name: "Serene Healthcare", logo: serene, website: "https://serenehealthcare.org" },
  { name: "United Healthcare", logo: unitedHealthcare, website: "https://unitedhealthcare-ng.com" },
  { name: "Sterling Health", logo: sterlingHealth, website: "https://sterlinghealthmcs.com" },
  { name: "Regenix", logo: regenix, website: "https://regenixhealthcare.com" },
  { name: "Rothauge", logo: rothauge, website: "https://rothaugehealth.com" },
  { name: "Oceanic Health", logo: oceanic, website: "https://oceanichealth.com" },
  { name: "DOT HMO", logo: dotHmo, website: "https://www.dothmo.co" },
  { name: "HCI Healthcare", logo: hci, website: "https://www.hcihealthcare.ng" },
  { name: "Hyssop Health", logo: hyssop, website: "https://hyssophmo.com" },
  { name: "Greenfield Health", logo: greenfield, website: "http://greenfieldhmo.com" },
  { name: "Fountain Healthcare", logo: fountain, website: "https://fountainhealthcareng.com" },
  // Remaining partners with no cleanly sourced logo
  { name: "Swift Health" },
  { name: "First Guarantee HMO" },
  { name: "UNIC Insurance" },
  { name: "Twins Medium Clinic" },
  { name: "Life Action Plus" },
  { name: "Gorah Medicare" },
  { name: "Roding Healthcare" },
];
