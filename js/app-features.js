/* ---------- v3 extras: theme, search, compare, reminders, section navigation ---------- */
(function(){
  const root=document.documentElement;
  const appEl=$(".app"), collapseBtn=$("#collapseBtn");
  function setCollapsed(on){
    if(!appEl) return;
    appEl.classList.toggle("side-c",on);
    if(collapseBtn){ collapseBtn.setAttribute("aria-label",on?"Expand sidebar":"Collapse sidebar"); collapseBtn.setAttribute("title",on?"Expand sidebar":"Collapse sidebar") }
    $$(".nav-links a").forEach(a=>{ const t=(a.querySelector(".lb")||a).textContent.trim(); if(on) a.setAttribute("title",t); else a.removeAttribute("title") });
    try{ localStorage.setItem("bj-side",on?"1":"0") }catch(e){}
  }
  if(collapseBtn){
    let saved=null; try{ saved=localStorage.getItem("bj-side") }catch(e){}
    setCollapsed(saved==="1");
    collapseBtn.addEventListener("click",()=>setCollapsed(!appEl.classList.contains("side-c")));
  }
  const navMoreSum=$("#navMore>summary");
  if(navMoreSum) navMoreSum.addEventListener("click",e=>{
    if(appEl&&appEl.classList.contains("side-c")){ e.preventDefault(); setCollapsed(false); $("#navMore").open=true }
  });
  const mq=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;
  function isDark(){ const t=root.getAttribute("data-theme"); return t?t==="dark":!!(mq&&mq.matches) }
  function paintTheme(){
    const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.setAttribute("content",isDark()?"#000000":"#FFFFFF");
    const b=$("#themeBtn"); if(b){ b.setAttribute("aria-pressed",isDark()); b.setAttribute("aria-label",isDark()?"Switch to light theme":"Switch to dark theme") }
  }
  $("#themeBtn").addEventListener("click",()=>{
    const next=isDark()?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem("bj-theme",next)}catch(e){}
    paintTheme();
  });
  if(mq&&mq.addEventListener) mq.addEventListener("change",paintTheme);
  paintTheme();

  /* ---------- reminders (.ics) ---------- */
  function pad(n){ return String(n).padStart(2,"0") }
  function ymd(iso){ return iso.replace(/-/g,"") }
  function nextDay(iso){ const d=new Date(iso+"T00:00:00Z"); d.setUTCDate(d.getUTCDate()+1); return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate()) }
  function esc(s){ return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n") }
  function fold(l){ const o=[]; while(l.length>74){ o.push(l.slice(0,74)); l=" "+l.slice(74) } o.push(l); return o.join("\r\n") }
  function stampNow(){ const d=new Date(); return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+"T"+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+"Z" }
  function buildIcs(ids){
    const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Beyond JEE//Exam reminders//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Beyond JEE reminders"];
    let n=0; const ts=stampNow();
    ids.forEach(id=>{
      const x=exById(id), ev=ICS[id]; if(!x||!ev) return;
      ev.forEach((e,i)=>{
        n++;
        const title=(e.x?"Check form window: ":"")+x.n+(e.x?"":" – "+e.t);
        const desc=e.x
          ?"Projected from the 2026 cycle, not announced yet. Check "+x.portal[0]+" for the real dates. "+x.apply
          :e.t+". Official portal: "+x.portal[0]+". Dates as checked on 3 Oct 2026. Confirm on the portal before you rely on them.";
        L.push("BEGIN:VEVENT","UID:"+id+"-"+i+"-"+e.d+"@beyond-jee",
          "DTSTAMP:"+ts,"DTSTART;VALUE=DATE:"+ymd(e.d),"DTEND;VALUE=DATE:"+nextDay(e.d),
          fold("SUMMARY:"+esc(title)),fold("DESCRIPTION:"+esc(desc)),fold("URL:"+x.portal[1]),"TRANSP:TRANSPARENT");
        (e.a||[]).forEach(days=>{
          L.push("BEGIN:VALARM","ACTION:DISPLAY",fold("DESCRIPTION:"+esc(title)),"TRIGGER:"+(days?"-P"+days+"D":"PT9H"),"END:VALARM");
        });
        L.push("END:VEVENT");
      });
    });
    L.push("END:VCALENDAR");
    return {text:L.join("\r\n")+"\r\n",count:n};
  }
  function downloadIcs(ids,name){
    const r=buildIcs(ids); if(!r.count) return false;
    const blob=new Blob([r.text],{type:"text/calendar;charset=utf-8"});
    const url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500); return true;
  }
  $("#icsBtn").addEventListener("click",e=>{
    const b=e.currentTarget;
    if(!plan.length){ b.textContent="Add exams to your list first"; setTimeout(()=>{b.textContent="Calendar file (.ics)"},2200); return }
    const ok=downloadIcs(plan,"beyond-jee-reminders.ics");
    b.textContent=ok?"Downloaded":"No dates for these exams"; setTimeout(()=>{b.textContent="Calendar file (.ics)"},2200);
  });
  document.addEventListener("click",e=>{
    const r=e.target.closest("[data-ics]"); if(!r) return;
    const id=r.dataset.ics; if(downloadIcs([id],"beyond-jee-"+id+".ics")){ const t=r.textContent; r.textContent="Downloaded"; setTimeout(()=>{r.textContent=t},2000) }
  });

  /* ---------- compare ---------- */
  const cmp=["","",""];
  function cmpSelects(){
    $("#cmpSel").innerHTML=cmp.map((v,i)=>'<label class="vh" for="cmp'+i+'">Exam '+(i+1)+'</label><select id="cmp'+i+'" data-i="'+i+'"><option value="">'+(i<2?"Choose exam "+(i+1):"Add a third (optional)")+'</option>'+EX.map(x=>'<option value="'+x.id+'"'+(x.id===v?" selected":"")+'>'+x.n+'</option>').join("")+'</select>').join("");
  }
  function cmpTable(){
    const ids=cmp.filter(Boolean), host=$("#cmpOut");
    if(ids.length<2){ host.innerHTML='<p class="empty">Choose at least two exams to compare them.</p>'; return }
    const xs=ids.map(exById);
    const rows=[["","Field",x=>TABNAME(x.cat)],["","Full name",x=>x.full+" · "+x.body],["ap","Apply by",x=>x.apply],["ex","Exam date",x=>x.exam],["","Fee",x=>x.fee||"See the brochure."],["","Eligibility",x=>x.elig],["","Pattern",x=>x.pattern],["gl","For girls",x=>GD[x.id]||"No girls-specific benefit found."],["","Portal",x=>'<a href="'+x.portal[1]+'" target="_blank" rel="noopener">'+x.portal[0]+' ↗</a>']];
    host.innerHTML='<div class="scroll"><table class="cmp-t"><thead><tr><th></th>'+xs.map(x=>'<th>'+x.n+'</th>').join("")+'</tr></thead><tbody>'+
      rows.map(r=>'<tr class="'+r[0]+'"><td>'+r[1]+'</td>'+xs.map(x=>'<td>'+r[2](x)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
  }
  function TABNAME(c){ const t=TABS.find(t=>t[0]===c); return t?t[1]:c }
  cmpSelects(); cmpTable();
  $("#cmpSel").addEventListener("change",e=>{ const s=e.target.closest("select"); if(!s) return; cmp[+s.dataset.i]=s.value; cmpTable() });
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-cmp]"); if(!b) return;
    const id=b.dataset.cmp; if(!cmp.includes(id)){ const k=cmp.indexOf(""); cmp[k===-1?2:k]=id }
    cmpSelects(); cmpTable(); scrollToEl($("#cmp"));
  });

  /* ---------- search ---------- */
  const strip=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  function buildIndex(){
    const items=[];
    EX.forEach(x=>{
      const hay=[x.n,x.full,x.body,x.leads,x.elig,x.pattern,x.syl,x.apply,x.exam,x.fee,x.note,GD[x.id],GB[x.id]].map(strip).join(" ");
      items.push({type:"Exams",title:x.n,sub:x.full+" · "+x.body,hay,name:x.n.toLowerCase(),pill:GB[x.id],go:()=>openExam(x.id)});
    });
    GGROUPS.forEach(g=>g.cards.forEach(c=>{
      items.push({type:"For girls",title:c.h,sub:c.tag,hay:strip(c.tag+" "+c.h+" "+c.pts.join(" ")+" women girls female quota seats fee"),name:c.h.toLowerCase(),go:()=>{ const el=$("#girls"); scrollToEl(el); }});
    }));
    GFEE.forEach(r=>items.push({type:"For girls",title:r[0]+": girls pay "+r[1],sub:"Others pay "+r[2]+" · saves "+r[3],hay:strip(r.join(" ")+" fee girls women concession"),name:r[0].toLowerCase(),go:()=>scrollToEl($("#girls"))}));
    Object.keys(CAR).forEach(k=>{
      const c=CAR[k];
      items.push({type:"Careers",title:c.t,sub:c.s+" · "+c.jobs.slice(0,3).map(j=>j[0]).join(", "),hay:strip(c.t+" "+c.s+" "+c.f+" "+c.g+" "+c.r+" "+c.jobs.map(j=>j.join(" ")).join(" ")),name:c.t.toLowerCase(),go:()=>{ carKey=k; $$("#carCat .chip").forEach(ch=>ch.setAttribute("aria-pressed",ch.dataset.k===k)); renderCar(true); scrollToEl($("#careers")) }});
    });
    $$(".nav-links a").forEach(a=>{ const t=(a.querySelector(".lb")||a).textContent.trim(); items.push({type:"Sections",title:t,sub:"Jump to this part of the guide",hay:t.toLowerCase(),name:t.toLowerCase(),go:()=>scrollToEl($("#"+a.dataset.s))}) });
    if(window.BJ&&BJ.index) BJ.index().forEach(i=>items.push(i));
    return items;
  }
  let IDX=null, sel=0, shown=[];
  function esc2(s){ return s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])) }
  function markIn(text,toks){
    let out=esc2(text);
    toks.forEach(t=>{ if(t.length<2) return; out=out.replace(new RegExp("("+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>") });
    return out;
  }
  function snippet(it,toks){
    const h=it.hay, low=h.toLowerCase();
    for(const t of toks){ const i=low.indexOf(t); if(i>=0){ const a=Math.max(0,i-34), b=Math.min(h.length,i+t.length+60); return (a?"…":"")+h.slice(a,b)+(b<h.length?"…":"") } }
    return it.sub;
  }
  function runSearch(q){
    if(!IDX) IDX=buildIndex();
    const toks=q.toLowerCase().split(/\s+/).filter(Boolean);
    let res;
    if(!toks.length){
      res=IDX.filter(i=>i.type==="Sections").concat(IDX.filter(i=>i.type==="For girls").slice(0,3));
    }else{
      res=IDX.map(i=>{
        const hay=i.hay.toLowerCase(); if(!toks.every(t=>hay.includes(t))) return null;
        let sc=0; toks.forEach(t=>{ if(i.name.startsWith(t)) sc+=6; else if(i.name.includes(t)) sc+=4; if(i.sub.toLowerCase().includes(t)) sc+=1 });
        return {i,sc};
      }).filter(Boolean).sort((a,b)=>b.sc-a.sc).map(r=>r.i).slice(0,24);
    }
    shown=res; sel=0;
    const host=$("#srchOut");
    if(!res.length){ host.innerHTML='<li class="srch-empty">Nothing found. Try a shorter word such as “fee”, “women”, “NDA” or “CUET”.</li>'; return }
    let html="", last="";
    res.forEach((r,n)=>{
      if(r.type!==last){ html+='<li class="srch-g" role="presentation">'+r.type+'</li>'; last=r.type }
      html+='<li class="srch-it" role="option" id="sr'+n+'" data-n="'+n+'" aria-selected="'+(n===0)+'"><b>'+markIn(r.title,toks)+(r.pill?'<span class="gm">Girls: '+r.pill+'</span>':"")+'</b><span>'+markIn(snippet(r,toks),toks)+'</span></li>';
    });
    host.innerHTML=html;
  }
  function paintSel(){
    $$(".srch-it").forEach(el=>el.setAttribute("aria-selected",+el.dataset.n===sel));
    const el=$("#sr"+sel); if(el) el.scrollIntoView({block:"nearest"});
  }
  let lastFocus=null;
  function openSearch(){
    lastFocus=document.activeElement;
    $("#srch").hidden=false; document.body.style.overflow="hidden";
    const i=$("#srchIn"); i.value=""; runSearch(""); i.focus();
  }
  function closeSearch(){ $("#srch").hidden=true; document.body.style.overflow=""; if(lastFocus&&lastFocus.focus) lastFocus.focus() }
  function choose(n){ const it=shown[n]; if(!it) return; closeSearch(); setTimeout(()=>it.go(),30) }
  $("#srchBtn").addEventListener("click",openSearch);
  $("#srchIn").addEventListener("input",e=>runSearch(e.target.value));
  $("#srch").addEventListener("click",e=>{
    if(e.target.id==="srch"){ closeSearch(); return }
    const it=e.target.closest(".srch-it"); if(it) choose(+it.dataset.n);
  });
  document.addEventListener("keydown",e=>{
    const open=!$("#srch").hidden;
    const typing=/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||"");
    if(!open&&((e.key==="/"&&!typing&&!e.metaKey&&!e.ctrlKey)||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"))){ e.preventDefault(); openSearch(); return }
    if(!open) return;
    if(e.key==="Escape"){ e.preventDefault(); closeSearch() }
    else if(e.key==="ArrowDown"){ e.preventDefault(); sel=Math.min(shown.length-1,sel+1); paintSel() }
    else if(e.key==="ArrowUp"){ e.preventDefault(); sel=Math.max(0,sel-1); paintSel() }
    else if(e.key==="Enter"){ e.preventDefault(); choose(sel) }
  });

  /* ---------- floaters ---------- */
  const tt=$("#totop");
  function onScroll(){ tt.classList.toggle("on",window.scrollY>700) }
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
  tt.addEventListener("click",()=>window.scrollTo({top:0,behavior:reduce?"auto":"smooth"}));
})();
