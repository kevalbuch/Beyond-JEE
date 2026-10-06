/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const Mo=window.Motion, gs=window.gsap;
const canG=!!gs&&!reduce, canM=!!(Mo&&Mo.animate)&&!reduce;
if(gs&&window.ScrollTrigger) gs.registerPlugin(ScrollTrigger);
const EASE=[0.22,1,0.36,1];
function anim(t,kf,o){ if(!canM||!t||(t.length===0)) return null; try{return Mo.animate(t,kf,o)}catch(e){return null} }
function stag(n){ return (Mo&&Mo.stagger)?Mo.stagger(n):0 }
function done(a,fn){ if(!a){fn();return} try{ (a.finished||a).then(fn) }catch(e){ fn() } }
function stLabel(st){ return st==="c"?"Confirmed":st==="m"?"Date set":"Expected" }
function stTitle(st){ return st==="c"?"Confirmed by the conducting body":st==="m"?"Exam date confirmed, form expected":"Projected from last year" }
function stat(st){ return '<span class="sd sd-'+st+'" title="'+stTitle(st)+'"><i></i>'+stLabel(st)+'</span>' }
function gmark(t){ return '<span class="gm" title="Benefit for girl candidates">Girls: '+t+'</span>' }
function urg(d){ return d<=30?"u-red":d<=60?"u-amber":"u-blue" }
function chips(host,list,cur,pick){
  host.innerHTML=list.map(([k,l])=>'<button type="button" class="chip" data-k="'+k+'" aria-pressed="'+(k===cur)+'">'+l+'</button>').join("");
  host.onclick=e=>{ const b=e.target.closest(".chip"); if(!b) return; $$(".chip",host).forEach(c=>c.setAttribute("aria-pressed",c===b)); pick(b.dataset.k) };
}
function exById(id){ return EX.find(x=>x.id===id) }
const VIEWS=["home","notif","soon","cal","exams","girls","syllabus","careers","cutoffs","counsel","faq","finder","plan","sources"];
const VLABEL={home:"Home",notif:"Notifications",soon:"Closing soon",cal:"Calendar",exams:"Exams",girls:"For girls",syllabus:"Syllabus",careers:"Careers",cutoffs:"Cutoffs",counsel:"Counselling",faq:"FAQs and myths",finder:"Find my route",plan:"My list",sources:"Official portals"};
function goView(id,o){
  o=o||{}; if(!VIEWS.includes(id)) id="home";
  const was=$(".view:not([hidden])");
  $$(".view").forEach(v=>{ v.hidden=v.id!==id });
  $$("[data-s]").forEach(a=>{ const on=a.dataset.s===id; a.classList.toggle("on",on); if(on) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current") });
  const nm=$("#navMore"); if(nm){ const on=$(".nav-sub a.on",nm); if(on) nm.open=true }
  const mb=$("#moreBtn"); if(mb) mb.classList.toggle("on",!!$('#moreSheet [data-s="'+id+'"]'));
  document.title=(id==="home"?"Beyond JEE":VLABEL[id]+" · Beyond JEE");
  if(o.push!==false&&location.hash!=="#"+id){ try{ history.pushState(null,"","#"+id) }catch(e){ location.hash=id } }
  if(o.scroll!==false) window.scrollTo(0,0);
  if(!was||was.id!==id){ if(id==="cal"&&typeof animCal==="function") animCal(); else { const v=$("#"+id); anim(v,{opacity:[0,1],transform:["translateY(8px)","translateY(0px)"]},{duration:.25,ease:EASE}) } }
}
function scrollToEl(el){
  const v=el.closest?el.closest(".view"):null;
  if(v&&v.hidden) goView(v.id,{scroll:false});
  if(v&&el===v) window.scrollTo(0,0); else el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
}
function openMore(){ const m=$("#moreSheet"); if(m) m.hidden=false }
function closeMore(){ const m=$("#moreSheet"); if(m) m.hidden=true }
window.addEventListener("popstate",()=>goView((location.hash||"#home").slice(1),{push:false}));
document.addEventListener("click",e=>{
  const m=e.target.closest("#moreBtn"); if(m){ openMore(); return }
  if(e.target.closest("[data-closemore]")){ closeMore(); return }
  const a=e.target.closest("[data-go],a[href^='#']"); if(!a) return;
  const id=a.dataset.go||(a.getAttribute("href")||"").slice(1);
  if(id==="top") { e.preventDefault(); goView("home"); return }
  if(VIEWS.includes(id)&&!a.hasAttribute("data-open")){ e.preventDefault(); closeMore(); goView(id) }
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeMore() });

/* ---------- my list ---------- */
let plan=[];
try{ const raw=localStorage.getItem("bj-plan"); if(raw) plan=JSON.parse(raw).filter(id=>exById(id)) }catch(e){}
function savePlan(){ try{localStorage.setItem("bj-plan",JSON.stringify(plan))}catch(e){} }
function togglePlan(id){ plan=plan.includes(id)?plan.filter(x=>x!==id):plan.concat(id); savePlan(); syncPlan() }
function addPlan(ids){ ids.forEach(id=>{ if(!plan.includes(id)) plan.push(id) }); savePlan(); syncPlan() }
function syncPlan(){
  $$("[data-plan]").forEach(b=>{ const on=plan.includes(b.dataset.plan); b.setAttribute("aria-pressed",on); b.textContent=on?"On my list":"Add to my list" });
  $("#pillN").textContent=plan.length+"/10";
  renderPlan(); renderTiles();
}
document.addEventListener("click",e=>{
  const p=e.target.closest("[data-plan]"); if(p){ togglePlan(p.dataset.plan); return }
  const o=e.target.closest("[data-open]"); if(o){ e.preventDefault(); openExam(o.dataset.open); return }
  const r=e.target.closest("[data-rm]"); if(r){ togglePlan(r.dataset.rm) }
});

/* ---------- section A: closing soon ---------- */
function daysTo(iso){ return Math.ceil((new Date(iso).getTime()-Date.now())/864e5) }
function shortDate(iso){ return new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"}) }
function renderTickets(){
  $("#tickets").innerHTML=TICKETS.map(t=>{
    let big,unit,u="",txt="";
    if(t.kind==="w"){ big=t.big; unit=t.unit; txt=" txt" }
    else{
      const d=daysTo(t.due);
      if(d<=0){ big="Closed"; unit="check the portal"; txt=" txt" }
      else{ big=String(d); u=" "+urg(d); unit=(d===1?"day left":"days left")+(t.open&&Date.now()<new Date(t.open).getTime()?". Form opens "+shortDate(t.open):"") }
    }
    return '<article class="due'+(t.kind==="w"?" w":"")+(t._live?" live":"")+'">'+
      '<div class="due-n'+u+txt+'"><b>'+big+'</b><small>'+unit+'</small></div>'+
      '<div class="due-b"><h3>'+t.n+stat(t.kind==="w"?"m":"c")+'</h3><p>'+t.sub+'</p></div>'+
      '<dl class="due-f"><div class="cl"><dt>'+(t.kind==="w"?"Form closes":"Last date")+'</dt><dd>'+(t.kind==="w"?t.close:'<span class="hl">'+t.close+'</span>')+'</dd></div><div class="ex"><dt>Exam</dt><dd><span class="hlc">'+t.exam+'</span></dd></div></dl>'+
      '<div class="due-a"><a href="'+t.url+'" target="_blank" rel="noopener">'+t.host+'</a>'+(t.eid?'<button type="button" data-ics="'+t.eid+'">Remind me</button>':"")+'</div></article>';
  }).join("");
}
function renderHero(){
  const up=TICKETS.filter(t=>t.kind!=="w"&&daysTo(t.due)>0).sort((a,b)=>new Date(a.due)-new Date(b.due));
  const num=$("#countNum"), who=$("#countWho"), nx=$("#countNext");
  if(!up.length){ num.textContent="0"; $("#countTop").textContent="Applications"; who.innerHTML="are closed for the confirmed exams. Check each portal."; nx.innerHTML=""; return }
  const first=up[0], d=daysTo(first.due);
  const grp=up.filter(t=>shortDate(t.due)===shortDate(first.due));
  const nm=t=>t.n.replace(/ 20\d\d.*$/,"");
  num.textContent=String(d); num.dataset.n=String(d);
  $("#countTop").textContent="Closing soonest";
  who.innerHTML=(d===1?"day":"days")+" left to apply for <span class=\"hl\">"+grp.map(nm).join(" and ")+"</span>";
  nx.innerHTML=up.slice(grp.length,grp.length+3).map(t=>{ const x=daysTo(t.due); return '<li><span class="d">'+shortDate(t.due)+'</span><span class="n">'+nm(t)+'</span><span class="c '+urg(x)+'">'+x+' days</span></li>' }).join("");
}

/* ---------- section B: calendar ---------- */
const calState={cat:"all",st:"all"};
const MONS=[["Oct","Oct 2026"],["Nov","Nov 2026"],["Dec","Dec 2026"],["Jan","Jan 2027"],["Feb","Feb 2027"],["Mar","Mar 2027"],["Apr","Apr 2027"],["May","May 2027"],["Jun","Jun 2027"],["Jul","Jul 2027"]];
function closeMonth(r){ const m=r.as.match(/Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul/g); return m?m[m.length-1]:null }
function nowMon(){ return new Date().toLocaleDateString("en-US",{month:"short",timeZone:"Asia/Kolkata"}) }
function renderCal(animate){
  const rows=CAL.map((r,i)=>Object.assign({i},r)).filter(r=>(calState.cat==="all"||r.cat===calState.cat)&&(calState.st==="all"||(calState.st==="c"&&(r.st==="c"||r.st==="m"))||(calState.st==="e"&&(r.st==="e"||r.st==="m"))));
  const now=nowMon();
  let html="";
  MONS.forEach(([k,label])=>{
    const rs=rows.filter(r=>closeMonth(r)===k); if(!rs.length) return;
    html+='<section class="mc'+(k===now?" now":"")+'" aria-label="'+label+'"><h3><span>'+label.split(" ")[0]+'<small>'+label.split(" ")[1]+'</small></span>'+(k===now?'<em>This month</em>':'<b>'+rs.length+'</b>')+'</h3><ul>'+
      rs.map(r=>'<li><button type="button" class="mr '+(r.st==="e"?"e":"c")+'" data-i="'+r.i+'"><span class="dt dt-'+r.st+'"><span class="vh">'+stLabel(r.st)+'</span></span><span class="mn">'+r.sn+(r.ex&&GB[r.ex]?'<i class="gdot" title="Benefit for girl candidates"></i>':"")+(r._live?'<i class="live-dot" title="Live-verified from the official site"></i>':"")+'</span><span class="md'+(r.st==="c"?" hl":"")+'">'+r.as+'</span></button></li>').join("")+'</ul></section>';
  });
  const host=$("#calOut");
  host.innerHTML=html?'<div class="mgrid" id="mgrid">'+html+'</div>':'<p class="empty">No exams match this filter. Try another field or status.</p>';
  if(window.matchMedia("(max-width:759px)").matches){ const g=$("#mgrid"), n=$(".mc.now",host)||$(".mc",host); if(g&&n) g.scrollLeft=Math.max(0,n.offsetLeft-16) }
  if(animate!==false) animCal();
}
function animCal(){ anim($$(".mc",$("#calOut")),{opacity:[0,1],transform:["translateY(14px)","translateY(0px)"]},{duration:.4,delay:stag(.05),ease:EASE}) }
function openCalRow(i){
  const r=CAL[i]; if(!r) return;
  $("#calSheetIn").innerHTML='<button class="sheet-x" type="button" data-closecal aria-label="Close">×</button>'+
   '<div class="cs-h"><h3>'+r.n+'</h3>'+stat(r.st)+(r.ex&&GB[r.ex]?gmark(GB[r.ex]):"")+'</div><p class="cs-s">'+CATNAME[r.cat]+'</p>'+
   '<div class="facts cs-f"><div class="fact ap"><h4>Forms close</h4><p>'+r.a+'</p></div><div class="fact ex"><h4>Exam</h4><p>'+r.e+'</p></div></div>'+
   '<div class="ex-foot">'+(r.ex?'<button class="mb pri" type="button" data-plan="'+r.ex+'" aria-pressed="false">Add to my list</button><a class="mb" href="#exams" data-open="'+r.ex+'">Full details</a>':"")+'</div>';
  syncPlanButtons();
  const sh=$("#calSheet"); sh.hidden=false; $("#calSheetIn").focus({preventScroll:true});
}
function closeCal(){ const sh=$("#calSheet"); if(sh) sh.hidden=true }
document.addEventListener("click",e=>{
  const m=e.target.closest(".mr"); if(m){ openCalRow(+m.dataset.i); return }
  if(e.target.closest("[data-closecal]")) closeCal();
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeCal() });
function syncPlanButtons(){ $$("[data-plan]").forEach(b=>{ const on=plan.includes(b.dataset.plan); b.setAttribute("aria-pressed",on); b.textContent=on?"On my list":"Add to my list" }) }

/* ---------- section C: exams (list + detail) ---------- */
let exCat="eng", exSel=null;
function spec(h,v){ return v?'<div><dt>'+h+'</dt><dd>'+v+'</dd></div>':"" }
function fact(c,h,v){ return v?'<div class="fact '+c+'"><h4>'+h+'</h4><p>'+v+'</p></div>':"" }
function exRow(x){
  return '<button type="button" class="exr" data-ex="'+x.id+'" aria-pressed="false"><span class="exr-n">'+x.n+'</span>'+stat(x.st)+(GB[x.id]?gmark(GB[x.id]):"")+'<span class="exr-s">'+x.full+'</span></button>';
}
function exDetail(x){
  return '<button class="back" type="button" data-exback>← All exams</button>'+
  '<div class="sx-h"><h3>'+x.n+'</h3>'+stat(x.st)+(GB[x.id]?gmark(GB[x.id]):"")+'</div><p class="sx-s">'+x.full+' · '+x.body+'</p><div class="sx-in">'+
  '<div class="facts">'+fact("ap","Apply",x.apply)+fact("ex","Exam date",x.exam)+fact("fee","Fee",x.fee)+'</div>'+
  '<dl class="spec">'+spec("Leads to",x.leads)+'</dl>'+'<details class="more"><summary>Eligibility, pattern and syllabus</summary><dl class="spec">'+spec("Eligibility",x.elig)+spec("Pattern",x.pattern)+spec("Syllabus",x.syl)+'</dl></details>'+
  (GD[x.id]?'<div class="callout girl"><h4>For girl candidates</h4><p>'+GD[x.id]+'</p></div>':"")+(x.note?'<div class="callout note"><h4>Good to know</h4><p>'+x.note+'</p></div>':"")+
  '<div class="ex-foot"><a class="mb pri" href="'+x.portal[1]+'" target="_blank" rel="noopener">Official portal: '+x.portal[0]+' ↗</a><button class="mb" type="button" data-plan="'+x.id+'" aria-pressed="false">Add to my list</button><button class="mb" type="button" data-cmp="'+x.id+'">Compare</button></div></div>';
}
function selectEx(id,show){
  const x=exById(id); if(!x) return; exSel=id;
  $$(".exr").forEach(b=>b.setAttribute("aria-pressed",b.dataset.ex===id));
  $("#exDet").innerHTML=exDetail(x); syncPlanButtons();
  if(show){ $(".exm").classList.add("open"); $("#exams").classList.add("det-open") }
}
function renderEx(selId){
  const list=EX.filter(x=>x.cat===exCat), m=MINI[exCat];
  $("#exams").classList.remove("det-open");
  $("#exOut").innerHTML='<div class="exm"><div class="exm-list">'+list.map(exRow).join("")+'</div><div class="exm-det" id="exDet"></div></div>'+
    (m?'<div class="mini"><h3>'+m[0]+'</h3>'+m[1].map(r=>'<div class="mi"><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join("")+'</div>':"");
  selectEx(selId&&list.some(x=>x.id===selId)?selId:list[0].id,false);
}
$("#exOut").addEventListener("click",e=>{
  const r=e.target.closest(".exr");
  if(r){ selectEx(r.dataset.ex,true); window.scrollTo(0,0); return }
  if(e.target.closest("[data-exback]")){ $(".exm").classList.remove("open"); $("#exams").classList.remove("det-open"); window.scrollTo(0,0) }
});
function openExam(id){
  const x=exById(id); if(!x) return; closeCal();
  if(exCat!==x.cat){ exCat=x.cat; $$("#exCat .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.k===exCat)) }
  renderEx(id);
  goView("exams");
  selectEx(id,true);
}

/* ---------- home tiles ---------- */
function renderTiles(){
  const host=$("#tiles"); if(!host) return;
  const T=[["notif","bell","Notifications","New updates from official exam pages"],["soon","clock","Closing soon","Deadlines counted from today"],["cal","cal","Calendar","Every form window, month by month"],["exams","exam","Exams",EX.length+" exams with fees, eligibility and syllabus"],["girls","heart","For girls","Seats, fee cuts and scholarships"],["syllabus","book","Syllabus","One PCM syllabus, and what each exam tests"],["careers","brief","Careers","Roles and starting pay by route"],["cutoffs","chart","Cutoffs","Last year’s closing ranks and scores"],["counsel","flow","Counselling","JoSAA, state and BITS, step by step"],["faq","help","FAQs and myths","Short answers from the official rules"],["finder","compass","Find my route","Three questions, two matches"],["plan","list","My list",plan.length+" of 10 exams, with reminders"],["sources","link","Official portals","Apply only on these sites"]];
  host.innerHTML=T.map(t=>'<a class="tile" href="#'+t[0]+'" data-go="'+t[0]+'"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+t[1]+'"/></svg><b>'+t[2]+'</b><small>'+t[3]+'</small></a>').join("");
}

/* ---------- section G: my list ---------- */
function renderPlan(){
  const items=plan.map(exById).filter(Boolean).sort((a,b)=>a.sort-b.sort);
  let h='<div class="plan-h"><span class="plan-n">'+items.length+'</span><span class="label">of 10 exams on your list</span></div>';
  if(!items.length) h+='<p class="empty">Nothing here yet. Use “Add to my list” on any exam, or finish the path finder.</p>';
  else h+=items.map(x=>'<div class="pl-row">'+stat(x.st)+'<div><b>'+x.n+'</b><span>Apply: <strong>'+x.apply+'</strong></span></div><button class="mb" type="button" data-rm="'+x.id+'">Remove</button></div>').join("");
  if(items.length>10) h+='<p class="warn">That is more than 10 exams. Travel and exam fatigue in April–June start to hurt JEE and board scores, so consider dropping the lowest-value ones.</p>';
  $("#planOut").innerHTML=h;
}
