import React, { useEffect, useRef, useState } from "react";
const looks = [
 {name:"Living room",colour:"#d5c8b2",image:"photo-1600210492486-724fe5c67fb0",detail:"Natural light · Neutral colours · Wood furniture"},
 {name:"Open-plan space",colour:"#b4b6a3",image:"photo-1600607687920-4e2a09cf159d",detail:"Open layout · Light finishes · Modern furniture"},
 {name:"Soft neutrals",colour:"#b6a38f",image:"photo-1600210491892-03d54c0aaf87",detail:"Soft upholstery · Warm colours · Simple decor"}
];
const source=(id,w=1600)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
export default function InteriorRoom(){
 const section=useRef(null), layers=useRef([]);
 const [look,setLook]=useState(0),[reduced,setReduced]=useState(false),[failed,setFailed]=useState({});
 const paint=value=>{const scaled=Math.min(2,value*2.6);layers.current.forEach((el,i)=>{if(el)el.style.opacity=i===0?1:Math.max(0,Math.min(1,scaled-i+1));});setLook(Math.min(2,Math.round(scaled)));};
 useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");const change=()=>setReduced(media.matches);change();media.addEventListener("change",change);return()=>media.removeEventListener("change",change);},[]);
 useEffect(()=>{let raf=0;const update=()=>{raf=0;if(reduced)return;const rect=section.current.getBoundingClientRect();paint(Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-innerHeight))));};const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};addEventListener("scroll",scroll,{passive:true});addEventListener("resize",scroll);update();return()=>{removeEventListener("scroll",scroll);removeEventListener("resize",scroll);cancelAnimationFrame(raf);};},[reduced]);
 const choose=i=>{paint(i/2.6);if(!reduced){const top=section.current.getBoundingClientRect().top+scrollY;window.scrollTo({top:top+(section.current.offsetHeight-innerHeight)*i/2.6,behavior:"smooth"});}};
 return <section ref={section} className={`ai-room-scroll ${reduced?"ai-room-reduced":""}`} id="top" aria-label="Room design photographs"><div className="ai-room-sticky">
 <div className="ai-room-heading"><span className="ai-eyebrow">AARA INTERIORS / HOMES & WORKSPACES</span><h1>Modern interiors.<br/><em>Find your style.</em></h1><p>Explore room layouts, furniture, and colour combinations. Scroll to see different interiors.</p><a href="#spaces" className="ai-text-link">View design concepts ↗</a></div>
 <div className="ai-room-visual ai-room-photographs" role="img" aria-label={`${looks[look].name} interior photograph. ${looks[look].detail}`}>
 {looks.map((item,i)=><div key={item.name} ref={el=>{layers.current[i]=el;}} className="ai-room-photo-layer" style={{opacity:i===0?1:0}} aria-hidden="true"><img src={source(item.image)} srcSet={`${source(item.image,900)} 900w, ${source(item.image,1600)} 1600w`} sizes="(max-width:700px) 88vw, 58vw" alt="" width="1600" height="1800" fetchPriority={i===0?"high":"auto"} onError={()=>setFailed(v=>({...v,[i]:true}))}/>{failed[i]&&<div className="ai-room-photo-error">Room photo could not load. Please check your connection.</div>}</div>)}
 <span className="ai-room-photo-label">{String(look+1).padStart(2,"0")} / {looks[look].name.toUpperCase()}</span></div>
 <div className="ai-room-controls"><div><span className="ai-eyebrow">{reduced?"SELECT A ROOM":"SCROLL TO EXPLORE ROOM DESIGNS ↓"}</span><p>{looks[look].detail}</p></div><div className="ai-room-options" role="group" aria-label="Room design">{looks.map((item,i)=><button key={item.name} aria-pressed={look===i} onClick={()=>choose(i)}><i style={{background:item.colour}}/>{item.name}</button>)}</div></div>
 </div></section>;
}
