type Tour=Record<string,unknown>;
type Destination=Record<string,unknown>;
const normalize=(value:unknown)=>String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[’‘`´']/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const aliases:Record<string,string[]>={"xi an":["xian","xi an"],"zhangjiajie":["zhang jia jie"],"guilin":["yangshuo"],"chengdu":["cheng du"],"chongqing":["chong qing"],"jiuzhaigou":["jiuzhai valley","jiuzhai gou"]};
function wordsMatch(text:string,phrase:string){const token=normalize(phrase);return !!token&&(" "+text+" ").includes(" "+token+" ")}
function candidateNames(d:Destination){const name=normalize(d.name);const slug=normalize(d.slug);return [...new Set([name,slug,...(aliases[name]??[]),...(aliases[slug]??[])].filter(Boolean))]}
export function matchesDestination(t:Tour,d:Destination){if(t.destination_id!=null&&d.id!=null&&String(t.destination_id)===String(d.id))return true;const names=candidateNames(d);if(!names.length)return false;const direct=normalize(t.destination);if(names.some(n=>direct===normalize(n)))return true;
// Only route/title/highlight metadata, not freeform descriptions: avoids false positives
// from generic marketing text mentioning other cities.
const fields=[t.title,t.name,t.subtitle,t.destination,t.destinations,t.route,t.itinerary_summary,t.highlights];
return fields.some(value=>{const text=Array.isArray(value)?value.map(v=>typeof v==="string"?v:JSON.stringify(v)).join(" "):typeof value==="string"?value:"";const normalized=normalize(text);return names.some(n=>wordsMatch(normalized,n))})}
export function relatedTours(tours:Tour[],destination:Destination,limit=6){return tours.filter(t=>t.is_published!==false&&matchesDestination(t,destination)).slice(0,limit)}
