import DestinationsClient from "./DestinationsClient";
import {createBuildClient} from "../../utils/supabase/build";
export default async function Page(){
 const client=createBuildClient();
 const [{data:destinations,error:destinationsError},{data:tours,error:toursError}]=await Promise.all([
  client.from("destinations").select("*").eq("is_active",true).order("sort_order",{ascending:true}),
  client.from("tours").select("*").eq("is_published",true).eq("is_featured",true).order("sort_order",{ascending:true}).limit(3)
 ]);
 if(destinationsError)throw new Error("Cannot pre-render destinations catalog: "+destinationsError.message);
 if(toursError)throw new Error("Cannot pre-render featured tours: "+toursError.message);
 return <DestinationsClient initialItems={destinations??[]} initialTours={tours??[]}/>;
}
