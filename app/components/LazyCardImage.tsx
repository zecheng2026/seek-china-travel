"use client";
import {useEffect,useRef,useState} from "react";
import type {ReactNode} from "react";

/** Defer off-screen decorative card images without changing the card's link or layout. */
export default function LazyCardImage({image,position,children}:{image:string;position:string;children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  if(!image)return;
  const node=ref.current;
  if(!node)return;
  if(!("IntersectionObserver" in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}
  },{rootMargin:"250px 0px"});
  observer.observe(node);
  return ()=>observer.disconnect();
 },[image]);
 return <div ref={ref} className="tourGroupedImage" style={visible&&image?{backgroundImage:`url("${image.replace(/"/g,"%22")}")`,backgroundPosition:position}:undefined}>{children}</div>;
}
