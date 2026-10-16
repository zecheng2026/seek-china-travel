import ToursClient from "./ToursClient";
import {createBuildClient} from "../../utils/supabase/build";
export default async function Page(){
 const db=createBuildClient();
 const [d,t]=await Promise.all([
  db.from("destinations").select("*").eq("is_active",true).order("sort_order",{ascending:true}),
  db.from("tours").select("*").eq("is_published",true).order("sort_order",{ascending:true})
 ]);
 if(d.error||t.error)throw new Error("Cannot pre-render tours catalog: "+(d.error?.message??t.error?.message));
 return <ToursClient initialDestinations={d.data??[]} initialTours={t.data??[]}/>;
}
