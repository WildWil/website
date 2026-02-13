async function loadJSON(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function setActiveNav(){
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a=>{
    const href = a.getAttribute("href");
    if(href === here) a.classList.add("active");
  });
}

function money(n){
  try{
    return new Intl.NumberFormat("en-US", { style:"currency", currency:"USD" }).format(n);
  }catch{
    return `$${n}`;
  }
}

function inventoryCard(item){
  const img = (item.photos && item.photos[0]) ? item.photos[0] : "";
  const status = (item.status || "Available").trim();
  const statusBadge = status.toLowerCase();

  return `
    <div class="card item">
      ${img ? `<img class="img" src="${img}" alt="${item.title || "Item"}">` : `<div class="img"></div>`}
      <div class="badges">
        <span class="badge">${item.category || "Item"}</span>
        <span class="badge">${status}</span>
      </div>
      <div class="price">${money(item.price || 0)}</div>
      <h2 style="margin:10px 0 0; font-size:16px;">${item.title || ""}</h2>
      <div class="meta">${item.summary || ""}</div>
      <div class="hr"></div>
      <div class="small">
        <strong>Specs:</strong> ${item.specs || "—"}<br>
        <strong>Condition:</strong> ${item.condition || "—"}<br>
        <strong>Notes:</strong> ${item.notes || "—"}
      </div>
      <div class="btns" style="margin-top:12px;">
        <a class="btn" href="sms:8439014691?&body=Hey%20Will!%20I%27m%20interested%20in:%20${encodeURIComponent(item.title || "this item")}%20(${encodeURIComponent(money(item.price || 0))}).">Text about this</a>
        <a class="btn secondary" href="mailto:warwil533@gmail.com?subject=${encodeURIComponent("Refurbished Tech - " + (item.title||""))}">Email</a>
      </div>
      <div class="small" style="margin-top:10px;"><strong>Cash only.</strong> Mount Pleasant, SC (Dunes West and nearby).</div>
    </div>
  `;
}

async function renderInventory(){
  const mount = document.getElementById("inventory");
  if(!mount) return;

  const data = await loadJSON("/content/inventory.json");
  const items = Array.isArray(data.items) ? data.items : [];

  const categorySel = document.getElementById("category");
  const statusSel = document.getElementById("status");
  const searchBox = document.getElementById("search");

  function apply(){
    const cat = categorySel.value;
    const st = statusSel.value;
    const q = (searchBox.value || "").toLowerCase().trim();

    const filtered = items.filter(it=>{
      const okCat = (cat === "All") || ((it.category || "") === cat);
      const okSt = (st === "All") || ((it.status || "Available") === st);
      const hay = `${it.title||""} ${it.summary||""} ${it.specs||""} ${it.notes||""}`.toLowerCase();
      const okQ = !q || hay.includes(q);
      return okCat && okSt && okQ;
    });

    mount.innerHTML = filtered.length
      ? filtered.map(inventoryCard).join("")
      : `<div class="card"><h2>No items match that filter.</h2><p>Text me what you're looking for and I’ll tell you what I have.</p><div class="btns"><a class="btn" href="sms:8439014691">Text me</a><a class="btn secondary" href="mailto:warwil533@gmail.com">Email</a></div></div>`;
  }

  categorySel.addEventListener("change", apply);
  statusSel.addEventListener("change", apply);
  searchBox.addEventListener("input", apply);

  apply();
}

async function loadSiteContent(){
  try{
    const site = await loadJSON("/content/site.json");
    const el = (id) => document.getElementById(id);

    if(el("siteTagline")) el("siteTagline").textContent = site.tagline || "";
    if(el("siteIntro")) el("siteIntro").textContent = site.intro || "";
    if(el("featuredLine")) el("featuredLine").textContent = site.featuredLine || "";
  }catch(e){
    // safe to ignore
  }
}

setActiveNav();
loadSiteContent();
renderInventory();
