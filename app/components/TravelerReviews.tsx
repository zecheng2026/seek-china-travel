"use client";
import Link from "next/link";

type Review=Record<string,unknown>;
export default function TravelerReviews({reviews,variant="home"}:{reviews:Review[];variant?:"home"|"contact"}){
  const isContact=variant==="contact";
  return <>
{reviews.length>0&&<section id={isContact?"traveler-reviews":undefined} className="v1Section v1Reviews v1JourneyStories">
      <header className="v1StoryHeading">
        <div><p className="v1Eyebrow red">TRAVELER REVIEWS &amp; STORIES</p><h2>Real Journeys. Real Stories.</h2><p className="v1StoryIntro">Every China journey is different. Hear from travelers who explored the cities, landscapes and culture of China with SCT.</p></div>
        <Link className="v1StoryHeaderLink" href={isContact?"/quote":"/contact#traveler-reviews"}>{isContact?"Plan your own journey →":"Read more reviews →"}</Link>
      </header>
      <div className="v1JourneyStoryGrid">{reviews.map((r,i)=>{
        const traveler=String(r.name??"Traveler").trim()||"Traveler";
        const country=String(r.country??"").trim();
        const route=String(r.route??"").trim();
        const destinations=route.split(/\s*(?:→|➝|·|,|\/|\\|\||;|–|—)\s*/).map(x=>x.trim()).filter(Boolean).slice(0,6);
        const duration=String(r.duration_days??r.days??"").trim();
        const rating=Number(r.rating);
        const validRating=r.rating!==undefined&&r.rating!==null&&r.rating!==""&&Number.isInteger(rating)&&rating>=1&&rating<=5;
        const photos=Array.isArray(r.images)?r.images.filter((src:unknown)=>typeof src==="string"&&src.trim()).slice(0,3):[];
        return <article className="v1JourneyStory" key={String(r.id??i)}>
          <div className="v1JourneyStoryTop"><span className="v1JourneyStoryLabel">CHINA JOURNEY {String(i+1).padStart(2,"0")}</span>{validRating&&<span className="v1Stars" aria-label={rating+" out of 5 stars"}>{"★".repeat(rating)}{"☆".repeat(5-rating)}</span>}</div>
          {route&&<h3>{route}</h3>}
          {(destinations.length>1||duration)&&<div className="v1JourneyTags">{duration&&<span>{duration}{/^\d+$/.test(duration)?" Days":""}</span>}{destinations.length>1&&destinations.map((city,n)=><span key={n}>{city}</span>)}</div>}
          <blockquote>“{String(r.text??"").trim()}”</blockquote>
          {photos.length>0&&<div className="v1ReviewShots">{photos.map((src:unknown,n:number)=><div className="v1ReviewShot" key={n}><img src={String(src)} alt={"Review attachment from "+traveler+" "+(n+1)} loading="lazy"/>{n===2&&Array.isArray(r.images)&&r.images.length>3&&<span>+{r.images.length-3}</span>}</div>)}</div>}
          <footer><b>{traveler}</b>{country&&<span>{country}</span>}</footer>
        </article>
      })}</div>
      <div className="v1JourneyStoryBottom"><p>Your journey will have its own story. Let us help you plan it.</p><Link href={isContact?"/quote":"/contact#traveler-reviews"} className="v1StoryButton">{isContact?"Start Planning Your Trip →":"Read More Reviews →"}</Link></div>
    </section>}
  </>;
}
