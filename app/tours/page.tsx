import Link from "next/link";
const items=[
["Zhangjiajie Avatar Mountains","5 Days","Zhangjiajie","Private","zhangjiajie-5-day"],
["Beijing & Xi'an Classics","7 Days","Beijing · Xi'an","Private","china-classic"],
["Chongqing & Wulong","4 Days","Chongqing","Small Group","china-classic"],
["Guilin & Yangshuo Escape","4 Days","Guilin","Private","china-classic"],
["Chengdu Panda & Culture","4 Days","Chengdu","Private","china-classic"],
["China Highlights","10 Days","Beijing · Xi'an · Shanghai","Private","china-classic"]
];
export default function Tours(){return <main><section className="pageHero"><p className="eyebrow">FIND YOUR JOURNEY</p><h1>China Tours</h1><p>Start with one of our handpicked itineraries, then make it yours.</p></section><section className="section"><div className="filters"><button>All Tours</button><button>Private Tours</button><button>Small Groups</button><button>4–7 Days</button><button>8+ Days</button></div><div className="cards">{items.map((x,i)=><article className="card" key={x[0]}><div className={"cardImg ci"+(i%3)}><span>{x[2]}</span></div><div className="cardBody"><small>{x[1]} · {x[3]}</small><h3>{x[0]}</h3><p>Thoughtfully paced sightseeing, local experiences and flexible private service.</p><Link href={"/tours/"+x[4]}>View journey →</Link></div></article>)}</div></section></main>}