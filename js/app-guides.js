/* ---------- cutoffs, counselling, FAQs ---------- */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const num=n=>n==null?"–":Number(n).toLocaleString("en-IN");
  const srcLinks=a=>a.map(x=>'<li><a href="'+esc(x[1])+'" target="_blank" rel="noopener">'+esc(x[0])+' ↗</a></li>').join("");
  const srcBox=(a,label)=>'<details class="more src-d"><summary>'+(label||"Sources")+'</summary><ul class="src-l">'+srcLinks(a)+'</ul></details>';
  const link=u=>'<a class="src-a" href="'+esc(u)+'" target="_blank" rel="noopener">Source ↗</a>';
  const tbl=(head,rows,cls)=>'<div class="scroll'+(cls?" "+cls:"")+'"><table class="ct"><thead><tr>'+head.map(h=>'<th'+(h[1]?' class="'+h[1]+'"':"")+'>'+h[0]+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';

  /* ===== cutoffs ===== */
  const cut={tab:"josaa",jt:"IIT",jb:"all",st:"mht",bc:"Pilani"};
  const CTABS=[["josaa","JoSAA: IIT, NIT, IIIT"],["bits","BITSAT"],["law","Law: CLAT, AILET"],["des","Design: UCEED"],["state","State CETs"]];
  function how(t){ return '<div class="callout note ct-how"><h4>Where this comes from</h4><p>'+t+'</p></div>' }
  function pJosaa(){
    const J=CUT.josaa, branches=["all"].concat(Array.from(new Set(J.rows.filter(r=>r[1]===cut.jt).map(r=>r[2]))));
    if(!branches.includes(cut.jb)) cut.jb="all";
    const rows=J.rows.filter(r=>r[1]===cut.jt&&(cut.jb==="all"||r[2]===cut.jb)).sort((a,b)=>a[4]-b[4]);
    const q=cut.jt==="IIT"?"JEE Advanced rank, All India quota":cut.jt==="NIT"?"JEE Main rank (CRL), Other State quota":"JEE Main rank (CRL), All India quota";
    return '<div class="ct-bar"><div class="chips" id="jType" role="group" aria-label="Institute type">'+["IIT","NIT","IIIT"].map(t=>'<button type="button" class="chip" data-k="'+t+'" aria-pressed="'+(t===cut.jt)+'">'+t+'s</button>').join("")+'</div>'+
      '<label class="sel-w"><span class="vh">Branch</span><select class="sel" id="jBr" aria-label="Branch">'+branches.map(b=>'<option value="'+b+'"'+(b===cut.jb?" selected":"")+'>'+(b==="all"?"All branches":b)+'</option>').join("")+'</select></label></div>'+
      '<p class="ct-meta">JoSAA '+J.year+', final round, Open category. '+q+'. Shown as opening – closing rank.</p>'+
      tbl([["Institute"],["Branch","c-br"],["Open pool","r"],["Girls-only pool","r gp"]],rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b><small class="br-m">'+esc(r[2])+'</small></td><td class="c-br">'+esc(r[2])+'</td><td class="r">'+num(r[3])+' – <b>'+num(r[4])+'</b></td><td class="r gp">'+num(r[5])+' – <b>'+num(r[6])+'</b></td></tr>'))+
      '<div class="callout girl ct-g"><h4>For girl candidates</h4><p>Girls are considered for the girls-only pool of extra seats and for the open pool. The girls-only closing rank is a larger number because those seats are separate, so the same rank can reach a better branch there.</p></div>'+
      how('JoSAA '+J.year+' final round, copied from an aggregator site (exammint) and cross-checked for CSE against two other sites. JoSAA 2026 numbers disagree across sites, so they are not used. ECE, Mechanical and girls-only figures rest on the aggregator alone. Always confirm on <a href="https://josaa.nic.in" target="_blank" rel="noopener">josaa.nic.in</a> under Opening and Closing Ranks.')+srcBox(J.sources);
  }
  function pBits(){
    const B=CUT.bits, campus=["Pilani","Goa","Hyderabad"];
    const rows=B.rows.filter(r=>r[0]===cut.bc).sort((a,b)=>b[2]-a[2]);
    return '<div class="ct-bar"><div class="chips" id="bCamp" role="group" aria-label="Campus">'+campus.map(c=>'<button type="button" class="chip" data-k="'+c+'" aria-pressed="'+(c===cut.bc)+'">'+c+'</button>').join("")+'</div></div>'+
      '<p class="ct-meta">BITSAT '+B.year+', final cutoff in marks out of 390. A higher score is harder to reach.</p>'+
      tbl([["Programme"],["Score","r"],["",""]],rows.map(r=>'<tr><td><b>'+esc(r[1])+'</b></td><td class="r"><b>'+r[2]+'</b> / 390</td><td class="bw"><i style="width:'+Math.round(r[2]/390*100)+'%"></i></td></tr>'))+
      '<div class="callout girl ct-g"><h4>For girl candidates</h4><p>BITS publishes one cutoff for everyone, not a separate one for girls. Girls get ₹500 off the BITSAT fee.</p></div>'+
      how('The official BITS cutoff page (read through a text summariser). The iteration label comes from one coaching site, Cracku. When many students tie at the cutoff, BITS breaks the tie using PCM marks. The Dubai campus is not listed.')+srcBox(B.sources);
  }
  function pLaw(){
    const C=CUT.clat, A=CUT.ailet;
    return '<p class="ct-meta">CLAT '+C.year+', final (5th) allotment list, General category, closing rank.</p>'+
      tbl([["National Law University"],["Closing rank","r"]],C.rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td class="r"><b>'+num(r[1])+'</b></td></tr>'))+
      '<h3 class="sub ct-sub">NLU Delhi through AILET '+A.year+'</h3>'+
      tbl([["Category"],["Closing rank, round 3","r"]],A.rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td class="r"><b>'+num(r[1])+'</b></td></tr>'))+
      '<div class="callout girl ct-g"><h4>For girl candidates</h4><p>Several NLUs keep horizontal seats for women. No reliable women-only closing ranks were found for CLAT or AILET, so none are shown. Check each NLU’s seat matrix on consortiumofnlus.ac.in.</p></div>'+
      how('Careers360, Toprankers and Collegedekho, which copy the official allotment lists. The official consortium page could not be opened. Sites differ slightly (NLSIU 108 to 120, NALSAR 164 to 168). Some NLUs had no General seats left by round 5, so their last closing rank is from an earlier round.')+srcBox(CUT.lawsrc);
  }
  const U25={"Bombay":14,"Delhi":41,"Guwahati":96,"Hyderabad":61,"IIITDM":267};
  function pDes(){
    const D=CUT.uceed;
    const prev=n=>{ const k=Object.keys(U25).find(k=>n.includes(k)); return k?U25[k]:null };
    return '<p class="ct-meta">UCEED '+D.year+', round 5 (final), Open category, closing rank. 2025 shown to see the direction.</p>'+
      tbl([["Institute"],["Programme"],["2026","r"],["2025","r"]],D.rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td class="r"><b>'+num(r[2])+'</b></td><td class="r">'+num(prev(r[0]))+'</td></tr>'))+
      '<div class="callout girl ct-g"><h4>For girl candidates</h4><p>UCEED has a half-fee concession for girls. Separate female-only closing ranks were not found in any source read, so none are shown.</p></div>'+
      how('Toprankers for the 2026 round 5 ranks, checked against round 1 figures on Careers360. The 2025 ranks come from Careers360 and Collegedunia. These are coaching and news sites, so confirm on uceed.iitb.ac.in.')+srcBox(CUT.lawsrc,"Sources for law and design");
  }
  function pState(){
    const S={mht:["MHT CET","Percentile, higher is harder"],kcet:["KCET","Rank, lower is harder"],ap:["AP EAPCET","Rank, lower is harder"],tg:["TG EAPCET","Rank, lower is harder"]};
    const d=CUT[cut.st];
    let head,rows,note;
    if(cut.st==="mht"){ head=[["College"],["Branch","c-br"],["Open","r"],["Ladies","r gp"],["Round","r c-br"]]; rows=d.rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b><small class="br-m">'+esc(r[1])+' · '+esc(r[4].replace("CAP Round ","round "))+'</small></td><td class="c-br">'+esc(r[1])+'</td><td class="r"><b>'+(r[2]==null?"–":r[2])+'</b></td><td class="r gp"><b>'+(r[3]==null?"–":r[3])+'</b></td><td class="r c-br">'+esc(r[4].replace("CAP Round ","R"))+'</td></tr>'); note="State-level open seats (GOPEN and LOPEN), cutoff as a percentile." }
    else if(cut.st==="kcet"){ head=[["College"],["Branch","c-br"],["General Merit rank","r"]]; rows=d.rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b><small class="br-m">'+esc(r[1])+'</small></td><td class="c-br">'+esc(r[1])+'</td><td class="r"><b>'+num(r[2])+'</b></td></tr>'); note="Girls-specific ranks were not found, so only the General Merit rank is shown." }
    else{ head=[["College"],["Branch","c-br"],["Boys","r"],["Girls","r gp"]]; rows=d.rows.map(r=>'<tr><td><b>'+esc(r[0])+'</b><small class="br-m">'+esc(r[1])+'</small></td><td class="c-br">'+esc(r[1])+'</td><td class="r"><b>'+num(r[2])+'</b></td><td class="r gp"><b>'+num(r[3])+'</b></td></tr>'); note=cut.st==="ap"?"AP ranks are for the college’s own region column (AU or SVU region), so they are not the same pool across colleges.":"Last ranks from the final phase." }
    return '<div class="ct-bar"><div class="chips" id="sTab" role="group" aria-label="State exam">'+Object.keys(S).map(k=>'<button type="button" class="chip" data-k="'+k+'" aria-pressed="'+(k===cut.st)+'">'+S[k][0]+'</button>').join("")+'</div></div>'+
      '<p class="ct-meta">'+S[cut.st][0]+' '+d.year+', '+esc(d.round)+'. '+S[cut.st][1]+'. '+note+'</p>'+tbl(head,rows)+
      (cut.st==="mht"?'<div class="callout girl ct-g"><h4>For girl candidates</h4><p>Maharashtra, Karnataka and Andhra Pradesh reserve about 30 to 33% of seats for women. In MHT CET the Ladies column is the cutoff for those seats.</p></div>':"")+
      how('Mostly aggregator sites (Careers360, Collegedekho, Findmycollege, EduVale). Only the GCOE Chhatrapati Sambhajinagar row (official MHT PDF) and CBIT Hyderabad CSE (official TG PDF) were checked against official files. Where sites disagreed, the row was left out. Spot-check on the official site before you decide.')+
      '<details class="more src-d"><summary>Known gaps</summary><ul class="src-l plain">'+CUT.statecav.map(c=>'<li>'+esc(c)+'</li>').join("")+'</ul></details>'+srcBox(CUT.statesrc);
  }
  function renderCut(){
    const f={josaa:pJosaa,bits:pBits,law:pLaw,des:pDes,state:pState}[cut.tab];
    $("#cutOut").innerHTML=f();
  }
  chips($("#cutTab"),CTABS,cut.tab,k=>{ cut.tab=k; renderCut() });
  $("#cutOut").addEventListener("click",e=>{
    const c=e.target.closest(".chips .chip"); if(!c) return;
    const id=c.parentNode.id, k=c.dataset.k;
    if(id==="jType"){ cut.jt=k; cut.jb="all" } else if(id==="bCamp") cut.bc=k; else if(id==="sTab") cut.st=k; else return;
    renderCut();
  });
  $("#cutOut").addEventListener("change",e=>{ if(e.target.id==="jBr"){ cut.jb=e.target.value; renderCut() } });
  renderCut();

  /* ===== counselling ===== */
  const COUNT=[["josaa","JoSAA steps"],["time","Last year’s timeline"],["rules","Rules that matter"],["state","State counselling"],["other","BITS, law, design"]];
  let counTab="josaa";
  function acc(list,open){ return '<div class="acc">'+list.map((x,i)=>'<details class="ac"'+(open&&i===0?" open":"")+'><summary>'+esc(x[0])+'</summary><p>'+esc(x[1])+'</p>'+link(x[2])+'</details>').join("")+'</div>' }
  function renderCoun(){
    const C=COUN, host=$("#counOut");
    const flag='<div class="callout act ct-how"><h4>These are 2026 dates and fees</h4><p>Everything below is from the 2026 cycle as of '+shortDate(C.asof)+'. The 2027 dates are not out. Rules, fees and the number of rounds change, and state dates were taken from news reports.</p></div>';
    let h;
    if(counTab==="josaa") h=acc(C.steps,true);
    else if(counTab==="time"){
      h='<ol class="tl">'+C.timeline.map((t,i)=>'<li'+(i===C.timeline.length-1?' class="nx"':"")+'><b>'+esc(t[0])+'</b><span>'+esc(t[1].replace(/^Last cycle \(2026\):\s*/,""))+'</span>'+link(t[2])+'</li>').join("")+'</ol>';
    }
    else if(counTab==="rules") h=acc(C.rules,true);
    else if(counTab==="state") h=acc(C.state,true);
    else h=acc(C.others,true);
    host.innerHTML=(counTab==="rules"?"":flag)+h+(counTab==="josaa"?'<div class="callout girl ct-g"><h4>For girl candidates</h4><p>At IITs, NITs, IISc, IIEST and some IIITs, girls get extra seats so women reach at least 20% of each batch. You are matched in the girls-only pool first, then the open pool, and boys’ seats are not reduced.</p></div>':"")+
      (counTab==="josaa"?'<details class="more src-d"><summary>All sources</summary><ul class="src-l">'+srcLinks(C.sources)+'</ul></details>':"");
  }
  chips($("#counTab"),COUNT,counTab,k=>{ counTab=k; renderCoun() });
  renderCoun();

  /* ===== FAQs ===== */
  const MYTH=[0,6,7,10];
  let faqTab="all";
  function renderFaq(){
    const list=FAQS.map((f,i)=>({f,i})).filter(o=>faqTab==="all"||MYTH.includes(o.i));
    $("#faqOut").innerHTML='<div class="acc">'+list.map(o=>'<details class="ac" id="faq'+o.i+'"><summary>'+esc(o.f[0])+(MYTH.includes(o.i)?'<span class="myth">Common myth</span>':"")+'</summary><p>'+esc(o.f[1])+'</p>'+link(o.f[2])+'</details>').join("")+'</div>';
  }
  chips($("#faqTab"),[["all","All "+FAQS.length+" questions"],["myth","Common myths"]],faqTab,k=>{ faqTab=k; renderFaq() });
  renderFaq();

  /* ---------- hooks for search ---------- */
  window.BJ={
    index:function(){
      const out=[];
      FAQS.forEach((f,i)=>out.push({type:"FAQs",title:f[0],sub:f[1],hay:f[0]+" "+f[1],name:f[0].toLowerCase(),go:()=>{ faqTab="all"; $$("#faqTab .chip").forEach((c,n)=>c.setAttribute("aria-pressed",n===0)); renderFaq(); goView("faq"); const d=$("#faq"+i); if(d){ d.open=true; d.scrollIntoView({block:"center"}) } }}));
      const add=(list,tab)=>list.forEach(x=>out.push({type:"Counselling",title:x[0],sub:x[1],hay:x[0]+" "+x[1],name:x[0].toLowerCase(),go:()=>{ counTab=tab; $$("#counTab .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.k===tab)); renderCoun(); goView("counsel") }}));
      add(COUN.steps,"josaa"); add(COUN.rules,"rules"); add(COUN.state,"state"); add(COUN.others,"other");
      CTABS.forEach(t=>out.push({type:"Cutoffs",title:"Cutoffs: "+t[1],sub:"Last year’s closing ranks and scores",hay:"cutoff cut-off closing rank "+t[1],name:t[1].toLowerCase(),go:()=>{ cut.tab=t[0]; $$("#cutTab .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.k===t[0])); renderCut(); goView("cutoffs") }}));
      return out;
    }
  };
})();
