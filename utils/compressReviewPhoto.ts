/** Review photos: compress every upload before it reaches Storage. */
export async function compressReviewPhoto(file:File):Promise<File>{
 if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Choose a JPG, PNG or WebP photo.");
 if(file.size>15*1024*1024)throw new Error("Each original photo must be under 15 MB.");
 const image=await createImageBitmap(file);
 try{
  const scale=Math.min(1,1600/Math.max(image.width,image.height));
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(image.width*scale));
  canvas.height=Math.max(1,Math.round(image.height*scale));
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Photo processing is unavailable.");
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error("Photo compression failed.")),"image/webp",0.78));
  if(blob.type!=="image/webp"||blob.size>2*1024*1024)throw new Error("Photo is too large after compression.");
  return new File([blob],crypto.randomUUID()+".webp",{type:"image/webp"});
 }finally{image.close();}
}
