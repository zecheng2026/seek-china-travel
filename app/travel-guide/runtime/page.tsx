import type {Metadata} from "next";
import GuideDetail from "../[slug]/GuideDetailClient";

// A single prebuilt shell for guides published after the last static build.
// The Pages Function serves it at /travel-guide/:slug only when no static page exists.
export const metadata: Metadata = {
 title: "China Travel Guide | SEEK CHINA TRAVEL",
 robots: {index:false,follow:true},
};
export default function RuntimeGuidePage(){return <GuideDetail/>;}
