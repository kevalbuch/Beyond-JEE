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
    [$("#notifN"),$("#notifNm")].forEach(b=>{
      if(!b) return;
      if(n>0){ b.hidden=false; b.textContent=n>9?"9+":String(n) } else { b.hidden=true }
    });
  }
  function markSeen(){
    if(!DATA||!DATA.items||!DATA.items.length) return;
    try{ localStorage.setItem(SEEN_KEY,DATA.items[0].time) }catch(e){}
    paintBadge();
  }
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
      return '<article class="nf-row'+(isNew?" nf-new":"")+'"><div class="nf-top"><span class="nf-tag">'+esc((typeof CATNAME!=="undefined"&&CATNAME[it.cat])||it.source)+'</span><span class="nf-src">'+esc(it.source)+'</span><span class="nf-time">'+relTime(it.time)+'</span></div>'+
        '<p class="nf-t">'+esc(it.title)+'</p>'+
        '<a class="nf-link" href="'+esc(it.url)+'" target="_blank" rel="noopener">Open source ↗</a></article>';
    }).join("");
  }
  function loadNotif(){
    fetch("/data/notifications.json",{cache:"no-store"}).then(r=>{ if(!r.ok) throw 0; return r.json() }).then(d=>{
      DATA=d; paintBadge(); renderNotif();
    }).catch(()=>{ if(!DATA){ renderNotif() } });
  }
  loadNotif();
  setInterval(loadNotif,10*60*1000);
  const sec=$("#notif");
  if(sec&&"MutationObserver" in window){
    new MutationObserver(()=>{ if(!sec.hidden) markSeen() }).observe(sec,{attributes:true,attributeFilter:["hidden"]});
  }
})();
