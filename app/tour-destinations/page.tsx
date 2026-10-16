import RegionToursClient from "./RegionToursClient";
import {createBuildClient} from "../../utils/supabase/build";
function key(v:unknown){return String(v??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[’‘`´']/g,"").replace(/[^a-zA-Z0-9]+/g,"").toLowerCase()}
export default async function Page({searchParams}:{searchParams:Promise<{slug?:string;multi?:string}>}){
 const {slug="",multi=""}=await searchParams;
 const db=createBuildClient();
 const multiMode=multi==="1";
 const [destResult,toursResult]=await Promise.all([
  multiMode?Promise.resolve({data:null,error:null}):db.from("destinations").select("*").eq("slug",slug).eq("is_active",true).maybeSingle(),
  db.from("tours").select("*").eq("is_published",true).order("sort_order",{ascending:true})
 ]);
 if(destResult.error||toursResult.error)throw new Error("Cannot pre-render region tours");
 const destination=multiMode?{name:"Multi-Destination",short_description:"Explore private journeys that connect several of China’s most iconic destinations in one seamless trip."}:destResult.data;
 const tours=(toursResult.data??[]).filter(t=>multiMode?key(t.destination)==="multidestination":destination&&(String(t.destination_id??"")===String(destination.id??"")||key(t.destination)===key(destination.name)));
 return <RegionToursClient initialSlug={slug} initialMulti={multiMode} initialDestination={destination??null} initialTours={tours}/>;
}
