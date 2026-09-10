(() => {
"use strict";

/* ==========================================================
   MOCK DATA
========================================================== */
const FIRST_NAMES = ["Amara","Sara","Liya","Meron","Noah","Kaleb","Hana","Bethel","Sofia","Dawit","Ruth","Nardos","Eyob","Selam","Marta","Yonas","Abel","Hiwot","Betty","Elias","Ferehiwot","Samuel","Lily","Naomi","Micky"];
const JOBS = ["Fitness Coach","Digital Artist","Makeup Stylist","Music Producer","Dance Instructor","Photographer","Chef","Fashion Model","Yoga Teacher","Voice Actor","Travel Blogger","Gamer"];
const CITIES = ["Addis Ababa","Adama","Hawassa","Bahir Dar","Mekelle","Gondar","Dire Dawa","Jimma"];
const COUNTRIES = ["ET","KE","NG","GH","US","UK"];
const GROUP_TOPICS = ["Fitness Circle","Music Lovers","Art & Design","Foodies Hub","Travel Diaries","Book Club","Gaming Squad","Film Buffs","Startup Founders","Photography Pros","Language Exchange","Wellness Crew","Fashion Talk","Coding Corner","Dance Vibes"];
const PALETTE_COUNT = 8;

function seededPick(arr, seed){ return arr[seed % arr.length]; }
function paletteFor(seed){ return seed % PALETTE_COUNT; }

function buildCreators(){
  const list = [];
  for(let i=0;i<25;i++){
    list.push({
      id:"c"+i,
      name: seededPick(FIRST_NAMES,i) + " " + String.fromCharCode(65 + (i*3)%26) + ".",
      job: seededPick(JOBS,i),
      city: seededPick(CITIES,i),
      online: i % 3 !== 0,
      price: (150 + (i%6)*75) + " ETB/msg",
      bio: "Passionate " + seededPick(JOBS,i).toLowerCase() + " sharing daily moments and connecting with genuine people. Always up for a good conversation.",
      palette: paletteFor(i),
    });
  }
  return list;
}
function buildVideos(){
  const list = [];
  for(let i=0;i<20;i++){
    list.push({
      id:"v"+i,
      title: seededPick(["Morning routine that changed my life","Behind the scenes: studio session","5 tips nobody tells you","A day in " + seededPick(CITIES,i),"Q&A with my followers","Cooking my favorite dish","Travel diary: hidden gems","Workout you can do anywhere"], i),
      views: (1.2 + (i%9)*0.7).toFixed(1) + "K",
      creator: seededPick(FIRST_NAMES,i),
      palette: paletteFor(i+2),
    });
  }
  return list;
}
function buildGroups(){
  const list = [];
  for(let i=0;i<15;i++){
    list.push({
      id:"g"+i,
      name: seededPick(GROUP_TOPICS,i),
      members: 120 + (i*57)%2400,
      desc: "A community for people who love " + seededPick(GROUP_TOPICS,i).toLowerCase() + ". Share tips, meet like-minded members, and join weekly events.",
      palette: paletteFor(i+4),
    });
  }
  return list;
}
function buildLive(){
  const list = [];
  for(let i=0;i<12;i++){
    list.push({
      id:"l"+i,
      title: seededPick(["Live Q&A right now","Studio session live","Cooking live tonight","Late night chat","Workout live class","Music jam session"], i),
      viewers: 40 + (i*37)%900,
      country: seededPick(COUNTRIES,i),
      host: seededPick(FIRST_NAMES,i),
      palette: paletteFor(i+6),
    });
  }
  return list;
}

/* ==========================================================
   STATE
========================================================== */
const state = {
  user: null,
  activeMainTab: "explore",
  activeTopTab: "creators",
  currentPage: 1,
  creatorFilter: "all",
  sentUserMessageCount: {},
  selectedPlan: null,
  timerStarted: false,
  onboardTimeoutId: null,
  conversations: [],
  activeConversationId: null,
  authMode: "signin",
  pendingChatTarget: null,
  pendingRegistration: null,
  creators: buildCreators(),
  videos: buildVideos(),
  groups: buildGroups(),
  live: buildLive(),
};

const PLANS = [
  { id:"monthly", label:"Monthly", price:1000, period:"month", best:false,
    perks:["Unlimited chat with all creators","Full video library access","Join every group","Watch all live streams","Priority support","No pagination limits"] },
  { id:"sixmonth", label:"6-Month", price:2500, period:"6 months", best:true,
    perks:["Everything in Monthly","Save over 55% vs monthly","Unlimited chat with all creators","Full video library access","Priority support","No pagination limits"] },
  { id:"yearly", label:"Yearly", price:3500, period:"year", best:false,
    perks:["Everything in 6-Month","Best long-term value","Unlimited chat with all creators","Full video library access","Priority support","No pagination limits"] },
];

/* ==========================================================
   DOM HELPERS
========================================================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function icons(){ if(window.lucide) lucide.createIcons(); }

function initials(name){
  return name.split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase();
}

function avatarHTML(name, palette, opts){
  opts = opts || {};
  const size = opts.size || "";
  const statusDot = opts.status ? `<span class="status-dot ${opts.status}"></span>` : "";
  return `<div class="avatar photo palette-${palette} ${size}">
    <span class="avatar-letter">${initials(name)}</span>${statusDot}
  </div>`;
}

/* ==========================================================
   HEADER / TOP TABS
========================================================== */
$("#logo-btn").addEventListener("click", () => {
  setMainTab("explore");
  setTopTab("creators");
});

$("#top-tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".top-tab");
  if(!btn) return;
  setTopTab(btn.dataset.top);
});

function setTopTab(tab){
  state.activeTopTab = tab;
  state.currentPage = 1;
  $$(".top-tab").forEach(b => b.classList.toggle("active", b.dataset.top === tab));
  $("#creators-filter-bar").style.display = tab === "creators" ? "flex" : "none";
  $("#creators-grid").style.display = tab === "creators" ? "grid" : "none";
  $("#videos-grid").style.display = tab === "videos" ? "grid" : "none";
  $("#groups-grid").style.display = tab === "groups" ? "grid" : "none";
  $("#live-grid").style.display = tab === "live" ? "grid" : "none";
  renderCurrentGrid();
}

/* ==========================================================
   DRAWER
========================================================== */
function openDrawer(){
  $("#side-drawer").classList.add("active");
  $("#drawer-overlay").classList.add("active");
}
function closeDrawer(){
  $("#side-drawer").classList.remove("active");
  $("#drawer-overlay").classList.remove("active");
}
$("#hamburger-btn").addEventListener("click", openDrawer);
$("#close-drawer-btn").addEventListener("click", closeDrawer);
$("#drawer-overlay").addEventListener("click", closeDrawer);

$("#theme-toggle").addEventListener("change", (e) => {
  document.body.classList.toggle("light-mode", !e.target.checked);
});

$("#vip-drawer-btn").addEventListener("click", () => {
  closeDrawer();
  openMembershipModal();
});

$("#drawer-profile-btn").addEventListener("click", () => {
  closeDrawer();
  if(!state.user){ openAuthModal("signin"); return; }
  setMainTab("profile");
});

function refreshAuthBtn(){
  $("#drawer-auth-btn").textContent = state.user ? "Logout" : "Sign In / Register";
}
$("#drawer-auth-btn").addEventListener("click", () => {
  if(state.user){
    logout();
  } else {
    closeDrawer();
    openAuthModal("signin");
  }
});

function logout(){
  state.user = null;
  clearTimeout(state.onboardTimeoutId);
  state.timerStarted = false;
  state.conversations = [];
  state.activeConversationId = null;
  refreshAuthBtn();
  renderProfile();
  renderChatList();
  renderChatActive();
  updateUnreadDot();
  closeDrawer();
  setMainTab("explore");
}

/* ==========================================================
   BOTTOM NAV / MAIN TABS
========================================================== */
$$(".bottom-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.main;
    if((target === "chat" || target === "profile") && !state.user){
      openAuthModal("signin");
      return;
    }
    setMainTab(target);
  });
});

function setMainTab(tab){
  state.activeMainTab = tab;
  $$(".bottom-tab").forEach(b => b.classList.toggle("active", b.dataset.main === tab));
  $("#view-explore").classList.toggle("active", tab === "explore");
  $("#view-chat").classList.toggle("active", tab === "chat");
  $("#view-profile").classList.toggle("active", tab === "profile");

  // Requirement 2: hide the Creators/Videos/Groups/Live pill bar outside Explore
  $("#top-tabs").classList.toggle("is-hidden", tab !== "explore");

  if(tab === "profile") renderProfile();
  if(tab === "chat"){
    renderChatList();
    if(state.activeConversationId){
      markConversationRead(state.activeConversationId);
    }
    updateUnreadDot();
  } else {
    // leaving chat on mobile resets the thread view back to the list next time
    $("#chat-layout").classList.remove("thread-open");
  }
  window.scrollTo({top:0, behavior:"instant"});
}

/* ==========================================================
   EXPLORE — FILTER BAR
========================================================== */
$("#creators-filter-bar").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if(!chip) return;
  state.creatorFilter = chip.dataset.filter;
  state.currentPage = 1;
  $$("#creators-filter-bar .chip").forEach(c => c.classList.toggle("active", c === chip));
  renderCurrentGrid();
});

/* ==========================================================
   PAGINATION
========================================================== */
function currentDataset(){
  switch(state.activeTopTab){
    case "creators": {
      let list = state.creators;
      if(state.creatorFilter === "online") list = list.filter(c => c.online);
      if(state.creatorFilter === "offline") list = list.filter(c => !c.online);
      return list;
    }
    case "videos": return state.videos;
    case "groups": return state.groups;
    case "live": return state.live;
  }
}

function renderCurrentGrid(){
  const list = currentDataset();
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  if(state.currentPage > totalPages) state.currentPage = totalPages;
  const start = (state.currentPage - 1) * perPage;
  const pageItems = list.slice(start, start + perPage);

  if(state.activeTopTab === "creators") renderCreators(pageItems);
  if(state.activeTopTab === "videos") renderVideos(pageItems);
  if(state.activeTopTab === "groups") renderGroups(pageItems);
  if(state.activeTopTab === "live") renderLive(pageItems);

  renderPagination(totalPages);
  icons();
}

function renderPagination(totalPages){
  const el = $("#pagination");
  el.innerHTML = "";
  const isVip = !!(state.user && state.user.isMember);
  const maxShown = 5;

  function pageBtn(n){
    const locked = !isVip && n > 2;
    const b = document.createElement("button");
    b.className = "page-btn" + (n === state.currentPage ? " active" : "") + (locked ? " locked" : "");
    b.innerHTML = n + (locked ? ' <i data-lucide="lock"></i>' : "");
    b.addEventListener("click", () => goToPage(n));
    return b;
  }

  const pagesToShow = [];
  for(let n=1; n<=Math.min(totalPages, maxShown); n++) pagesToShow.push(n);
  pagesToShow.forEach(n => el.appendChild(pageBtn(n)));

  if(totalPages > maxShown){
    const dots = document.createElement("span");
    dots.className = "page-btn dots";
    dots.textContent = "…";
    el.appendChild(dots);
    el.appendChild(pageBtn(totalPages));
  }

  const jump = document.createElement("button");
  jump.className = "page-btn" + (!isVip ? " locked" : "");
  jump.innerHTML = '<i data-lucide="chevrons-right"></i>';
  jump.addEventListener("click", () => {
    if(!isVip){ openMembershipModal(); return; }
    goToPage(totalPages);
  });
  el.appendChild(jump);
}

function goToPage(n){
  const isVip = !!(state.user && state.user.isMember);
  if(n > 2 && !isVip){
    openMembershipModal();
    return;
  }
  state.currentPage = n;
  renderCurrentGrid();
  $("main.viewport").scrollIntoView({behavior:"smooth"});
}

/* ==========================================================
   RENDER: CREATORS
========================================================== */
function renderCreators(items){
  const el = $("#creators-grid");
  el.innerHTML = items.map(c => `
    <div class="card creator-card" data-id="${c.id}" data-type="creator" tabindex="0">
      ${avatarHTML(c.name, c.palette, {status: c.online ? "online" : "offline"})}
      <div class="creator-info">
        <div class="creator-name">${c.name} <span class="status-pill ${c.online?'online':'offline'}">${c.online?'Online':'Offline'}</span></div>
        <div class="creator-job">${c.job}</div>
        <div class="creator-meta">
          <span><i data-lucide="map-pin"></i>${c.city}</span>
          <span class="price-tag">${c.price}</span>
        </div>
      </div>
    </div>
  `).join("");
}

/* ==========================================================
   RENDER: VIDEOS
========================================================== */
function renderVideos(items){
  const el = $("#videos-grid");
  el.innerHTML = items.map(v => `
    <div class="card video-card" data-id="${v.id}" data-type="video" tabindex="0">
      <div class="video-thumb photo palette-${v.palette}">
        <i data-lucide="play"></i>
        <span class="view-badge"><i data-lucide="eye"></i>${v.views}</span>
      </div>
      <div class="video-title">${v.title}</div>
    </div>
  `).join("");
}

/* ==========================================================
   RENDER: GROUPS
========================================================== */
function renderGroups(items){
  const el = $("#groups-grid");
  el.innerHTML = items.map(g => `
    <div class="card group-card" data-id="${g.id}" data-type="group" tabindex="0">
      <div class="group-avatar-thumb palette-${g.palette}">${initials(g.name)}</div>
      <div>
        <div class="group-name">${g.name}</div>
        <div class="group-members">${g.members.toLocaleString()} members</div>
      </div>
    </div>
  `).join("");
}

/* ==========================================================
   RENDER: LIVE
========================================================== */
function renderLive(items){
  const el = $("#live-grid");
  el.innerHTML = items.map(l => `
    <div class="card live-card" data-id="${l.id}" data-type="live" tabindex="0">
      <div class="video-thumb photo palette-${l.palette}">
        <i data-lucide="radio"></i>
        <span class="live-badge"><span class="live-dot"></span>LIVE</span>
        <span class="country-badge">${l.country}</span>
        <span class="viewer-badge"><i data-lucide="eye"></i>${l.viewers}</span>
      </div>
      <div class="live-title">${l.title}</div>
    </div>
  `).join("");
}

/* ==========================================================
   CARD CLICK ROUTER
========================================================== */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card[data-type]");
  if(!card) return;
  const { id, type } = card.dataset;
  if(type === "creator") openCreatorDetail(id);
  if(type === "video") openVideoGate();
  if(type === "group") openGroupDetail(id);
  if(type === "live") openLiveGate();
});

function openVideoGate(){
  if(state.user && state.user.isMember) return; // full access — no-op mock
  openMembershipModal();
}
function openLiveGate(){
  if(state.user && state.user.isMember) return;
  openMembershipModal();
}

/* ==========================================================
   MODAL HELPERS
========================================================== */
function closeAllOverlays(){
  ["detail-modal","auth-modal","membership-modal","cbe-modal"].forEach(id => {
    const modal = $("#" + id);
    const overlay = $("#" + id + "-overlay");
    if(modal) modal.classList.remove("active");
    if(overlay) overlay.classList.remove("active");
  });
}

/* ==========================================================
   DETAIL SHEET MODAL
========================================================== */
function openSheet(html){
  closeAllOverlays();
  $("#detail-modal-body").innerHTML = html;
  $("#detail-modal-overlay").classList.add("active");
  $("#detail-modal").classList.add("active");
  icons();
}
function closeSheet(){
  $("#detail-modal-overlay").classList.remove("active");
  $("#detail-modal").classList.remove("active");
}
$("#detail-modal-overlay").addEventListener("click", closeSheet);

function openCreatorDetail(id){
  const c = state.creators.find(x => x.id === id);
  if(!c) return;
  openSheet(`
    <div class="detail-head">
      <div class="detail-avatar palette-${c.palette}">${initials(c.name)}</div>
      <div>
        <div class="detail-name">${c.name} <span class="status-pill ${c.online?'online':'offline'}">${c.online?'Online':'Offline'}</span></div>
        <div class="detail-job">${c.job}</div>
      </div>
    </div>
    <div class="detail-meta-row">
      <div class="detail-meta-item"><div class="detail-meta-label">City</div><div class="detail-meta-value">${c.city}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Rate</div><div class="detail-meta-value">${c.price}</div></div>
    </div>
    <p class="detail-bio">${c.bio}</p>
    <button class="btn btn-block" id="detail-chat-btn">
      <i data-lucide="message-circle"></i> Chat
    </button>
  `);
  $("#detail-chat-btn").addEventListener("click", () => {
    closeSheet();
    if(!state.user){
      state.pendingChatTarget = c;
      openAuthModal("signin");
      return;
    }
    openConversationWith(c);
  });
}

function openGroupDetail(id){
  const g = state.groups.find(x => x.id === id);
  if(!g) return;
  openSheet(`
    <div class="detail-head">
      <div class="detail-avatar palette-${g.palette}">${initials(g.name)}</div>
      <div>
        <div class="detail-name">${g.name}</div>
        <div class="detail-job">${g.members.toLocaleString()} members</div>
      </div>
    </div>
    <p class="detail-group-desc">${g.desc}</p>
    <button class="btn btn-block" id="detail-join-btn">Join Group</button>
  `);
  $("#detail-join-btn").addEventListener("click", () => {
    closeSheet();
    if(state.user && state.user.isMember) return;
    openMembershipModal();
  });
}

/* ==========================================================
   AUTH MODAL (2-step: credentials -> OTP verification)
========================================================== */
function openAuthModal(mode){
  closeAllOverlays();
  state.authMode = mode;
  showAuthStep("credentials");
  refreshAuthModalCopy();
  clearAuthError();
  $("#auth-modal-overlay").classList.add("active");
  $("#auth-modal").classList.add("active");
  icons();
}
function closeAuthModal(){
  $("#auth-modal-overlay").classList.remove("active");
  $("#auth-modal").classList.remove("active");
  $("#auth-form").reset();
  showAuthStep("credentials");
  clearAuthError();
  resetOtpInputs();
}
function showAuthStep(step){
  $("#auth-step-credentials").style.display = step === "credentials" ? "block" : "none";
  $("#auth-step-verify").style.display = step === "verify" ? "block" : "none";
}
function refreshAuthModalCopy(){
  const isSignIn = state.authMode === "signin";
  $("#auth-modal-title").textContent = isSignIn ? "Welcome back" : "Create your account";
  $("#auth-modal-sub").textContent = isSignIn
    ? "Sign in to chat with creators and join the community."
    : "Register to start chatting and exploring.";
  $("#auth-username-group").style.display = isSignIn ? "none" : "flex";
  $("#auth-age-group").style.display = isSignIn ? "none" : "flex";
  $("#auth-confirm-group").style.display = isSignIn ? "none" : "flex";
  $("#auth-switch-text").textContent = isSignIn ? "Don't have an account?" : "Already have an account?";
  $("#auth-switch-btn").textContent = isSignIn ? "Register" : "Sign in";
}
$("#auth-switch-btn").addEventListener("click", () => {
  state.authMode = state.authMode === "signin" ? "register" : "signin";
  refreshAuthModalCopy();
  clearAuthError();
});

function showAuthError(msg){
  const el = $("#auth-error");
  el.textContent = msg;
  el.hidden = false;
}
function clearAuthError(){
  const el = $("#auth-error");
  el.hidden = true;
  el.textContent = "";
}

// password show/hide toggles (shared by auth password + confirm password)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".pw-toggle");
  if(!btn) return;
  const input = document.getElementById(btn.dataset.target);
  if(!input) return;
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  btn.innerHTML = showing ? '<i data-lucide="eye"></i>' : '<i data-lucide="eye-off"></i>';
  icons();
});

$("#auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  clearAuthError();

  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  const isSignIn = state.authMode === "signin";

  if(!isSignIn){
    const usernameInput = $("#auth-username").value.trim();
    const age = parseInt($("#auth-age").value, 10);
    const confirmPassword = $("#auth-confirm-password").value;

    if(!age || age < 18){
      showAuthError("You must be 18 or older to register.");
      return;
    }
    if(password !== confirmPassword){
      showAuthError("Passwords do not match.");
      return;
    }
    state.pendingRegistration = {
      email,
      username: usernameInput || email.split("@")[0] || "user",
      age,
    };
  } else {
    state.pendingRegistration = { email, username: email.split("@")[0] || "user", age: null, existing: true };
  }

  // move to simulated verification step
  $("#auth-verify-email").textContent = email || "your email";
  showAuthStep("verify");
  resetOtpInputs();
  icons();
  focusFirstOtp();
});

/* --- OTP handling --- */
function resetOtpInputs(){
  $$(".otp-digit").forEach(inp => inp.value = "");
  $("#otp-error").hidden = true;
}
function focusFirstOtp(){
  const first = $(".otp-digit");
  if(first) setTimeout(() => first.focus(), 50);
}
$("#otp-row").addEventListener("input", (e) => {
  const target = e.target;
  if(!target.classList.contains("otp-digit")) return;
  target.value = target.value.replace(/[^0-9]/g, "").slice(0,1);
  if(target.value){
    const next = target.nextElementSibling;
    if(next && next.classList.contains("otp-digit")) next.focus();
  }
});
$("#otp-row").addEventListener("keydown", (e) => {
  const target = e.target;
  if(!target.classList.contains("otp-digit")) return;
  if(e.key === "Backspace" && !target.value){
    const prev = target.previousElementSibling;
    if(prev && prev.classList.contains("otp-digit")) prev.focus();
  }
});
$("#otp-back-btn").addEventListener("click", () => {
  showAuthStep("credentials");
  clearAuthError();
});

$("#otp-verify-btn").addEventListener("click", () => {
  const code = $$(".otp-digit").map(i => i.value).join("");
  const errEl = $("#otp-error");
  if(code.length < 6){
    errEl.textContent = "Enter all 6 digits.";
    errEl.hidden = false;
    return;
  }
  if(code !== "000000"){
    errEl.textContent = "Incorrect code. Try 000000 for this demo.";
    errEl.hidden = false;
    return;
  }
  errEl.hidden = true;
  completeAuth();
});

function completeAuth(){
  const pending = state.pendingRegistration;
  if(!pending) return;

  if(state.authMode === "signin" || pending.existing){
    // reuse existing user if same email previously registered in this session, else create fresh
    if(!state.user || state.user.email !== pending.email){
      state.user = {
        id: "u_" + Date.now(),
        email: pending.email,
        username: pending.username,
        age: null,
        isMember: false,
        avatarDataUrl: null,
        city: "",
        bio: "",
        joinedAt: Date.now(),
      };
    }
  } else {
    state.user = {
      id: "u_" + Date.now(),
      email: pending.email,
      username: pending.username,
      age: pending.age,
      isMember: false,
      avatarDataUrl: null,
      city: "",
      bio: "",
      joinedAt: Date.now(),
    };
  }

  state.pendingRegistration = null;
  closeAuthModal();
  refreshAuthBtn();
  renderProfile();
  startOnboardingTimer();

  if(state.pendingChatTarget){
    const target = state.pendingChatTarget;
    state.pendingChatTarget = null;
    openConversationWith(target);
  }
}

$$('[data-close]').forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.close;
    $("#" + id).classList.remove("active");
    $("#" + id + "-overlay").classList.remove("active");
    if(id === "auth-modal") closeAuthModal();
  });
});
["auth-modal","membership-modal","cbe-modal"].forEach(id => {
  $("#" + id + "-overlay").addEventListener("click", () => {
    $("#" + id).classList.remove("active");
    $("#" + id + "-overlay").classList.remove("active");
    if(id === "auth-modal") closeAuthModal();
  });
});

/* ==========================================================
   MEMBERSHIP / CBE MODALS
========================================================== */
function renderPlans(){
  $("#plans-grid").innerHTML = PLANS.map(p => `
    <div class="plan-card ${p.best?'best':''}">
      ${p.best ? '<span class="plan-badge">Best Value</span>' : ''}
      <div class="plan-name">${p.label}</div>
      <div class="plan-price">${p.price.toLocaleString()} ETB <span>/ ${p.period}</span></div>
      <ul class="plan-perks">
        ${p.perks.map(perk => `<li><i data-lucide="check-circle-2"></i>${perk}</li>`).join("")}
      </ul>
      <button type="button" class="btn plan-select-btn" data-plan="${p.id}">Select Plan</button>
    </div>
  `).join("");
  icons();
}

function openMembershipModal(){
  if(!state.user){
    openAuthModal("signin");
    return;
  }
  closeAllOverlays();
  renderPlans();
  $("#membership-modal-overlay").classList.add("active");
  $("#membership-modal").classList.add("active");
  icons();
}

$("#plans-grid").addEventListener("click", (e) => {
  const btn = e.target.closest(".plan-select-btn");
  if(!btn) return;
  e.preventDefault();
  const plan = PLANS.find(p => p.id === btn.dataset.plan);
  if(!plan) return;
  state.selectedPlan = plan;
  $("#membership-modal").classList.remove("active");
  $("#membership-modal-overlay").classList.remove("active");
  openCbeModal();
});

function openCbeModal(){
  const p = state.selectedPlan;
  if(!p) return;
  $("#cbe-summary").innerHTML = `<span>${p.label} plan</span><strong>${p.price.toLocaleString()} ETB</strong>`;
  $("#upload-label").textContent = "Upload payment screenshot";
  $("#cbe-file-input").value = "";
  $("#cbe-modal-overlay").classList.add("active");
  $("#cbe-modal").classList.add("active");
  icons();
}

$("#cbe-copy-btn").addEventListener("click", () => {
  const num = $("#cbe-account-number").textContent;
  const btn = $("#cbe-copy-btn");
  const reset = () => btn.textContent = "Copy";
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(num).then(() => {
      btn.textContent = "Copied!";
      setTimeout(reset, 1800);
    }).catch(() => {
      btn.textContent = "Copied!";
      setTimeout(reset, 1800);
    });
  } else {
    btn.textContent = "Copied!";
    setTimeout(reset, 1800);
  }
});

$("#upload-box").addEventListener("click", () => $("#cbe-file-input").click());
$("#cbe-file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  $("#upload-label").textContent = file ? file.name : "Upload payment screenshot";
});

$("#cbe-submit-btn").addEventListener("click", () => {
  if(!state.user){
    openAuthModal("signin");
    return;
  }
  state.user.isMember = true;
  $("#cbe-modal-overlay").classList.remove("active");
  $("#cbe-modal").classList.remove("active");
  renderProfile();
  renderCurrentGrid();
  showSuccessBanner("Welcome to VIP! Your membership is now active.");
});

function showSuccessBanner(text){
  const b = $("#success-banner");
  $("#success-banner-text").textContent = text;
  b.classList.add("active");
  setTimeout(() => b.classList.remove("active"), 3200);
}

/* ==========================================================
   CHAT SYSTEM
========================================================== */
function findConversation(creatorId){
  return state.conversations.find(c => c.creatorId === creatorId);
}

function openConversationWith(creator){
  let convo = findConversation(creator.id);
  if(!convo){
    convo = {
      id: "conv_" + creator.id,
      creatorId: creator.id,
      name: creator.name,
      palette: creator.palette != null ? creator.palette : 0,
      unread: false,
      messages: [
        { from: "them", text: "Hey! Thanks for reaching out 👋 — what's on your mind?" }
      ],
    };
    state.conversations.push(convo);
  }
  state.activeConversationId = convo.id;
  setMainTab("chat");
  openThreadView();
  renderChatList();
  renderChatActive();
}

function openThreadView(){
  if(window.innerWidth <= 760){
    $("#chat-layout").classList.add("thread-open");
  }
}
function closeThreadView(){
  $("#chat-layout").classList.remove("thread-open");
}
$("#chat-back-btn").addEventListener("click", closeThreadView);

function markConversationRead(id){
  const c = state.conversations.find(x => x.id === id);
  if(c) c.unread = false;
}

function updateUnreadDot(){
  const anyUnread = state.conversations.some(c => c.unread);
  $("#unread-dot").hidden = !anyUnread;
}

function renderChatList(){
  const el = $("#chat-list");
  if(state.conversations.length === 0){
    el.innerHTML = `<div class="chat-empty" style="height:100%"><i data-lucide="inbox"></i><p>No conversations yet</p></div>`;
    icons();
    return;
  }
  el.innerHTML = state.conversations.map(c => {
    const last = c.messages[c.messages.length - 1];
    return `
      <div class="chat-list-item ${c.id === state.activeConversationId ? 'active':''}" data-conv="${c.id}">
        <div class="avatar photo palette-${c.palette||0}" style="width:42px;height:42px;border-radius:12px;">
          <span class="avatar-letter" style="font-size:12px;padding-bottom:0;">${initials(c.name)}</span>
        </div>
        <div style="min-width:0">
          <div class="chat-list-name">${c.name}</div>
          <div class="chat-list-preview">${last ? last.text : ""}</div>
        </div>
        ${c.unread ? '<span class="chat-list-dot"></span>' : ''}
      </div>
    `;
  }).join("");
  icons();
}

$("#chat-list").addEventListener("click", (e) => {
  const item = e.target.closest(".chat-list-item");
  if(!item) return;
  state.activeConversationId = item.dataset.conv;
  markConversationRead(state.activeConversationId);
  updateUnreadDot();
  renderChatList();
  renderChatActive();
  openThreadView();
});

function renderChatActive(){
  const convo = state.conversations.find(c => c.id === state.activeConversationId);
  if(!convo){
    $("#chat-empty").style.display = "flex";
    $("#chat-active").style.display = "none";
    return;
  }
  $("#chat-empty").style.display = "none";
  $("#chat-active").style.display = "flex";
  $("#chat-head-name").textContent = convo.name;
  $("#chat-head-avatar").className = "avatar photo chat-head-avatar palette-" + (convo.palette||0);
  $("#chat-head-avatar").innerHTML = `<span class="avatar-letter" style="font-size:12px;padding-bottom:0;">${initials(convo.name)}</span>`;
  $("#chat-feed").innerHTML = convo.messages.map(m => {
    if(m.from === "error"){
      return `<div class="msg err">${m.text}<div class="err-text">You must be a member to continue chatting.</div>
        <button class="upgrade-link" data-upgrade="1">Upgrade</button></div>`;
    }
    return `<div class="msg ${m.from === 'me' ? 'out' : 'in'}">${m.text}</div>`;
  }).join("");
  icons();
  const feed = $("#chat-feed");
  feed.scrollTop = feed.scrollHeight;
}

$("#chat-feed").addEventListener("click", (e) => {
  if(e.target.closest("[data-upgrade]")) openMembershipModal();
});

$("#chat-input-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim();
  if(!text) return;
  const convo = state.conversations.find(c => c.id === state.activeConversationId);
  if(!convo) return;

  const isVip = !!(state.user && state.user.isMember);
  const sentCount = state.sentUserMessageCount[convo.id] || 0;

  if(!isVip && sentCount >= 1){
    convo.messages.push({ from: "error", text });
    renderChatActive();
    renderChatList();
    input.value = "";
    return;
  }

  convo.messages.push({ from: "me", text });
  state.sentUserMessageCount[convo.id] = sentCount + 1;
  input.value = "";
  renderChatActive();
  renderChatList();

  // simple canned auto-reply for realism
  setTimeout(() => {
    convo.messages.push({ from: "them", text: "Got it! I'll get back to you shortly 💬" });
    convo.unread = state.activeMainTab !== "chat";
    renderChatActive();
    renderChatList();
    updateUnreadDot();
  }, 900);
});

/* ==========================================================
   ONBOARDING AUTOMATION (30s after login)
========================================================== */
function startOnboardingTimer(){
  if(state.timerStarted) return;
  state.timerStarted = true;
  state.onboardTimeoutId = setTimeout(() => {
    const assistants = [
      { id: "sys_sarah", name: "Sarah", palette: 5, text: "Welcome to Nova! I'm here if you ever need help getting started 🌟" },
      { id: "sys_support", name: "Support Bot", palette: 3, text: "Hi there — quick tip: tap the gem icon anytime to see VIP perks." },
      { id: "sys_elena", name: "Elena", palette: 1, text: "Hey! So glad you joined. Let me know if you have any questions 💬" },
    ];
    assistants.forEach(a => {
      let convo = state.conversations.find(c => c.id === a.id);
      if(!convo){
        convo = { id: a.id, creatorId: a.id, name: a.name, palette: a.palette, unread: true, messages: [] };
        state.conversations.push(convo);
      }
      convo.messages.push({ from: "them", text: a.text });
      convo.unread = true;
    });
    updateUnreadDot();
    renderChatList();
    if(state.activeMainTab === "chat") renderChatActive();
  }, 30000);
}

/* ==========================================================
   PROFILE VIEW
========================================================== */
function setProfileAvatarVisual(){
  const el = $("#profile-avatar");
  if(state.user && state.user.avatarDataUrl){
    el.style.backgroundImage = `url(${state.user.avatarDataUrl})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.textContent = "";
  } else {
    el.style.backgroundImage = "";
    el.style.background = "linear-gradient(135deg, var(--neon), var(--gold))";
  }
}

function renderProfile(){
  if(!state.user){
    $("#profile-name").textContent = "Guest";
    $("#profile-badge").textContent = "Not signed in";
    $("#profile-badge").className = "badge";
    $("#profile-email").textContent = "";
    $("#profile-username-input").value = "";
    $("#profile-age-input").value = "";
    $("#profile-city-input").value = "";
    $("#profile-bio-input").value = "";
    $("#stat-chats").textContent = "0";
    $("#stat-joined").textContent = "—";
    $("#stat-status").textContent = "Free";
    setProfileAvatarVisual();
    return;
  }
  $("#profile-name").textContent = state.user.username;
  const isVip = !!state.user.isMember;
  $("#profile-badge").textContent = isVip ? "VIP Member" : "Free Member";
  $("#profile-badge").className = "badge" + (isVip ? " vip" : "");
  $("#profile-email").textContent = state.user.email;
  $("#profile-username-input").value = state.user.username;
  $("#profile-age-input").value = state.user.age || "";
  $("#profile-city-input").value = state.user.city || "";
  $("#profile-bio-input").value = state.user.bio || "";
  $("#profile-vip-btn").style.display = isVip ? "none" : "flex";

  $("#stat-chats").textContent = state.conversations.length;
  $("#stat-joined").textContent = state.user.joinedAt
    ? new Date(state.user.joinedAt).toLocaleDateString(undefined, {month:"short", year:"numeric"})
    : "—";
  $("#stat-status").textContent = isVip ? "VIP" : "Free";

  setProfileAvatarVisual();
}

$("#edit-profile-btn").addEventListener("click", () => {
  $("#profile-username-input").disabled = false;
  $("#profile-age-input").disabled = false;
  $("#profile-city-input").disabled = false;
  $("#profile-bio-input").disabled = false;
  $("#profile-username-input").focus();
  $("#edit-profile-btn").style.display = "none";
  $("#save-profile-btn").style.display = "block";
});

$("#save-profile-btn").addEventListener("click", () => {
  if(!state.user) return;
  state.user.username = $("#profile-username-input").value.trim() || state.user.username;
  state.user.age = parseInt($("#profile-age-input").value, 10) || state.user.age;
  state.user.city = $("#profile-city-input").value.trim();
  state.user.bio = $("#profile-bio-input").value.trim();
  $("#profile-username-input").disabled = true;
  $("#profile-age-input").disabled = true;
  $("#profile-city-input").disabled = true;
  $("#profile-bio-input").disabled = true;
  $("#save-profile-btn").style.display = "none";
  $("#edit-profile-btn").style.display = "block";
  renderProfile();
});

$("#profile-vip-btn").addEventListener("click", openMembershipModal);

$("#avatar-upload-btn").addEventListener("click", (e) => {
  // clicking the label already opens the hidden file input
});
$("#profile-avatar-input").addEventListener("change", (e) => {
  if(!state.user) return;
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.user.avatarDataUrl = reader.result;
    setProfileAvatarVisual();
  };
  reader.readAsDataURL(file);
});

/* ==========================================================
   INIT
========================================================== */
function init(){
  renderCurrentGrid();
  renderProfile();
  refreshAuthBtn();
  icons();
}
init();

})();
