const STORAGE_KEY = "remoteSupportTickets_v1";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const guideData = [
  {id:"camera-offline", title:"IP camera appears offline", category:"CCTV / IP Camera", summary:"Camera is not reachable or appears disconnected in the client/NVR.", steps:[
    "Ask whether the issue affects one camera or several, and note any recent changes.",
    "Check the camera's power source or PoE port and look for link/status indicators.",
    "Inspect the Ethernet cable and connectors; test with a known-good cable or port if authorised.",
    "Confirm the camera and client/NVR are on the expected network and verify the IP address.",
    "Use an approved connectivity test (such as ping, if available) and review relevant device/network status.",
    "Record results and avoid factory-resetting the device unless the approved procedure allows it."
  ], escalate:"Escalate if power/network checks fail, multiple devices are affected, or a hardware fault is suspected."},
  {id:"no-recording", title:"Camera video is visible but not recording", category:"CCTV / NVR", summary:"Live view works, but footage is missing or playback fails.", steps:[
    "Confirm the time range, camera channel and playback filters selected by the customer.",
    "Check recorder storage status and whether the hard drive is detected and healthy.",
    "Review recording schedule, motion/event rules and any recent configuration changes.",
    "Check the recorder's date/time and time zone; incorrect settings can make footage hard to find.",
    "If permitted, review system logs and test a short recording/playback window."
  ], escalate:"Escalate if storage reports errors, footage may have been lost, or recording settings cannot be safely restored."},
  {id:"one-way-audio", title:"VoIP call has one-way audio", category:"VoIP / Network", summary:"One participant can hear the other, but audio does not work in both directions.", steps:[
    "Establish which participant cannot hear whom and whether the issue affects all calls.",
    "Check headset/handset connections, mute settings and the selected audio device.",
    "Confirm the phone or softphone is registered and the network connection is stable.",
    "Compare a test call using another device or network where policy permits.",
    "Record timestamps, affected extensions and any error messages for further investigation."
  ], escalate:"Escalate to the voice/network team if multiple users are affected or firewall, NAT or SIP/RTP routing may be involved."},
  {id:"internet-down", title:"Customer has no internet connection", category:"Internet / Network", summary:"A user or site cannot access network services.", steps:[
    "Ask whether one device, several devices or the entire site is affected.",
    "Check power and status indicators on the modem/router and inspect cables.",
    "Check Wi-Fi versus wired connectivity to isolate a wireless-only issue.",
    "Review IP address, default gateway and DNS settings; renew the connection only if approved.",
    "Run approved basic tests and record exact error messages and when the fault began."
  ], escalate:"Escalate if the site-wide connection remains down, the ISP link is failing, or changes require network administrator access."},
  {id:"power-fault", title:"Device will not power on", category:"Hardware / Power", summary:"Camera, recorder or network device shows no signs of power.", steps:[
    "Confirm the outlet and power adapter are appropriate and functioning, following safety procedures.",
    "Inspect the external cable, connector and device for visible damage or signs of liquid ingress.",
    "For PoE devices, check whether the switch/injector supports the device's power requirement.",
    "If trained and authorised, measure the specified output with suitable test equipment; do not open mains-powered equipment.",
    "Record indicator behaviour, adapter rating and test results before deciding on replacement or escalation."
  ], escalate:"Stop testing and escalate if there is burning smell, overheating, liquid damage, exposed conductors or suspected internal power-supply failure."}
];

let tickets = loadTickets();
let currentView = "dashboard";
let nextId = tickets.reduce((max, t) => Math.max(max, Number(t.id) || 0), 1000) + 1;

function loadTickets() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(saved)) return saved;
  } catch (error) { console.warn("Could not load saved tickets", error); }
  return [
    {id:1001, customer:"Jordan Lee", contact:"jordan@example.test", issue:"IP camera appears offline", category:"CCTV / IP Camera", priority:"High", status:"In progress", callback:"", symptoms:"One camera stopped appearing in the monitoring client.", actions:"Asked customer to check power and Ethernet link indicators.", resolution:"Checking cable and PoE port.", createdAt:new Date(Date.now()-3600000).toISOString()},
    {id:1002, customer:"Taylor Khan", contact:"", issue:"No recording available for yesterday", category:"CCTV / IP Camera", priority:"Medium", status:"Open", callback:"", symptoms:"Live view works, but playback appears empty.", actions:"Confirmed the requested date range.", resolution:"Check storage and recording schedule.", createdAt:new Date(Date.now()-7200000).toISOString()},
    {id:1003, customer:"Morgan Ali", contact:"morgan@example.test", issue:"One-way audio on calls", category:"VoIP / Phone", priority:"Critical", status:"Escalated", callback:"", symptoms:"Remote party cannot hear customer.", actions:"Checked mute and headset settings; reproduced on two calls.", resolution:"Escalated to voice/network team.", createdAt:new Date(Date.now()-86400000).toISOString()}
  ];
}

function saveTickets() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }
  catch (error) { showToast("Could not save to this browser. Check storage settings."); }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function slug(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function fmtDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHTML(value);
  return date.toLocaleString([], {month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"});
}
function callbackDue(ticket) {
  if (!ticket.callback || ticket.status === "Resolved") return false;
  return new Date(ticket.callback).getTime() <= Date.now();
}
function priorityPill(priority) { return `<span class="pill p-${slug(priority)}">${escapeHTML(priority)}</span>`; }
function statusPill(status) { return `<span class="pill s-${slug(status)}">${escapeHTML(status)}</span>`; }
function ticketRow(t, actions = false) {
  return `<tr>
    <td><span class="ticket-id">#T-${t.id}</span><span class="subtext">${fmtDate(t.createdAt)}</span></td>
    <td><strong>${escapeHTML(t.customer)}</strong><span class="subtext">${escapeHTML(t.issue)}</span></td>
    <td>${escapeHTML(t.category)}</td><td>${priorityPill(t.priority)}</td><td>${statusPill(t.status)}</td>
    <td>${t.callback ? escapeHTML(fmtDate(t.callback)) + (callbackDue(t) ? '<span class="subtext" style="color:#b83232">Due now / overdue</span>' : '') : "—"}</td>
    ${actions ? `<td><button class="action-btn" data-action="edit" data-id="${t.id}">Edit</button><button class="action-btn" data-action="resolve" data-id="${t.id}">${t.status==="Resolved"?"Reopen":"Resolve"}</button></td>` : ""}
  </tr>`;
}

function renderDashboard() {
  $("#stat-open").textContent = tickets.filter(t => t.status !== "Resolved").length;
  $("#stat-high").textContent = tickets.filter(t => ["High","Critical"].includes(t.priority) && t.status !== "Resolved").length;
  $("#stat-callbacks").textContent = tickets.filter(callbackDue).length;
  $("#stat-resolved").textContent = tickets.filter(t => t.status === "Resolved").length;
  const recent = [...tickets].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  $("#recent-tickets").innerHTML = recent.map(t => ticketRow(t)).join("");
  $("#recent-empty").classList.toggle("hidden", recent.length > 0);
}
function renderTickets() {
  const q = $("#ticket-search").value.trim().toLowerCase();
  const status = $("#status-filter").value;
  const filtered = [...tickets].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).filter(t =>
    (status === "all" || t.status === status) &&
    [t.id,t.customer,t.issue,t.category,t.priority,t.status,t.symptoms].join(" ").toLowerCase().includes(q));
  $("#tickets-table").innerHTML = filtered.map(t => ticketRow(t, true)).join("");
  $("#tickets-empty").classList.toggle("hidden", filtered.length > 0);
}
function renderGuides() {
  const q = $("#guide-search").value.trim().toLowerCase();
  const guides = guideData.filter(g => [g.title,g.category,g.summary,...g.steps,g.escalate].join(" ").toLowerCase().includes(q));
  $("#guides-list").innerHTML = guides.map(g => `<article class="guide-card">
    <div class="guide-top"><div><h3>${escapeHTML(g.title)}</h3><p>${escapeHTML(g.summary)}</p></div><span class="guide-tag">${escapeHTML(g.category)}</span></div>
    <details><summary>Show troubleshooting checklist</summary><ol>${g.steps.map(s=>`<li>${escapeHTML(s)}</li>`).join("")}</ol><p class="escalate"><strong>Escalation:</strong> ${escapeHTML(g.escalate)}</p><button class="action-btn" data-create-from-guide="${g.id}">Create ticket for this issue</button></details>
  </article>`).join("");
  if (!guides.length) $("#guides-list").innerHTML = '<p class="empty-state">No guides match that search.</p>';
}
function renderAll() { renderDashboard(); renderTickets(); renderGuides(); }
function navigate(view) {
  currentView = view;
  $$(".view").forEach(el => el.classList.add("hidden"));
  $(`#${view}-view`).classList.remove("hidden");
  $$(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  $("#page-title").textContent = ({dashboard:"Dashboard",tickets:"Support tickets",guides:"Troubleshooting guides"})[view];
  if (view === "tickets") renderTickets();
}
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openTicketDialog(prefill = {}) {
  const form = $("#ticket-form"); form.reset();
  for (const [key,value] of Object.entries(prefill)) if (form.elements[key]) form.elements[key].value = value;
  $("#ticket-dialog").showModal();
}
function closeDialog() { $("#ticket-dialog").close(); }
function saveTicket(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const editId = form.dataset.editId;
  if (editId) {
    const index = tickets.findIndex(t => String(t.id) === editId);
    if (index >= 0) tickets[index] = {...tickets[index], ...data, callback:data.callback || ""};
    delete form.dataset.editId;
    showToast("Ticket updated.");
  } else {
    tickets.push({id:nextId++, ...data, callback:data.callback || "", createdAt:new Date().toISOString()});
    showToast("Ticket saved.");
  }
  saveTickets(); closeDialog(); renderAll();
}
function editTicket(id) {
  const t = tickets.find(item => item.id === Number(id)); if (!t) return;
  const form = $("#ticket-form"); form.dataset.editId = String(t.id);
  openTicketDialog(t);
  form.dataset.editId = String(t.id);
  $(".dialog-head h2").textContent = `Edit ticket #T-${t.id}`;
}
function toggleResolved(id) {
  const t = tickets.find(item => item.id === Number(id)); if (!t) return;
  t.status = t.status === "Resolved" ? "In progress" : "Resolved";
  if (t.status === "Resolved") t.resolution = t.resolution || "Marked resolved after support checks.";
  saveTickets(); renderAll(); showToast(t.status === "Resolved" ? "Ticket marked resolved." : "Ticket reopened.");
}

$$(".nav-item").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.view)));
$$("[data-goto]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.goto)));
$("#new-ticket-btn").addEventListener("click", () => { delete $("#ticket-form").dataset.editId; $(".dialog-head h2").textContent = "Log a support ticket"; openTicketDialog(); });
$("#close-dialog").addEventListener("click", closeDialog);
$("#cancel-dialog").addEventListener("click", closeDialog);
$("#ticket-form").addEventListener("submit", saveTicket);
$("#ticket-search").addEventListener("input", renderTickets);
$("#status-filter").addEventListener("change", renderTickets);
$("#guide-search").addEventListener("input", renderGuides);
document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]");
  if (action) {
    if (action.dataset.action === "edit") editTicket(action.dataset.id);
    if (action.dataset.action === "resolve") toggleResolved(action.dataset.id);
  }
  const guideButton = event.target.closest("[data-create-from-guide]");
  if (guideButton) {
    const guide = guideData.find(g => g.id === guideButton.dataset.createFromGuide);
    openTicketDialog({category:guide.category, issue:guide.title, symptoms:guide.summary});
    navigate("tickets");
  }
});
$("#ticket-dialog").addEventListener("click", event => {
  if (event.target === $("#ticket-dialog")) closeDialog();
});

renderAll();
