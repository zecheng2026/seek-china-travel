import "./globals.css";
import SiteChrome from "./components/SiteChrome";
export const metadata={title:"SEEK CHINA TRAVEL | Discover China. Your Way.",description:"Private and tailor-made China journeys created by local experts for curious travelers."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SiteChrome/>{children}</body></html>}