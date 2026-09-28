import { createClient } from "@supabase/supabase-js";
export function createBuildClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key) throw new Error("Supabase build environment is not configured.");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export const siteUrl="https://seekchinatravel.com";
