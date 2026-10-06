/* ---------- live dates: merges a reviewed, machine-checked date registry into
   TICKETS/CAL at runtime, so the countdown and calendar reflect dates the
   watcher found on the official sites and a human approved via PR review.
   Falls back silently to the hand-curated static dates when the registry
   is unavailable or has nothing new. ---------- */
(function(){
  const SEED_REVIEWED="2026-10-03T00:00:00+05:30"; // matches the baked-in seed, so a fresh registry never regresses the shown "checked on" date
  function fmtShort(iso){ try{ return new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"}) }catch(e){ return null } }
  function fmtLong(iso){ try{ return new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Kolkata"}) }catch(e){ return null } }

  function applyLiveDates(reg){
    if(!reg||!reg.exams||typeof TICKETS==="undefined"||typeof CAL==="undefined") return false;
    let changed=false;
    Object.entries(reg.exams).forEach(([id,rec])=>{
      if(!rec||!rec.applyClose) return;
      const newClose=fmtLong(rec.applyClose), newAs=fmtShort(rec.applyClose);
      if(!newClose||!newAs) return;
      TICKETS.filter(t=>t.eid===id).forEach(t=>{
        if(t.due!==rec.applyClose){ t.due=rec.applyClose; t._live=true; changed=true }
        if(t.close!==newClose){ t.close=newClose; t._live=true; changed=true }
        if(rec.status==="confirmed"&&t.kind==="w"){ t.kind="c"; changed=true }
      });
      CAL.filter(c=>c.ex===id).forEach(c=>{
        if(c.as!==newAs){ c.as=newAs; c._live=true; changed=true }
        if(rec.status==="confirmed"&&c.st==="e"){ c.st="m"; changed=true }
      });
    });
    return changed;
  }

  function paintChecked(reg){
    const el=$("#homeCheckedDate"), tag=$("#homeLiveTag");
    if(!el||!reg||!reg.lastReviewed) return;
    const d=new Date(reg.lastReviewed), seed=new Date(SEED_REVIEWED);
    if(isNaN(d.getTime())||d.getTime()<=seed.getTime()) return;
    el.textContent=fmtLong(reg.lastReviewed);
    if(tag) tag.hidden=false;
  }

  function loadLiveDates(){
    fetch("/data/key-dates.json",{cache:"no-store"}).then(r=>{ if(!r.ok) throw 0; return r.json() }).then(reg=>{
      const changed=applyLiveDates(reg);
      paintChecked(reg);
      if(changed){
        if(typeof renderTickets==="function") renderTickets();
        if(typeof renderHero==="function") renderHero();
        if(typeof renderCal==="function") renderCal(false);
      }
    }).catch(()=>{});
  }
  loadLiveDates();
  setInterval(loadLiveDates,10*60*1000);
})();
