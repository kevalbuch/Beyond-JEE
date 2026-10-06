/* ---------- section D: syllabus ---------- */
function renderCore(){
  $("#core").innerHTML=Object.entries(CORE).map(([sub,groups])=>
    '<div class="sb sb-'+sub.slice(0,3).toLowerCase()+'"><h3>'+sub+'</h3>'+groups.map(([gname,items])=>(gname?'<h5>'+gname+'</h5>':"")+'<div class="tags">'+items.map(i=>"<span>"+i+"</span>").join("")+"</div>").join("")+"</div>").join("");
}
function renderMatrix(){
  $("#matrix").innerHTML='<thead><tr><th>Exam</th>'+MXC.map(c=>"<th>"+c+"</th>").join("")+"</tr></thead><tbody>"+
    MX.map(r=>"<tr><td>"+r[0]+"</td>"+r[1].map((v,i)=>'<td>'+(v?'<i class="bub f" title="'+MXC[i]+'"></i><span class="vh">Yes</span>':'<span class="vh">No</span>')+"</td>").join("")+"</tr>").join("")+"</tbody>";
}

/* ---------- section E: careers ---------- */
let carKey="eng";
function renderCar(animate){
  const c=CAR[carKey];
  $("#carOut").innerHTML='<div class="cpanel" id="carPanel">'+
    '<div class="stack"><div class="dl"><h4>'+c.s+'</h4><p>'+c.f+'</p></div><div class="callout grow"><h4>Growth paths</h4><p>'+c.g+'</p></div><div class="callout risk"><h4>Reality check</h4><p>'+c.r+'</p></div></div>'+
    '<div><div class="dl"><h4>Roles and pay</h4></div><ul class="jobs">'+c.jobs.map(j=>"<li><span>"+j[0]+"</span><span>"+j[1]+"</span></li>").join("")+"</ul>"+
    (c.ex.length?'<div class="dl" style="margin-top:16px"><h4>Exams that lead here</h4></div><div class="cc">'+c.ex.map(id=>{const x=exById(id);return '<button class="mb" type="button" data-open="'+id+'">'+x.n+'</button>'}).join("")+"</div>":"")+"</div></div>";
  $$(".prow").forEach(r=>r.classList.toggle("on",r.dataset.t===carKey));
  if(animate){
    anim($("#carPanel"),{opacity:[0,1],transform:["translateY(12px)","translateY(0px)"]},{duration:.4,ease:EASE});
    anim($$(".prow.on .pb"),{transform:["scaleX(0)","scaleX(1)"]},{duration:.7,delay:stag(.06),ease:EASE});
  }
}
function fmt(n){ return Number.isInteger(n)?String(n):String(n) }
function renderPay(){
  $("#payOut").innerHTML=PAY.map(r=>{
    const left=r[2]/45*100, w=Math.max((r[3]-r[2])/45*100,1.2);
    return '<div class="prow" data-t="'+r[0]+'"><div class="l">'+r[1]+'</div><div class="t"><i class="pb" style="left:'+left+'%;width:'+w+'%"></i></div><div class="v">'+fmt(r[2])+"–"+fmt(r[3])+"</div></div>";
  }).join("");
}

/* ---------- section F: path finder ---------- */
let qi=0, qs={};
function renderQz(){
  const host=$("#qz");
  if(qi<QZ.length){
    const q=QZ[qi];
    host.innerHTML='<div class="qz-p" aria-hidden="true">'+QZ.map((_,i)=>'<i class="'+(i<=qi?"on":"")+'"></i>').join("")+'</div>'+
      '<p class="qz-n">Question '+(qi+1)+' of '+QZ.length+'</p><h3 class="qz-q">'+q.q+'</h3>'+
      '<div class="qz-o">'+q.o.map((o,i)=>'<button type="button" class="qo" data-i="'+i+'"><i class="omr" aria-hidden="true">'+"ABCDE"[i]+'</i><span>'+o[0]+'</span></button>').join("")+'</div>';
    anim($$(".qo",host),{opacity:[0,1],transform:["translateX(-14px)","translateX(0px)"]},{duration:.4,delay:stag(.05),ease:EASE});
  }else{
    const ranked=Object.keys(CAR).map((k,i)=>({k,s:qs[k]||0,i})).sort((a,b)=>b.s-a.s||a.i-b.i).slice(0,2);
    host.innerHTML='<p class="qz-n">Your two closest routes</p><div class="res">'+ranked.map(r=>{
      const c=CAR[r.k], p=PATHS[r.k];
      return '<article class="rc"><h3>'+c.t+'</h3><p>'+c.f+'</p><div class="dl"><h4>Exam set</h4><p>'+p.set+'</p></div><div class="callout act"><h4>Do this now</h4><p>'+p.now+'</p></div>'+
        '<div class="cc">'+(p.ids.length?'<button class="mb" type="button" data-addset="'+p.ids.join(",")+'">Add these exams to my list</button>':"")+'<button class="mb" type="button" data-route="'+r.k+'">See the career route</button></div></article>';
    }).join("")+'</div><div class="cc" style="margin-top:22px"><button class="mb" type="button" id="qzRe">Retake</button></div>';
    anim($$(".rc",host),{opacity:[0,1],transform:["translateY(18px)","translateY(0px)"]},{duration:.5,delay:stag(.1),ease:EASE});
  }
}
$("#qz").addEventListener("click",e=>{
  const o=e.target.closest(".qo");
  if(o){ const sc=QZ[qi].o[+o.dataset.i][1]; Object.keys(sc).forEach(k=>qs[k]=(qs[k]||0)+sc[k]); qi++; renderQz(); return }
  const a=e.target.closest("[data-addset]"); if(a){ addPlan(a.dataset.addset.split(",")); a.textContent="Added to my list"; return }
  const r=e.target.closest("[data-route]"); if(r){ carKey=r.dataset.route; $$("#carCat .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.k===carKey)); renderCar(true); scrollToEl($("#careers")); return }
  if(e.target.id==="qzRe"){ qi=0; qs={}; renderQz() }
});

/* ---------- section G and H ---------- */
function renderGoals(){
  $("#goals").innerHTML="<thead><tr><th>Goal</th><th>Must take</th><th>Strong add-ons</th><th>Skip or low value</th></tr></thead><tbody>"+GOALS.map(r=>"<tr>"+r.map(c=>"<td>"+c+"</td>").join("")+"</tr>").join("")+"</tbody>";
  $("#steps").innerHTML=STEPS.map(s=>"<li><span>"+s+"</span></li>").join("");
  $("#traps").innerHTML=TRAPS.map(s=>"<li>"+s+"</li>").join("");
  $("#src").innerHTML=SOURCES.map(s=>'<a href="'+s[2]+'" target="_blank" rel="noopener"><span>'+s[0]+"</span><span>"+s[1]+" ↗</span></a>").join("");
}

/* ---------- motion layer ---------- */
function onceInView(el,fn,margin){
  if(!el||!("IntersectionObserver" in window)) return;
  const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); fn() } },{rootMargin:margin||"0px 0px 15% 0px"});
  io.observe(el);
}
function startMotion(){
  /* one orchestrated moment: the day count rolls up and the red pen circles it */
  const num=$("#countNum"), circ=$("#countCirc");
  if(canG&&num&&circ){
    const n=+(num.dataset.n||0), o={v:0};
    circ.style.strokeDasharray="1"; circ.style.strokeDashoffset="1";
    num.textContent="0";
    const tl=gs.timeline({delay:.25});
    tl.to(o,{v:n,duration:.9,ease:"power2.out",onUpdate:()=>{num.textContent=String(Math.round(o.v))}})
      .to(circ,{strokeDashoffset:0,duration:.8,ease:"power2.inOut"},"-=.2");
  }
  onceInView($("#payOut"),()=>anim($$(".pb"),{transform:["scaleX(0)","scaleX(1)"]},{duration:.6,delay:stag(.03),ease:EASE}));
}

/* ---------- init ---------- */
renderTickets(); renderHero();
{ const sel=$("#calCatSel"); sel.innerHTML='<option value="all">All fields</option>'+TABS.map(([k,l])=>'<option value="'+k+'">'+l+'</option>').join(""); sel.onchange=()=>{calState.cat=sel.value;renderCal(true)} }
chips($("#calSt"),[["all","Any status"],["c","Confirmed"],["e","Expected"]],"all",k=>{calState.st=k;renderCal(true)});
renderCal(false);
chips($("#exCat"),TABS,exCat,k=>{exCat=k;renderEx()});
renderEx();
renderCore(); renderMatrix();
chips($("#carCat"),Object.keys(CAR).map(k=>[k,CAR[k].t]),carKey,k=>{carKey=k;renderCar(true)});
renderPay(); renderCar(false);
renderQz(); renderGoals(); renderGirls(); renderTiles(); syncPlan();
if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(()=>{ if(window.ScrollTrigger) ScrollTrigger.refresh() }) }
startMotion();
goView((location.hash||"#home").slice(1),{push:false,scroll:false});
