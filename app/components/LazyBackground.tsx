"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import type {CSSProperties,ReactNode} from "react";

/** Keep link and card semantics while deferring decorative images off-screen. */
export default function LazyBackgroundLink({image,position,className,href,children,label}:{image:string;position:string;className:string;href:string;children:ReactNode;label:string}){
 const ref=useRef<HTMLAnchorElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  if(!image)return;
  const node=ref.current;if(!node)return;
  if(!("IntersectionObserver" in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}
  },{rootMargin:"200px 0px"});
  observer.observe(node);return ()=>observer.disconnect();
 },[image]);
 const style:CSSProperties=visible&&image?{backgroundImage:`url("${image.replace(/"/g,"%22")}")`,backgroundPosition:position}:{};
 return <Link ref={ref} href={href} className={className} style={style} aria-label={label}>{children}</Link>;
}
