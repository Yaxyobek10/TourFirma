const params = new URLSearchParams(location.search);
const apiBase = params.get('api') || 'http://localhost:5005';
const slug = params.get('slug');
const source = params.get('source') || 'direct';
const root = document.querySelector('#packagePage');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(value, currency) {
  return `${Number(value || 0).toLocaleString()} ${currency || ''}`.trim();
}

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`);
  return data;
}

function blockText(block) {
  if (block.data?.note) return block.data.note;
  if (block.data?.text) return block.data.text;
  if (block.data?.url) return block.data.url;
  if (Array.isArray(block.data?.items)) return block.data.items.join(', ');
  if (Array.isArray(block.data?.days)) return block.data.days.map((day) => `${day.day}. ${day.title}`).join(' | ');
  return JSON.stringify(block.data || {});
}

async function load() {
  if (!slug) throw new Error('Slug is missing');
  const pkg = await api(`/public/packages/${encodeURIComponent(slug)}`);
  api(`/public/packages/${encodeURIComponent(slug)}/click?source=${encodeURIComponent(source)}`).catch(() => {});
  render(pkg);
}

function render(pkg) {
  const hero = pkg.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=78';
  root.className = 'package-page';
  root.innerHTML = `
    <section class="hero" style="background-image:url('${hero.replaceAll("'", '%27')}')">
      <div class="hero-content">
        <span class="badge">${escapeHtml(pkg.agency?.name || 'CaseLink offer')}</span>
        <h1>${escapeHtml(pkg.title)}</h1>
        <p>${escapeHtml(pkg.description || 'Tayyor turpaket taklifi')}</p>
      </div>
    </section>
    <section class="content">
      <div class="block-list">
        ${(pkg.blocks || []).map((block) => `
          <article class="block">
            <span>${escapeHtml(block.type)}</span>
            <h2>${escapeHtml(block.preview?.title || block.data?.title || block.type)}</h2>
            <p>${escapeHtml(blockText(block))}</p>
          </article>`).join('')}
      </div>
      <aside class="sidebar-card">
        <div>
          <span class="badge" style="background:#e8f6f3;color:#0f766e">Price</span>
          <div class="price">${money(pkg.price, pkg.currency)}</div>
        </div>
        <a class="action" href="https://t.me/${escapeHtml((pkg.agency?.contactTelegram || '').replace('@', ''))}" target="_blank">Telegram</a>
        <a class="action secondary" href="tel:${escapeHtml(pkg.agency?.contactPhone || '')}">Call</a>
        <form class="lead-form" id="leadForm">
          <input name="name" placeholder="Ismingiz" />
          <input name="phone" placeholder="Telefon" />
          <textarea name="message" placeholder="Savolingiz"></textarea>
          <button type="submit">Send request</button>
          <div id="toast" class="toast"></div>
        </form>
      </aside>
    </section>`;

  document.querySelector('#leadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.source = source;
    try {
      await api(`/public/packages/${encodeURIComponent(pkg.slug)}/leads`, { method: 'POST', body: JSON.stringify(payload) });
      document.querySelector('#toast').textContent = 'Request sent';
      event.currentTarget.reset();
    } catch (error) {
      document.querySelector('#toast').textContent = error.message;
    }
  });
}

load().catch((error) => {
  root.className = 'package-page loading';
  root.textContent = error.message;
});
