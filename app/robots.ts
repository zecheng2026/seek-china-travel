import type {MetadataRoute} from "next";
import {siteUrl} from "../utils/supabase/build";
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:"*",allow:"/",disallow:["/admin/"]}],sitemap:siteUrl+"/sitemap.xml",host:siteUrl}}
