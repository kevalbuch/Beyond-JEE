/* ---------- notifications: official-page watch, refreshed by a scheduled GitHub Action ---------- */
(function(){
  const SEEN_KEY="bj-notif-seen";
  let DATA=null;
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function relTime(iso){
    if(!iso) return "never";
    const ms=Date.now()-new Date(iso).getTime();
    if(ms<0) return "just now";
    const m=Math.round(ms/60000);
    if(m<1) return "just now";
    if(m<60) return m+" min ago";
    const h=Math.round(m/60);
    if(h<24) return h+" hr"+(h===1?"":"s")+" ago";
    const d=Math.round(h/24);
    if(d<30) return d+" day"+(d===1?"":"s")+" ago";
    return new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"});
  }
  function seenTime(){ try{ return localStorage.getItem(SEEN_KEY)||"" }catch(e){ return "" } }
  function unseenCount(){
    if(!DATA||!DATA.items||!DATA.items.length) return 0;
    const seen=seenTime();
    if(!seen) return Math.min(DATA.items.length,9);
    return DATA.items.filter(it=>it.time>seen).length;
  }
  function paintBadge(){
    const n=unseenCount();
    $$(".notif-badge").forEach(b=>{
      if(n>0){ b.hidden=false; b.textContent=n>9?"9+":String(n) } else { b.hidden=true }
    });
  }
  function markSeen(){
    if(!DATA||!DATA.items||!DATA.items.length) return;
    try{ localStorage.setItem(SEEN_KEY,DATA.items[0].time) }catch(e){}
    paintBadge();
  }
  function tagFor(it){ return esc((typeof CATNAME!=="undefined"&&CATNAME[it.cat])||it.source) }

  /* ---------- full Notifications page ---------- */
  function renderNotif(){
    const meta=$("#notifMeta"), out=$("#notifOut");
    if(!meta||!out) return;
    if(!DATA){ meta.innerHTML=""; out.innerHTML='<p class="empty">Could not load the notification feed right now. Try again shortly.</p>'; return }
    const stats=DATA.stats||{}, checked=DATA.lastChecked;
    meta.innerHTML='<span class="nf-checked">'+(checked?"Checked "+relTime(checked):"Not checked yet — the first automatic check runs within a few hours")+'</span>'+
      (checked?'<span class="nf-ok">'+(stats.ok||0)+' of '+(stats.total||0)+' official pages reachable</span>':"")+
      ((DATA.failedSources&&DATA.failedSources.length)?'<span class="nf-fail">Could not reach: '+DATA.failedSources.map(esc).join(", ")+' just now — will retry next check</span>':"");
    const items=DATA.items||[];
    if(!items.length){
      out.innerHTML='<p class="empty">'+(checked?"No changes seen since the last check. All quiet.":"Nothing checked yet. This page updates itself automatically every 6 hours once the watch starts running.")+'</p>';
      return;
    }
    const seen=seenTime();
    out.innerHTML=items.map(it=>{
      const isNew=seen&&it.time>seen;
      return '<article class="nf-row'+(isNew?" nf-new":"")+'"><div class="nf-top"><span class="nf-tag">'+tagFor(it)+'</span><span class="nf-src">'+esc(it.source)+'</span><span class="nf-time">'+relTime(it.time)+'</span></div>'+
        '<p class="nf-t">'+esc(it.title)+'</p>'+
        '<a class="nf-link" href="'+esc(it.url)+'" target="_blank" rel="noopener">Open source ↗</a></article>';
    }).join("");
  }

  /* ---------- bell popover ---------- */
  function renderPopover(){
    const meta=$("#notifPopMeta"), out=$("#notifPopOut");
    if(!meta||!out) return;
    if(!DATA){ meta.textContent=""; out.innerHTML='<p class="np-empty">Could not load notifications right now.</p>'; return }
    const checked=DATA.lastChecked, items=(DATA.items||[]).slice(0,6);
    meta.textContent=checked?("Checked "+relTime(checked)):"Not checked yet";
    out.innerHTML=items.length?items.map(it=>
      '<a class="np-row" href="'+esc(it.url)+'" target="_blank" rel="noopener"><div class="np-top2"><span class="np-tag">'+tagFor(it)+'</span><span class="np-time">'+relTime(it.time)+'</span></div><p class="np-t">'+esc(it.title)+'</p></a>'
    ).join(""):'<p class="np-empty">'+(checked?"No changes seen since the last check.":"Nothing checked yet. Checks every 6 hours.")+'</p>';
  }
  function openPop(){
    const pop=$("#notifPop"); if(!pop) return;
    renderPopover();
    pop.hidden=false;
    $$(".notif-bell").forEach(b=>b.setAttribute("aria-expanded","true"));
    markSeen();
    setTimeout(()=>document.addEventListener("click",outsideClose),0);
    document.addEventListener("keydown",escClose);
  }
  function closePop(){
    const pop=$("#notifPop"); if(!pop||pop.hidden) return;
    pop.hidden=true;
    $$(".notif-bell").forEach(b=>b.setAttribute("aria-expanded","false"));
    document.removeEventListener("click",outsideClose);
    document.removeEventListener("keydown",escClose);
  }
  function outsideClose(e){
    const pop=$("#notifPop");
    if(pop&&!pop.contains(e.target)&&!e.target.closest(".notif-bell")) closePop();
  }
  function escClose(e){ if(e.key==="Escape") closePop() }
  document.addEventListener("click",e=>{
    const bell=e.target.closest(".notif-bell");
    if(bell){ const pop=$("#notifPop"); if(pop&&pop.hidden) openPop(); else closePop(); return }
    if(e.target.closest("[data-np-all]")){ closePop() }
  });

  function loadNotif(){
    fetch("/data/notifications.json",{cache:"no-store"}).then(r=>{ if(!r.ok) throw 0; return r.json() }).then(d=>{
      DATA=d; paintBadge(); renderNotif();
      const pop=$("#notifPop"); if(pop&&!pop.hidden) renderPopover();
    }).catch(()=>{ if(!DATA){ renderNotif() } });
  }
  loadNotif();
  setInterval(loadNotif,10*60*1000);
  const sec=$("#notif");
  if(sec&&"MutationObserver" in window){
    new MutationObserver(()=>{ if(!sec.hidden) markSeen() }).observe(sec,{attributes:true,attributeFilter:["hidden"]});
  }
})();
