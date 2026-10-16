import DestinationsClient from "./DestinationsClient";
import {createBuildClient} from "../../utils/supabase/build";
export default async function Page(){
 const {data,error}=await createBuildClient().from("destinations").select("*").eq("is_active",true).order("sort_order",{ascending:true});
 if(error)throw new Error("Cannot pre-render destinations catalog: "+error.message);
 return <DestinationsClient initialItems={data??[]}/>;
}
