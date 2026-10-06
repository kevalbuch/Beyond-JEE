/* ---------- girl candidates: researched Oct 2026 from published sources; confirm in each official brochure ---------- */
const GSTATS=[
 ["20%","Women’s share the IITs aim for in every programme, using extra female-only seats"],
 ["3,814","Female-only seats allotted at IITs in 2026"],
 ["₹1,600","JEE Advanced fee for girls. Others pay ₹3,200"],
 ["₹0","NDA application fee for women"]
];
/* per-exam badge text and detail shown inside the exam panel */
const GB={
 bitsat:"₹500 off fee", nda:"₹0 fee · seats for women", mht:"30% seats", kcet:"30% seats", apeapcet:"33⅓% seats",
 nest:"Half fee", uceed:"Half fee", clat:"NLU women quotas"
};
const GD={
 bitsat:"Female and transgender candidates pay ₹500 less. One session ₹3,100 instead of ₹3,600. Both sessions ₹4,600 instead of ₹5,600. Adding Session 2 later costs ₹1,500 instead of ₹2,000 (BITSAT 2026 fees).",
 nda:"Women have been admitted since August 2022. Application fee is nil for women (₹100 for others). A fixed number of vacancies is set aside for women: NDA (II) 2026 listed 24 of 394. Same UPSC written exam and SSB, and no state quotas.",
 mht:"30% of seats are reserved for female candidates under a Maharashtra government resolution of 17 April 2000. It does not apply under the Defence, PwD and Orphan categories. There is no fee concession for girls: Open pays ₹1,300, reserved categories ₹1,000.",
 kcet:"One published source lists a 30% horizontal reservation for women inside every category (General, SC, ST, OBC). Confirm the exact rule in the KEA brochure.",
 apeapcet:"33⅓% horizontal reservation for women across categories in AP EAPCET counselling. Check the domicile and local-area conditions in the APSCHE notification.",
 nest:"Female candidates of all categories pay ₹700. Male candidates in the unreserved and OBC categories pay ₹1,400 (last cycle’s fee, may change).",
 uceed:"Female candidates pay ₹2,000. Other Indian candidates pay ₹4,000. Regular last date 31 Oct 2026, late fee window until 6 Nov, 5 PM.",
 clat:"Several NLUs keep a horizontal quota for women, usually 20 to 33 percent, some limited to the home state. Published lists disagree on exact numbers, so read each NLU’s own brochure before ranking colleges."
};
const GFEE=[
 ["JEE Main, one paper (General)","₹800","₹1,000","₹200","SC/ST/PwD pay ₹500 for everyone"],
 ["JEE Main, both papers (General)","₹1,600","₹2,000","₹400","B.E./B.Tech and B.Arch together"],
 ["JEE Advanced","₹1,600","₹3,200","₹1,600","Same ₹1,600 as SC/ST/PwD"],
 ["BITSAT, one session","₹3,100","₹3,600","₹500","₹4,600 vs ₹5,600 for both sessions"],
 ["UCEED","₹2,000","₹4,000","₹2,000","Same ₹2,000 as SC/ST/PwD"],
 ["NEST","₹700","₹1,400","₹700","Last cycle’s fee, vs unreserved male"],
 ["NDA & NA","₹0","₹100","₹100","SC/ST also exempt"]
];
const GGROUPS=[
 {t:"Seats set aside for girls",cards:[
  {tag:"IITs",h:"Extra female-only seats through JoSAA",ex:null,
   pts:["Extra (supernumerary) seats are added on top of the normal intake so that women reach about <strong>20% of every programme</strong>. They do not take seats away from boys.",
        "You compete in <strong>two lists</strong>: the gender-neutral list and the female-only list. The female-only closing rank is usually more relaxed than the gender-neutral one for the same branch.",
        "Started in 2018. In 2026, <strong>3,814 female-only seats</strong> were allotted and women were about 20.2% of the 18,861 IIT seats. 10,107 women qualified in JEE Advanced 2026."],
   src:[["Careerindia","https://www.careerindia.com/news/jee-advanced-2026-female-qualifiers-cross-10-000-six-year-high-066655.html"],["Cracku","https://cracku.in/josaa-iit-2026-seat-matrix/"]]},
  {tag:"NITs · IIITs · GFTIs",h:"Female-only seats in the JoSAA seat matrix",ex:null,
   pts:["Every programme and category lists two pools: <strong>Gender-neutral</strong> and <strong>Female-only (including supernumerary)</strong>.",
        "In 2018 the education ministry asked NITs to add supernumerary seats whenever girls fell below 14%, with targets of 17% in 2019 and 20% in 2020.",
        "Seat numbers differ by institute and branch, and some institutes show none. Open the JoSAA seat matrix for each college on your list."],
   src:[["Careers360 report","https://news.careers360.com/mhrd-asks-nits-add-supernumerary-seats-bring-more-gender-diversity"],["CollegeDekho","https://www.collegedekho.com/articles/josaa-seat-matrix/"]]},
  {tag:"Defence",h:"NDA: women admitted, fixed vacancies, no fee",ex:"nda",
   pts:["Women have joined the NDA since <strong>August 2022</strong> (148th course). 126 women enrolled across the 148th to 153rd courses.",
        "A fixed number of vacancies is set for women. The NDA (II) 2026 notice listed <strong>24 of 394</strong>. Check the 2027 notice for the new number.",
        "Same UPSC written exam and SSB interview as boys, with no state quotas. Application fee: <strong>nil for women</strong>, ₹100 for others."],
   src:[["PIB","https://www.pib.gov.in/PressReleasePage.aspx?PRID=2112318&reg=48&lang=2"],["PW","https://www.pw.live/defence/exams/nda-application-form"]]},
  {tag:"State CETs",h:"Women’s quota in Maharashtra, Karnataka and Andhra",ex:"mht",
   pts:["<strong>MHT CET:</strong> 30% of seats reserved for women (GR of 17 April 2000). Not available under Defence, PwD and Orphan categories.",
        "<strong>KCET:</strong> 30% horizontal quota inside each category, as listed by one source.",
        "<strong>AP EAPCET:</strong> 33⅓% horizontal quota across categories.",
        "State quotas often depend on domicile or local status. Read the state’s own rules before counting on them."],
   src:[["Collegedunia","https://collegedunia.com/exams/mht-cet/reservation"],["PW (KCET)","https://www.pw.live/state-prep/exams/kcet-reservation-criteria"],["Manabadi","https://www.manabadi.co.in/entrance-exams/ap-eapcet-reservation-and-quota-system-2026/"]]},
  {tag:"Law",h:"Women’s quota in some NLUs",ex:"clat",
   pts:["Several NLUs keep a <strong>horizontal quota for women</strong>, mostly around 30%, with RMLNLU at about 20%. Some apply only to the home state’s candidates.",
        "Published lists disagree on the exact percentage for NLSIU, NALSAR and others, so use each NLU’s brochure as the final word."],
   src:[["iQuanta","https://www.iquanta.in/blog/clat-reservation-criteria-for-women/"],["Toprankers","https://www.toprankers.com/clat-reservation"]]}
 ]},
 {t:"A college only for women",cards:[
  {tag:"Women-only",h:"IGDTUW, Delhi",ex:null,
   pts:["State-run women’s technical university at Kashmere Gate. B.Tech through <strong>JEE Main</strong> and JAC Delhi counselling, plus B.Arch and a 6-year B.Tech-MBA.",
        "2026-27 intake: <strong>1,323 seats</strong>, 85% for Delhi region and 15% outside Delhi.",
        "NAAC A+, NIRF 2025 engineering band 201–300. First-year B.Tech tuition is about ₹1.68 lakh. Check the current fee on its website."],
   src:[["Admitkard","https://www.admitkard.com/blog/igdtuw"]]}
 ]},
 {t:"Money for your studies",cards:[
  {tag:"Scholarship",h:"AICTE Pragati scholarship for girls",ex:null,
   pts:["<strong>₹50,000 a year</strong> as a lump sum, paid by direct bank transfer for tuition, books, computer and living costs. It excludes hostel and medical charges.",
        "For girls admitted to the <strong>first year</strong> of an AICTE-approved degree or diploma (second year through lateral entry). Family income up to <strong>₹8 lakh</strong>. Maximum 2 girls per family. No other concurrent scholarship.",
        "Apply on the National Scholarship Portal with eKYC. One listing gives <strong>31 Oct 2026</strong> as the 2026-27 deadline and another says it stays open, so confirm on scholarships.gov.in."],
   src:[["IndiaScholarships","https://www.indiascholarships.in/scholarships/aicte-pragati-scholarship-for-girl-students"],["Buddy4Study","https://www.buddy4study.com/scholarship/aicte-pragati-scholarship-for-girls"]]}
 ]}
];
const GNONE=[
 ["NATA","Same fee for everyone in a category (₹1,750 general, ₹1,250 SC/ST/EWS/PwD)."],
 ["NIFT","Fee is ₹2,000 (open, OBC, EWS) and ₹500 (SC/ST/PwD), with no separate girls’ rate."],
 ["IISER IAT","₹2,000 general, ₹1,000 SC/ST/PwD. No concession for girls."],
 ["MHT CET fee","No fee concession for girls. The 30% seat quota is the benefit."]
];
const GICON={"IITs":"cap","NITs \u00b7 IIITs \u00b7 GFTIs":"cap","Defence":"shield","State CETs":"chart","Law":"scale","Women-only":"building","Scholarship":"bank"};
function renderGirls(){
  const host=$("#girlsOut"); if(!host) return;
  const pct=parseFloat(GSTATS[0][0])||0;
  let h='<div class="gf-hero"><div><p class="gf-bar-n">'+GSTATS[0][0]+'</p><p class="gf-bar-cap">'+GSTATS[0][1]+'</p>'+
    '<div class="gf-bar"><i style="width:'+Math.min(100,pct)+'%"></i></div><div class="gf-bar-lbl"><span>0%</span><span>Target: '+GSTATS[0][0]+'</span></div></div>'+
    '<div class="gf-stats">'+GSTATS.slice(1).map(s=>'<div class="gf-stat"><span class="gf-tg">For girls</span><b>'+s[0]+'</b><span>'+s[1]+'</span></div>').join("")+'</div></div>';
  GGROUPS.forEach(g=>{
    h+='<div class="gf-sub"><h3>'+g.t+'</h3><small>'+g.cards.length+(g.cards.length===1?" entry":" entries")+'</small></div><div class="gf-grid">'+g.cards.map(c=>{
      const ic=GICON[c.tag]||"heart";
      return '<article class="gf-card"><div class="gf-top"><span class="gf-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+ic+'"/></svg></span><span class="gf-tag">'+c.tag+'</span></div><h4>'+c.h+'</h4><ul>'+c.pts.slice(0,2).map(p=>'<li>'+p+'</li>').join("")+'</ul>'+(c.pts.length>2?'<details class="more pk"><summary>More details</summary><ul>'+c.pts.slice(2).map(p=>'<li>'+p+'</li>').join("")+'</ul></details>':"")+
      '<div class="gf-foot">'+(c.ex?'<button class="mb" type="button" data-open="'+c.ex+'">See the exam</button>':"")+
      '<span class="src-n">Source: '+c.src.map(s=>'<a href="'+s[1]+'" target="_blank" rel="noopener">'+s[0]+'</a>').join(", ")+'</span></div></article>';
    }).join("")+'</div>';
    if(g.t==="Seats set aside for girls"){
      h+='<div class="gf-sub"><h3>Lower application fees</h3></div><div class="scroll"><table class="ct g-fee"><thead><tr><th>Exam</th><th class="gp">Girls pay</th><th>Others pay</th><th>You save</th><th>Note</th></tr></thead><tbody>'+
        GFEE.map(r=>'<tr><td><b>'+r[0]+'</b></td><td class="gp"><b>'+r[1]+'</b></td><td>'+r[2]+'</td><td>'+r[3]+'</td><td class="gn">'+r[4]+'</td></tr>').join("")+'</tbody></table></div>'+
        '<p class="note">Fees are the latest published structures for India centres and can change. Confirm when each form opens. The JEE Main figures come from the structure listed for the next cycle.</p>';
    }
  });
  h+='<div class="gf-sub"><h3>Checked, but no girls-specific benefit</h3></div><div class="gf-none">'+GNONE.map(r=>'<div><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join("")+'</div>';
  host.innerHTML=h;
}
