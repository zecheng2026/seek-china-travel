import type {SupabaseClient} from "@supabase/supabase-js";
import {compressReviewPhoto} from "./compressReviewPhoto";
export async function submitReviewWithPhotos(supabase:SupabaseClient,details:{
 p_context_type:string;p_context_slug:string;p_name:string;p_email:string;p_rating:number;p_body:string;p_website:string
},files:File[]){
 const {data,error}=await supabase.rpc("submit_traveler_review_with_photos",details);
 if(error)throw error;
 const row=Array.isArray(data)?data[0]:data;
 if(!row?.review_id||!row?.upload_token)throw new Error("Review was submitted but the upload session is unavailable.");
 const paths:string[]=[];
 for(const file of files){
  const photo=await compressReviewPhoto(file);
  const path=row.review_id+"/"+row.upload_token+"/"+photo.name;
  const {error:uploadError}=await supabase.storage.from("review-photos").upload(path,photo,{contentType:"image/webp",upsert:false});
  if(uploadError)throw new Error("Review submitted for moderation, but a photo could not be uploaded: "+uploadError.message);
  paths.push(path);
 }
 const {error:attachError}=await supabase.rpc("attach_review_photos",{p_id:row.review_id,p_token:row.upload_token,p_paths:paths});
 if(attachError)throw new Error("Review submitted, but attaching photos failed: "+attachError.message);
}
export function reviewPhotoUrls(paths:unknown,baseUrl:string):string[]{
 if(!Array.isArray(paths))return [];
 return paths.filter((p):p is string=>typeof p==="string"&&/^(?:admin\/)?[a-f0-9-]{36}\//.test(p))
  .map(p=>baseUrl+"/storage/v1/object/public/review-photos/"+p.split("/").map(encodeURIComponent).join("/"));
}
