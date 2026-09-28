import type {Metadata} from "next";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";
export const metadata:Metadata={metadataBase:new URL("https://seekchinatravel.com"),title:{default:"SEEK CHINA TRAVEL | Discover China. Your Way.",template:"%s"},description:"Private and tailor-made China journeys created by local experts for curious travelers.",alternates:{canonical:"/"},openGraph:{siteName:"SEEK CHINA TRAVEL",type:"website",locale:"en_US"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SiteChrome>{children}</SiteChrome></body></html>}