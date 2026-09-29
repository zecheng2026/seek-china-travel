import type {Metadata} from "next";

export const metadata:Metadata={
  title:"SCT Admin",
  robots:{index:false,follow:false,noarchive:true},
  other:{"google":"notranslate"}
};

export default function Layout({children}:{children:React.ReactNode}){
  return <div className="notranslate" translate="no">{children}</div>
}
