import TravelGuideClient from "./TravelGuideClient";
import {createBuildClient} from "../../utils/supabase/build";
export default async function Page(){
 const {data,error}=await createBuildClient().from("travel_guides").select("*").order("created_at",{ascending:false});
 if(error)throw new Error("Cannot pre-render travel guides: "+error.message);
 const guides=(data??[]).filter(r=>r.is_published!==false&&r.is_active!==false&&r.category!=="China Travel Updates");
 return <TravelGuideClient initialRows={guides}/>;
}
