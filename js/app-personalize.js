/* ---------- personalised home, sharing and print ---------- */
(function(){
  const KEY="bj-prof";
  let prof=null, draft={g:null,i:[]}, editing=false;
  try{ const raw=localStorage.getItem(KEY); if(raw){ const p=JSON.parse(raw); if(p&&typeof p==="object"){ prof={g:["f","m","x"].includes(p.g)?p.g:"x",i:Array.isArray(p.i)?p.i.filter(k=>CATNAME[k]):[],skip:!!p.skip} } } }catch(e){}
  function saveProf(){ try{ localStorage.setItem(KEY,JSON.stringify(prof)) }catch(e){} }
  const GL={f:"Girl",m:"Boy",x:"Skip"};
  function cats(){ return prof&&prof.i.length?prof.i:TABS.map(t=>t[0]) }
  function nowIdx(){ const i=MONS.findIndex(m=>m[0]===nowMon()); return i<0?0:i }
  function chip(k,l,on){ return '<button type="button" class="chip" data-k="'+k+'" aria-pressed="'+on+'">'+l+'</button>' }

  function setupHtml(){
    return '<div class="fy-h"><h2>Make this home yours</h2><p>Two quick picks. They stay in this browser.</p></div>'+
    '<div class="fy-q"><b>I am a</b><div class="chips" data-q="g">'+[["f","Girl"],["m","Boy"],["x","Prefer not to say"]].map(([k,l])=>chip(k,l,draft.g===k)).join("")+'</div></div>'+
    '<div class="fy-q"><b>I am drawn to <span class="fy-opt">pick any, or none</span></b><div class="chips" data-q="i">'+TABS.map(([k,l])=>chip(k,l,draft.i.includes(k))).join("")+'</div></div>'+
    '<div class="fy-go"><button class="mb pri" type="button" data-fy="save"'+(draft.g?"":" disabled")+'>Show my home</button>'+(prof?'<button class="mb" type="button" data-fy="cancel">Cancel</button>':'<button class="mb" type="button" data-fy="skip">Not now</button>')+'</div>';
  }
  function who(){
    const a=[]; if(prof.g==="f") a.push("Girl"); else if(prof.g==="m") a.push("Boy");
    a.push(prof.i.length?prof.i.map(k=>CATNAME[k]).join(", "):"All fields"); return a.join(" · ");
  }
  function viewHtml(){
    const cs=cats(), ni=nowIdx();
    const rows=CAL.map((r,i)=>Object.assign({i},r)).filter(r=>cs.includes(r.cat)&&MONS.findIndex(m=>m[0]===closeMonth(r))>=ni).slice(0,4);
    const left='<div><h3>Closing next in your areas</h3>'+(rows.length?rows.map(r=>'<button type="button" class="fy-r" data-fyi="'+r.i+'"><span class="d'+(r.st==="c"?" hl":"")+'">'+r.as+'</span><span class="n">'+r.sn+(r.ex&&GB[r.ex]?'<i class="gdot" title="Benefit for girl candidates"></i>':"")+'</span><span class="e">'+(/^See/.test(r.es)?r.es:"exam "+r.es)+'</span></button>').join(""):'<p class="empty">Nothing closing in these fields right now. Edit your picks to add more.</p>')+'</div>';
    let right;
    if(prof.g==="f"){
      const gb=EX.filter(x=>cs.includes(x.cat)&&GB[x.id]).slice(0,4);
      right='<div class="fy-gc"><h3>Benefits for girls in your areas</h3>'+gb.map(x=>'<a class="fy-gr" href="#exams" data-open="'+x.id+'"><span>'+x.n+'</span><span class="gm">'+GB[x.id]+'</span></a>').join("")+
        (cs.includes("eng")?'<a class="fy-gr" href="#girls" data-go="girls"><span>JoSAA: IITs, NITs, IIITs</span><span class="gm">Female-only seats</span></a>':"")+
        (gb.length||cs.includes("eng")?"":'<p class="empty">No girls-specific benefit found in these fields. See every benefit under For girls.</p>')+
        '<a class="fy-more" href="#girls" data-go="girls">All benefits for girls</a></div>';
    }else{
      const xs=EX.filter(x=>cs.includes(x.cat)).slice(0,10);
      right='<div><h3>Exams in your areas</h3><div class="chips fy-ex">'+xs.map(x=>'<a class="chip" href="#exams" data-open="'+x.id+'">'+x.n+'</a>').join("")+'</div><a class="fy-more" href="#exams" data-go="exams">Open all exams</a></div>';
    }
    return '<div class="fy-h"><h2>For you</h2><p>'+who()+' <button type="button" class="fy-edit" data-fy="edit">Edit</button></p></div><div class="fy-cols">'+left+right+'</div>';
  }
  function renderFor(){
    const host=$("#forYou"); if(!host) return;
    host.classList.toggle("fy-pink",!!prof&&prof.g==="f"&&!editing);
    if(prof&&prof.skip&&!editing){ host.hidden=false; host.className="fy fy-slim"; host.innerHTML='<p>Show deadlines and benefits that fit you.</p><button class="mb" type="button" data-fy="edit">Personalise this page</button>'; return }
    host.className="fy"+(prof&&prof.g==="f"&&!editing?" fy-pink":"");
    host.innerHTML=(!prof||editing)?setupHtml():viewHtml();
  }
  document.addEventListener("click",e=>{
    const t=e.target;
    const row=t.closest("[data-fyi]"); if(row){ openCalRow(+row.dataset.fyi); return }
    const f=t.closest("[data-fy]");
    if(f){
      const a=f.dataset.fy;
      if(a==="edit"){ editing=true; draft={g:prof&&prof.g!=="x"||prof&&!prof.skip?prof.g:null,i:prof?prof.i.slice():[]}; renderFor() }
      else if(a==="cancel"){ editing=false; renderFor() }
      else if(a==="skip"){ prof={g:"x",i:[],skip:true}; saveProf(); renderFor() }
      else if(a==="save"&&draft.g){ prof={g:draft.g,i:draft.i.slice()}; editing=false; saveProf(); renderFor() }
      return;
    }
    const c=t.closest("#forYou .chips[data-q] .chip"); if(c){
      const q=c.parentNode.dataset.q, k=c.dataset.k;
      if(q==="g") draft.g=k; else draft.i=draft.i.includes(k)?draft.i.filter(x=>x!==k):draft.i.concat(k);
      $$(".chip",c.parentNode).forEach(b=>b.setAttribute("aria-pressed",q==="g"?b.dataset.k===draft.g:draft.i.includes(b.dataset.k)));
      const s=$('[data-fy="save"]'); if(s) s.disabled=!draft.g;
    }
  });
  renderFor();

  /* ---------- share and print my list ---------- */
  const CHECKED="3 Oct 2026";
  function items(){
    return plan.map(exById).filter(Boolean).map(x=>{ const rs=CAL.filter(r=>r.ex===x.id); return {x,rs,k:rs.length?CAL.indexOf(rs[0]):999} }).sort((a,b)=>a.k-b.k);
  }
  function stNote(st){ return st==="c"?"confirmed":st==="m"?"exam date set, form expected":"expected, not announced" }
  function host(x){ return x.portal[0] }
  function listText(){
    const it=items(), L=["My exam list · Beyond JEE (dates checked "+CHECKED+")",""];
    it.forEach((o,n)=>{
      L.push((n+1)+". "+o.x.n);
      if(o.rs.length) o.rs.forEach(r=>L.push("   "+(o.rs.length>1?r.sn+": ":"")+"forms close "+r.as+", exam "+(/^See/.test(r.es)?"dates on the KL site":r.es)+" ("+stNote(r.st)+")"));
      else L.push("   Forms: "+o.x.apply);
      if(prof&&prof.g==="f"&&GB[o.x.id]) L.push("   Girls: "+GB[o.x.id]);
      L.push("   Apply only on: "+host(o.x));
    });
    L.push("","~ means projected from last year. Confirm every date on the official portal before you apply.");
    if(/^https?:/.test(location.protocol)) L.push(location.origin+location.pathname);
    return L.join("\n");
  }
  function flash(b,msg){ const t=b.dataset.t||b.textContent; b.dataset.t=t; b.textContent=msg; clearTimeout(b._to); b._to=setTimeout(()=>{ b.textContent=t },2200) }
  function copyText(s){
    if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(s);
    return new Promise((ok,no)=>{ const ta=document.createElement("textarea"); ta.value=s; ta.style.cssText="position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy")?ok():no() }catch(e){ no(e) } ta.remove() });
  }
  function buildPrint(){
    const it=items(), d=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Kolkata"});
    let ps=$("#printSheet"); if(!ps){ ps=document.createElement("div"); ps.id="printSheet"; ps.className="psheet"; document.body.appendChild(ps) }
    ps.innerHTML='<h1>My exam list</h1><p class="ps-s">Beyond JEE · printed '+d+' · dates checked '+CHECKED+'</p>'+
     '<table><thead><tr><th>Exam</th><th>Forms close</th><th>Exam date</th><th>Apply only on</th><th>Applied</th></tr></thead><tbody>'+
     it.map(o=>{
       const rs=o.rs.length?o.rs:[{sn:"",as:o.x.apply,es:o.x.exam,st:o.x.st}];
       return '<tr><td><b>'+o.x.n+'</b><br><small>'+o.x.full+'</small>'+(prof&&prof.g==="f"&&GB[o.x.id]?'<br><small>Girls: '+GB[o.x.id]+'</small>':"")+'</td>'+
        '<td>'+rs.map(r=>(rs.length>1?r.sn+": ":"")+r.as+'<br><small>'+stNote(r.st)+'</small>').join('<br>')+'</td>'+
        '<td>'+rs.map(r=>(rs.length>1?r.sn+": ":"")+r.es).join('<br>')+'</td>'+
        '<td>'+o.x.portal[1].replace(/^https?:\/\//,"")+'</td><td class="bx">☐</td></tr>';
     }).join("")+'</tbody></table>'+
     '<p class="ps-f">~ means projected from last year and can move by weeks. Confirm every date and fee in the official brochure before you apply. Apply only on the official portal.</p>';
  }
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-share]"); if(!b) return;
    const a=b.dataset.share;
    if(!plan.length){ flash(b,"Add exams first"); return }
    const txt=listText();
    if(a==="wa") window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank","noopener");
    else if(a==="mail") location.href="mailto:?subject="+encodeURIComponent("My exam list · Beyond JEE")+"&body="+encodeURIComponent(txt);
    else if(a==="copy") copyText(txt).then(()=>flash(b,"Copied"),()=>flash(b,"Copy failed"));
    else if(a==="native"){ navigator.share({title:"My exam list · Beyond JEE",text:txt}).catch(()=>{}) }
    else if(a==="print"){ buildPrint(); setTimeout(()=>window.print(),60) }
  });
  if(navigator.share){ const n=$('[data-share="native"]'); if(n) n.hidden=false }
})();
