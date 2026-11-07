"use client";
import {useEffect,useRef,useState} from "react";
import type {CSSProperties,ReactNode} from "react";

/** Defers decorative CSS background downloads until close to the viewport. */
export default function LazyBackground({image,position,className,children}:{image:string;position:string;className:string;children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  if(!image)return;
  const node=ref.current;
  if(!node)return;
  if(!("IntersectionObserver" in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}
  },{rootMargin:"200px 0px"});
  observer.observe(node);
  return ()=>observer.disconnect();
 },[image]);
 const style:CSSProperties=visible&&image?{backgroundImage:`url("${image.replace(/"/g,"%22")}")`,backgroundPosition:position}:{}; 
 return <div ref={ref} className={className} style={style}>{children}</div>;
}
