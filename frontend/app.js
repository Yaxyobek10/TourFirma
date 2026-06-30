const state = {
  apiBase: localStorage.getItem('caselink_api_base') || 'http://localhost:5005',
  token: localStorage.getItem('caselink_token') || '',
  user: JSON.parse(localStorage.getItem('caselink_user') || 'null'),
  agency: null,
  packages: [],
  leads: [],
  selectedPackageId: null,
  mode: 'create',
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  apiBase: $('#apiBase'),
  saveApiBase: $('#saveApiBase'),
  authPanel: $('#authPanel'),
  sessionBadge: $('#sessionBadge'),
  agencyBadge: $('#agencyBadge'),
  loginForm: $('#loginForm'),
  registerForm: $('#registerForm'),
  logoutBtn: $('#logoutBtn'),
  refreshBtn: $('#refreshBtn'),
  newPackageBtn: $('#newPackageBtn'),
  resetPackageBtn: $('#resetPackageBtn'),
  packageList: $('#packageList'),
  packageTable: $('#packageTable'),
  packageForm: $('#packageForm'),
  packageFormTitle: $('#packageFormTitle'),
  blockForm: $('#blockForm'),
  blockType: $('#blockType'),
  blockList: $('#blockList'),
  publishBtn: $('#publishBtn'),
  trackingForm: $('#trackingForm'),
  trackingList: $('#trackingList'),
  publicPreview: $('#publicPreview'),
  copyPublicLink: $('#copyPublicLink'),
  selectedSummary: $('#selectedSummary'),
  selectedStatus: $('#selectedStatus'),
  agencyForm: $('#agencyForm'),
  agencyStatus: $('#agencyStatus'),
  launchChecklist: $('#launchChecklist'),
  leadList: $('#leadList'),
  refreshLeadsBtn: $('#refreshLeadsBtn'),
  toast: $('#toast'),
};

const blockTemplates = {
  hotel: {
    data: { title: 'Rixos Premium Belek', url: 'https://example.com/hotel', nights: 5, meal: 'Ultra all inclusive' },
    preview: { title: 'Rixos Premium Belek', rating: 9.2, image: '' },
  },
  flight: {
    data: { from: 'TAS', to: 'AYT', flightNo: 'HY263', departure: '09:30', arrival: '12:40' },
    preview: { title: 'Tashkent to Antalya', subtitle: 'Direct flight' },
  },
  youtube: {
    data: { url: 'https://youtu.be/example' },
    preview: { title: 'Hotel video overview' },
  },
  gallery: {
    data: { images: ['https://example.com/photo-1.jpg', 'https://example.com/photo-2.jpg'] },
    preview: { title: 'Photo gallery', count: 2 },
  },
  map: {
    data: { address: 'Belek, Antalya', lat: 36.862, lng: 31.055 },
    preview: { title: 'Resort location' },
  },
  document: {
    data: { title: 'Tour operator document', url: 'https://example.com/file.pdf' },
    preview: { title: 'Offer PDF' },
  },
  link: {
    data: { title: 'Booking source', url: 'https://example.com' },
    preview: { title: 'External source' },
  },
  included: {
    data: { items: ['Hotel', 'Flight', 'Transfer', 'Insurance'] },
    preview: { title: 'Included services' },
  },
  program: {
    data: { days: [{ day: 1, title: 'Arrival and check-in' }, { day: 2, title: 'Free beach day' }] },
    preview: { title: 'Program by days' },
  },
  note: {
    data: { text: 'Internal booking code #771', visible: false },
    preview: { title: 'Internal note' },
  },
  reviews: {
    data: { items: [{ author: 'Client', text: 'Great hotel and service', rating: 5 }] },
    preview: { title: 'Client reviews' },
  },
};

els.apiBase.value = state.apiBase;
setBlockTemplate('hotel');

function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  return fetch(`${state.apiBase}${path}`, { ...options, headers })
    .then(async (response) => {
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (!response.ok) {
        const message = data?.message || data?.error || `HTTP ${response.status}`;
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      return data;
    });
}

function notify(message, type = 'ok') {
  els.toast.textContent = message;
  els.toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => els.toast.className = 'toast', 2800);
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function parseJsonField(value, fallback = {}) {
  if (!value || !value.trim()) return fallback;
  return JSON.parse(value);
}

function money(value, currency) {
  return `${Number(value || 0).toLocaleString()} ${currency || ''}`.trim();
}

function selectedPackage() {
  return state.packages.find((pkg) => pkg.id === state.selectedPackageId) || null;
}

function setSelectedPackage(id) {
  state.selectedPackageId = id;
  state.mode = id ? 'edit' : 'create';
  renderAll();
}

function newPackageMode() {
  state.selectedPackageId = null;
  state.mode = 'create';
  els.packageForm.reset();
  els.packageForm.currency.value = 'UZS';
  renderAll();
  setView('builder');
}

function publicLink(pkg) {
  return `${state.apiBase}/public/packages/${pkg.slug}`;
}

function trackingClickLink(link) {
  return `${state.apiBase}/public/r/${link.token}/click`;
}

function localPublicPage(pkg) {
  return `${location.href.replace(/index\.html.*$/, '')}public.html?api=${encodeURIComponent(state.apiBase)}&slug=${encodeURIComponent(pkg.slug)}`;
}

function setView(view) {
  $$('.side-link').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  $$('.view').forEach((item) => item.classList.remove('active-view'));
  $(`#${view}View`)?.classList.add('active-view');
  const copy = {
    overview: ['CaseLink MVP', 'Overview', 'Agency, package, click va leadlarni bir joyda boshqaring.'],
    packages: ['Inventory', 'Packages', 'Agent kabinetidagi barcha paketlar.'],
    builder: ['Builder', 'Package builder', 'Bloklardan public turpaket sahifasini yig‘ish.'],
    leads: ['CRM', 'Lead inbox', 'Public sahifadan kelgan arizalar.'],
    settings: ['Workspace', 'Settings', 'Tenant, brand va launch sozlamalari.'],
  };
  $('#viewKicker').textContent = copy[view][0];
  $('#viewTitle').textContent = copy[view][1];
  $('#viewSubtitle').textContent = copy[view][2];
}

function renderAll() {
  renderSession();
  renderMetrics();
  renderPackages();
  renderPackageTable();
  renderBuilder();
  renderPreview();
  renderAgency();
  renderLeads();
  renderChecklist();
}

function renderSession() {
  els.authPanel.classList.toggle('hidden', Boolean(state.token));
  els.sessionBadge.textContent = state.user ? `${state.user.name || state.user.email} · ${state.user.role}` : 'Guest';
  els.sessionBadge.className = `pill ${state.user ? 'blue' : 'neutral'}`;
  els.agencyBadge.textContent = state.agency ? state.agency.name : 'No agency';
  els.agencyBadge.className = `pill ${state.agency ? '' : 'neutral'}`;
}

function renderMetrics() {
  const packages = state.packages;
  const published = packages.filter((pkg) => pkg.status === 'published').length;
  const drafts = packages.filter((pkg) => pkg.status === 'draft').length;
  const newLeads = state.leads.filter((lead) => lead.status === 'new').length;
  $('#metricPackages').textContent = packages.length;
  $('#metricDrafts').textContent = `${drafts} drafts`;
  $('#metricClicks').textContent = packages.reduce((sum, pkg) => sum + Number(pkg.clickCount || 0), 0);
  $('#metricLeads').textContent = state.leads.length || packages.reduce((sum, pkg) => sum + Number(pkg.leadCount || 0), 0);
  $('#metricNewLeads').textContent = `${newLeads} new`;
  $('#metricPublished').textContent = published;
}

function renderPackages() {
  if (!state.packages.length) {
    els.packageList.className = 'package-list empty-state';
    els.packageList.textContent = 'Hali package yo‘q. Builderdan birinchi paketni yarating.';
    renderSelectedSummary();
    return;
  }
  els.packageList.className = 'package-list';
  els.packageList.innerHTML = state.packages.slice(0, 6).map(packageCard).join('');
  renderSelectedSummary();
}

function packageCard(pkg) {
  return `
    <article class="package-card ${pkg.id === state.selectedPackageId ? 'selected' : ''}" data-id="${pkg.id}">
      <div class="row-main">
        <div>
          <strong>${escapeHtml(pkg.title)}</strong>
          <div class="row-meta">
            <span>${escapeHtml(pkg.slug)}</span>
            <span>${money(pkg.price, pkg.currency)}</span>
            <span>${(pkg.blocks || []).length} blocks</span>
            <span>${pkg.clickCount || 0} clicks</span>
            <span>${pkg.leadCount || 0} leads</span>
          </div>
        </div>
        ${statusPill(pkg.status)}
      </div>
      <div class="row-actions">
        <button class="text-button" data-action="open">Open</button>
        <button class="text-button" data-action="builder">Edit</button>
        <button class="text-button" data-action="copy">Copy public API</button>
        <button class="text-button" data-action="page">Open public page</button>
      </div>
    </article>`;
}

function renderPackageTable() {
  if (!state.packages.length) {
    els.packageTable.className = 'data-table empty-state';
    els.packageTable.textContent = 'Package data yo‘q';
    return;
  }
  els.packageTable.className = 'data-table card';
  els.packageTable.innerHTML = `
    <div class="table-row table-head"><span>Package</span><span>Status</span><span>Clicks</span><span>Leads</span><span>Actions</span></div>
    ${state.packages.map((pkg) => `
      <div class="table-row" data-id="${pkg.id}">
        <div><strong>${escapeHtml(pkg.title)}</strong><div class="row-meta"><span>${escapeHtml(pkg.slug)}</span><span>${money(pkg.price, pkg.currency)}</span></div></div>
        <div>${statusPill(pkg.status)}</div>
        <div>${pkg.clickCount || 0}</div>
        <div>${pkg.leadCount || 0}</div>
        <div class="row-actions"><button class="text-button" data-action="builder">Edit</button><button class="text-button" data-action="page">Public</button></div>
      </div>`).join('')}`;
}

function renderSelectedSummary() {
  const pkg = selectedPackage();
  if (!pkg) {
    els.selectedStatus.textContent = 'None';
    els.selectedStatus.className = 'pill neutral';
    els.selectedSummary.className = 'selected-summary empty-state';
    els.selectedSummary.textContent = 'Paket tanlang yoki yangi paket yarating.';
    return;
  }
  els.selectedStatus.outerHTML = statusPill(pkg.status, 'selectedStatus');
  els.selectedStatus = $('#selectedStatus');
  const publicApi = publicLink(pkg);
  els.selectedSummary.className = 'selected-summary';
  els.selectedSummary.innerHTML = `
    <div class="summary-row"><span>Slug</span><strong>${escapeHtml(pkg.slug)}</strong></div>
    <div class="summary-row"><span>Price</span><strong>${money(pkg.price, pkg.currency)}</strong></div>
    <div class="summary-row"><span>Blocks</span><strong>${(pkg.blocks || []).length}</strong></div>
    <div class="summary-row"><span>Tracking links</span><strong>${(pkg.trackingLinks || []).length}</strong></div>
    <div class="summary-row"><span>Public API</span><strong>${escapeHtml(publicApi)}</strong></div>`;
}

function renderBuilder() {
  const pkg = selectedPackage();
  els.packageFormTitle.textContent = pkg ? 'Edit package' : 'New package';
  if (pkg) fillPackageForm(pkg);
  if (!pkg && state.mode === 'create') {
    els.blockList.className = 'block-list empty-state';
    els.blockList.textContent = 'Paket saqlangandan keyin blok qo‘shish mumkin.';
    els.trackingList.className = 'tracking-list empty-state';
    els.trackingList.textContent = 'Paket saqlangandan keyin tracking link yaratiladi.';
    return;
  }
  renderBlocks(pkg);
  renderTracking(pkg);
}

function fillPackageForm(pkg) {
  els.packageForm.title.value = pkg.title || '';
  els.packageForm.description.value = pkg.description || '';
  els.packageForm.price.value = pkg.price || 0;
  els.packageForm.currency.value = pkg.currency || 'UZS';
  els.packageForm.startDate.value = pkg.startDate?.slice(0, 10) || '';
  els.packageForm.endDate.value = pkg.endDate?.slice(0, 10) || '';
  els.packageForm.coverImage.value = pkg.coverImage || '';
  els.packageForm.slug.value = pkg.slug || '';
}

function renderBlocks(pkg) {
  const blocks = [...(pkg?.blocks || [])].sort((a, b) => a.order - b.order);
  if (!blocks.length) {
    els.blockList.className = 'block-list empty-state';
    els.blockList.textContent = 'Hali blok yo‘q. Chapdagi editor orqali hotel, flight, gallery yoki note qo‘shing.';
    return;
  }
  els.blockList.className = 'block-list';
  els.blockList.innerHTML = blocks.map((block) => `
    <article class="block-row">
      <div class="row-main"><strong>${block.order}. ${escapeHtml(block.type)}</strong>${block.visibleToClient ? '<span class="pill">Public</span>' : '<span class="pill neutral">Hidden</span>'}</div>
      <div class="row-meta"><span>${escapeHtml(block.preview?.title || block.data?.title || JSON.stringify(block.preview || block.data || {}))}</span></div>
    </article>`).join('');
}

function renderTracking(pkg) {
  const links = pkg?.trackingLinks || [];
  if (!links.length) {
    els.trackingList.className = 'tracking-list empty-state';
    els.trackingList.textContent = 'Tracking links yo‘q';
    return;
  }
  els.trackingList.className = 'tracking-list';
  els.trackingList.innerHTML = links.map((link) => `
    <article class="tracking-row">
      <div class="row-main"><strong>${escapeHtml(link.source)}</strong><span>${link.clickCount || 0} clicks</span></div>
      <div class="row-meta"><span>${escapeHtml(trackingClickLink(link))}</span></div>
      <div class="row-actions"><button class="text-button" data-copy="${escapeAttr(trackingClickLink(link))}">Copy tracking link</button></div>
    </article>`).join('');
}

function renderPreview() {
  const pkg = selectedPackage();
  if (!pkg) {
    els.publicPreview.className = 'public-preview empty-preview';
    els.publicPreview.textContent = 'Package preview';
    return;
  }
  const hero = pkg.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75';
  const blocks = [...(pkg.blocks || [])].filter((block) => block.visibleToClient).sort((a, b) => a.order - b.order);
  els.publicPreview.className = 'public-preview';
  els.publicPreview.innerHTML = `
    <div class="preview-hero" style="background-image:url('${escapeAttr(hero)}')"></div>
    <div class="preview-body">
      <h3>${escapeHtml(pkg.title)}</h3>
      <p>${escapeHtml(pkg.description || 'Tayyor turpaket taklifi')}</p>
      <div class="row-meta"><span>${money(pkg.price, pkg.currency)}</span><span>${escapeHtml(pkg.slug)}</span></div>
      <div class="preview-cta"><a href="${escapeAttr(localPublicPage(pkg))}" target="_blank">Open page</a><button type="button" data-lead-demo="1">Lead form</button></div>
      ${blocks.map((block) => previewBlock(block)).join('')}
    </div>`;
}

function previewBlock(block) {
  const title = block.preview?.title || block.data?.title || block.type;
  let text = block.data?.note || block.data?.text || block.data?.url || '';
  if (!text && Array.isArray(block.data?.items)) text = block.data.items.join(', ');
  if (!text && Array.isArray(block.data?.days)) text = block.data.days.map((day) => `${day.day}. ${day.title}`).join(' | ');
  if (!text) text = JSON.stringify(block.data || {});
  return `<div class="preview-block"><span>${escapeHtml(block.type)}</span><strong>${escapeHtml(String(title))}</strong><p>${escapeHtml(String(text))}</p></div>`;
}

function renderAgency() {
  if (!state.agency) {
    els.agencyStatus.textContent = 'Not created';
    els.agencyStatus.className = 'pill neutral';
    return;
  }
  els.agencyStatus.textContent = state.agency.plan || 'active';
  els.agencyStatus.className = 'pill';
  ['name', 'slug', 'logoUrl', 'accentColor', 'contactPhone', 'contactTelegram'].forEach((key) => {
    els.agencyForm[key].value = state.agency[key] || '';
  });
}

function renderLeads() {
  if (!state.leads.length) {
    els.leadList.className = 'lead-board empty-state';
    els.leadList.textContent = 'Leadlar hali yo‘q';
    return;
  }
  const columns = [
    ['new', 'New'],
    ['in_progress', 'In progress'],
    ['won', 'Won'],
  ];
  els.leadList.className = 'lead-board';
  els.leadList.innerHTML = columns.map(([status, title]) => {
    const leads = state.leads.filter((lead) => lead.status === status || (status === 'new' && !['in_progress', 'won'].includes(lead.status)));
    return `<section class="lead-column"><h3 class="lead-column-title">${title} · ${leads.length}</h3>${leads.map(leadCard).join('') || '<div class="empty-state">Empty</div>'}</section>`;
  }).join('');
}

function leadCard(lead) {
  return `
    <article class="lead-card" data-id="${lead.id}">
      <div class="row-main"><strong>${escapeHtml(lead.name || lead.phone || lead.email || 'No name')}</strong>${statusPill(lead.status || 'new')}</div>
      <p>${escapeHtml(lead.message || 'No message')}</p>
      <div class="row-meta"><span>${escapeHtml(lead.package?.title || 'Package')}</span><span>${escapeHtml(lead.source || 'direct')}</span><span>${new Date(lead.createdAt).toLocaleDateString()}</span></div>
      <div class="row-actions">
        <button class="text-button" data-lead-status="in_progress">Work</button>
        <button class="text-button" data-lead-status="won">Won</button>
        <button class="text-button" data-lead-status="lost">Lost</button>
      </div>
    </article>`;
}

function renderChecklist() {
  const hasAgency = Boolean(state.agency);
  const hasPackage = state.packages.length > 0;
  const hasPublished = state.packages.some((pkg) => pkg.status === 'published');
  const hasBlocks = state.packages.some((pkg) => (pkg.blocks || []).length > 0);
  const hasTracking = state.packages.some((pkg) => (pkg.trackingLinks || []).length > 0);
  const items = [
    [hasAgency, 'Agency created', 'Brand, slug va kontaktlar tayyor.'],
    [hasPackage, 'First package', 'Base title, price, dates va slug bor.'],
    [hasBlocks, 'Content blocks', 'Hotel, flight yoki note bloklar qo‘shilgan.'],
    [hasPublished, 'Published page', 'Client uchun public link tayyor.'],
    [hasTracking, 'Source tracking', 'Instagram/Telegram/Facebook clicklar ajratiladi.'],
  ];
  els.launchChecklist.innerHTML = items.map(([done, title, text]) => `
    <div class="check-item"><div><strong>${title}</strong><span>${text}</span></div><span class="pill ${done ? '' : 'neutral'}">${done ? 'Done' : 'Todo'}</span></div>`).join('');
}

async function loadAll() {
  if (!state.token) {
    renderAll();
    return;
  }
  await Promise.allSettled([loadAgency(), loadPackages(), loadLeads()]);
  if (!state.selectedPackageId && state.packages[0]) state.selectedPackageId = state.packages[0].id;
  state.mode = state.selectedPackageId ? 'edit' : 'create';
  renderAll();
}

async function loadAgency() {
  try { state.agency = await api('/agencies/me'); } catch { state.agency = null; }
}
async function loadPackages() {
  try { state.packages = await api('/caselink/packages'); } catch { state.packages = []; }
}
async function loadLeads() {
  try { state.leads = await api('/caselink/leads'); } catch { state.leads = []; }
}

function setBlockTemplate(type) {
  const template = blockTemplates[type] || blockTemplates.note;
  if (!els.blockForm) return;
  els.blockForm.data.value = JSON.stringify(template.data, null, 2);
  els.blockForm.preview.value = JSON.stringify(template.preview, null, 2);
}

function statusPill(status, id = '') {
  const cls = status === 'published' || status === 'won' ? '' : status === 'draft' || status === 'new' ? 'warn' : status === 'lost' ? 'danger' : 'blue';
  return `<span ${id ? `id="${id}"` : ''} class="pill ${cls}">${escapeHtml(status || 'unknown')}</span>`;
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
  notify(text);
}

els.saveApiBase.addEventListener('click', () => {
  state.apiBase = els.apiBase.value.trim().replace(/\/$/, '');
  localStorage.setItem('caselink_api_base', state.apiBase);
  notify('API base saved');
  renderAll();
});

$$('.side-link').forEach((item) => item.addEventListener('click', () => setView(item.dataset.view)));
els.newPackageBtn.addEventListener('click', newPackageMode);
els.resetPackageBtn.addEventListener('click', newPackageMode);
els.blockType.addEventListener('change', () => setBlockTemplate(els.blockType.value));
els.refreshBtn.addEventListener('click', loadAll);
els.refreshLeadsBtn.addEventListener('click', async () => { await loadLeads(); renderLeads(); renderMetrics(); });

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(formData(els.loginForm)) });
    state.token = result.access_token;
    state.user = result.user;
    localStorage.setItem('caselink_token', state.token);
    localStorage.setItem('caselink_user', JSON.stringify(state.user));
    notify('Logged in');
    await loadAll();
  } catch (error) { notify(error.message, 'error'); }
});

els.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(formData(els.registerForm)) });
    state.token = result.access_token;
    state.user = result.user;
    localStorage.setItem('caselink_token', state.token);
    localStorage.setItem('caselink_user', JSON.stringify(state.user));
    notify('Account created');
    await loadAll();
  } catch (error) { notify(error.message, 'error'); }
});

els.logoutBtn.addEventListener('click', () => {
  state.token = '';
  state.user = null;
  state.agency = null;
  state.packages = [];
  state.leads = [];
  state.selectedPackageId = null;
  localStorage.removeItem('caselink_token');
  localStorage.removeItem('caselink_user');
  renderAll();
  notify('Logged out');
});

els.agencyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const data = formData(els.agencyForm);
    const path = state.agency ? '/agencies/me' : '/agencies';
    const method = state.agency ? 'PATCH' : 'POST';
    state.agency = await api(path, { method, body: JSON.stringify(data) });
    notify('Agency saved');
    renderAll();
  } catch (error) { notify(error.message, 'error'); }
});

els.packageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const data = formData(els.packageForm);
    data.price = Number(data.price || 0);
    Object.keys(data).forEach((key) => data[key] === '' && delete data[key]);
    const pkg = selectedPackage();
    const path = pkg && state.mode === 'edit' ? `/caselink/packages/${pkg.id}` : '/caselink/packages';
    const method = pkg && state.mode === 'edit' ? 'PATCH' : 'POST';
    const saved = await api(path, { method, body: JSON.stringify(data) });
    await loadPackages();
    setSelectedPackage(saved.id);
    notify('Package saved');
  } catch (error) { notify(error.message, 'error'); }
});

els.blockForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const pkg = selectedPackage();
    if (!pkg) throw new Error('Avval package yarating yoki tanlang');
    const data = formData(els.blockForm);
    data.order = data.order ? Number(data.order) : undefined;
    data.visibleToClient = els.blockForm.visibleToClient.checked;
    data.data = parseJsonField(data.data, {});
    data.preview = parseJsonField(data.preview, {});
    await api(`/caselink/packages/${pkg.id}/blocks`, { method: 'POST', body: JSON.stringify(data) });
    await loadPackages();
    setSelectedPackage(pkg.id);
    notify('Block added');
  } catch (error) { notify(error.message, 'error'); }
});

els.publishBtn.addEventListener('click', async () => {
  try {
    const pkg = selectedPackage();
    if (!pkg) throw new Error('Package tanlang');
    await api(`/caselink/packages/${pkg.id}/publish`, { method: 'PATCH', body: JSON.stringify({}) });
    await loadPackages();
    setSelectedPackage(pkg.id);
    notify('Package published');
  } catch (error) { notify(error.message, 'error'); }
});

els.trackingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const pkg = selectedPackage();
    if (!pkg) throw new Error('Package tanlang');
    await api(`/caselink/packages/${pkg.id}/tracking-links`, { method: 'POST', body: JSON.stringify(formData(els.trackingForm)) });
    await loadPackages();
    setSelectedPackage(pkg.id);
    notify('Tracking link created');
  } catch (error) { notify(error.message, 'error'); }
});

function packageClickHandler(event) {
  const action = event.target.dataset.action;
  const row = event.target.closest('[data-id]');
  if (!row) return;
  const id = Number(row.dataset.id);
  const pkg = state.packages.find((item) => item.id === id);
  if (!pkg) return;
  if (action === 'copy') copyText(publicLink(pkg));
  if (action === 'page') window.open(localPublicPage(pkg), '_blank');
  if (action === 'builder') setView('builder');
  setSelectedPackage(id);
}
els.packageList.addEventListener('click', packageClickHandler);
els.packageTable.addEventListener('click', packageClickHandler);

els.trackingList.addEventListener('click', (event) => {
  const text = event.target.dataset.copy;
  if (text) copyText(text);
});

els.copyPublicLink.addEventListener('click', () => {
  const pkg = selectedPackage();
  if (!pkg) return notify('Package tanlang', 'error');
  copyText(publicLink(pkg));
});

els.publicPreview.addEventListener('click', (event) => {
  if (!event.target.dataset.leadDemo) return;
  const pkg = selectedPackage();
  if (!pkg) return;
  setView('leads');
  notify(`Lead form endpoint: POST ${state.apiBase}/public/packages/${pkg.slug}/leads`);
});

els.leadList.addEventListener('click', async (event) => {
  const status = event.target.dataset.leadStatus;
  const card = event.target.closest('.lead-card');
  if (!status || !card) return;
  try {
    await api(`/caselink/leads/${card.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadLeads();
    renderLeads();
    renderMetrics();
    notify('Lead status updated');
  } catch (error) { notify(error.message, 'error'); }
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function escapeAttr(value) {
  return String(value ?? '').replaceAll("'", '%27').replaceAll('"', '%22').replaceAll(')', '%29');
}

renderAll();
loadAll().catch((error) => notify(error.message, 'error'));
