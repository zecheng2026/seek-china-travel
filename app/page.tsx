import type {Metadata} from "next";
import HomePageClient from "./HomePageClient";

export const metadata:Metadata={
 title:"SEEK CHINA TRAVEL | Private & Tailor-Made China Tours",
 description:"Plan a private, tailor-made China journey with local experts. Explore destinations, flexible itineraries and practical travel advice with SEEK CHINA TRAVEL.",
 alternates:{canonical:"/"},
 openGraph:{
  title:"SEEK CHINA TRAVEL | Private & Tailor-Made China Tours",
  description:"Private and tailor-made China journeys designed around your pace, interests and travel style.",
  url:"/",
  type:"website",
  siteName:"SEEK CHINA TRAVEL"
 }
};

export default function Page(){return <HomePageClient/>}
