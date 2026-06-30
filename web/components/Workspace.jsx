'use client';

import { useEffect, useMemo, useState } from 'react';

const defaultApiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5005';

const blockPresets = {
  hotel: { label: 'Hotel', helper: 'Mehmonxona, tunlar va ovqatlanish', fields: ['title', 'url', 'nights', 'meal'] },
  flight: { label: 'Flight', helper: 'Avia yonalish va reys vaqtlari', fields: ['from', 'to', 'flightNo', 'departure', 'arrival'] },
  included: { label: 'Included', helper: 'Narxga kiradigan xizmatlar', fields: ['items'] },
  program: { label: 'Program', helper: 'Kunlar boyicha qisqa dastur', fields: ['items'] },
  gallery: { label: 'Gallery', helper: 'Rasm linklari', fields: ['items'] },
  map: { label: 'Map', helper: 'Manzil va lokatsiya', fields: ['address'] },
  document: { label: 'Document', helper: 'PDF yoki hujjat linki', fields: ['title', 'url'] },
  note: { label: 'Note', helper: 'Ichki izoh yoki mijozga korinadigan eslatma', fields: ['text'] },
};

const viewMeta = {
  overview: ['Dashboard', 'Bugungi sotuv holati va keyingi qadamlar.'],
  packages: ['Packages', 'Mijozlarga yuboriladigan takliflar katalogi.'],
  builder: ['Builder', 'Tour paketni yigish, kontent qoshish va publish qilish.'],
  leads: ['Leads', 'Public sahifalardan kelgan sorovlar.'],
  settings: ['Settings', 'Agentlik profili va workspace sozlamalari.'],
};

function money(value, currency) {
  return `${Number(value || 0).toLocaleString()} ${currency || ''}`.trim();
}

function pill(status) {
  const cls = status === 'published' || status === 'won' ? 'success' : status === 'draft' || status === 'new' ? 'warn' : status === 'lost' ? 'danger' : 'neutral';
  return <span className={`pill ${cls}`}>{status || 'unknown'}</span>;
}

function publicUrl(slug) {
  return slug ? `/p/${slug}` : '';
}

function firstImage(pkg) {
  const gallery = pkg?.blocks?.find((block) => block.type === 'gallery');
  const images = gallery?.data?.images || gallery?.data?.items;
  return Array.isArray(images) && images[0] ? images[0] : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
}

function blockLabel(type) {
  return blockPresets[type]?.label || type;
}

function blockText(block) {
  if (block?.data?.title) return block.data.title;
  if (block?.data?.address) return block.data.address;
  if (block?.data?.text) return block.data.text;
  if (Array.isArray(block?.data?.items)) return block.data.items.join(', ');
  if (Array.isArray(block?.data?.images)) return `${block.data.images.length} images`;
  return JSON.stringify(block?.data || {});
}

export default function Workspace() {
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [packages, setPackages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('overview');
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [packageMode, setPackageMode] = useState('create');
  const [toast, setToast] = useState(null);
  const [blockType, setBlockType] = useState('hotel');

  const selectedPackage = useMemo(() => packages.find((pkg) => pkg.id === selectedPackageId) || null, [packages, selectedPackageId]);

  const metrics = useMemo(() => {
    const published = packages.filter((pkg) => pkg.status === 'published').length;
    const drafts = packages.filter((pkg) => pkg.status === 'draft').length;
    return {
      packages: packages.length,
      published,
      drafts,
      clicks: packages.reduce((sum, pkg) => sum + Number(pkg.clickCount || 0), 0),
      leads: leads.length || packages.reduce((sum, pkg) => sum + Number(pkg.leadCount || 0), 0),
      newLeads: leads.filter((lead) => lead.status === 'new').length,
    };
  }, [packages, leads]);

  const launchSteps = useMemo(() => [
    { key: 'account', title: 'Account', text: 'Workspace account created', done: Boolean(token), action: null },
    { key: 'agency', title: 'Agency profile', text: 'Brand, phone, email and website', done: Boolean(agency), action: () => setView('settings') },
    { key: 'package', title: 'First package', text: 'Create a polished tour offer', done: packages.length > 0, action: () => setView('builder') },
    { key: 'publish', title: 'Public offer', text: 'Share SSR link with a client', done: packages.some((pkg) => pkg.status === 'published'), action: () => setView('packages') },
  ], [agency, packages, token]);

  const readiness = Math.round((launchSteps.filter((step) => step.done).length / launchSteps.length) * 100);

  useEffect(() => {
    const savedApi = localStorage.getItem('caselink_api_base');
    const savedToken = localStorage.getItem('caselink_token');
    if (savedApi) setApiBase(savedApi);
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) loadAll(token);
  }, [token]);

  async function api(path, options = {}, overrideToken = token) {
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(overrideToken ? { Authorization: `Bearer ${overrideToken}` } : {}),
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    const payload = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(payload?.message || payload?.error || 'Request failed');
    return payload;
  }

  function notify(message, type = 'ok') {
    setToast({ message, type });
    window.clearTimeout(window.__caselinkToast);
    window.__caselinkToast = window.setTimeout(() => setToast(null), 2800);
  }

  async function loadAll(nextToken = token) {
    try {
      const [me, agencyData, packageData, leadData] = await Promise.all([
        api('/auth/me', {}, nextToken),
        api('/agencies/me', {}, nextToken).catch(() => null),
        api('/packages', {}, nextToken).catch(() => []),
        api('/leads', {}, nextToken).catch(() => []),
      ]);
      setUser(me?.user || me);
      setAgency(agencyData);
      setPackages(Array.isArray(packageData) ? packageData : []);
      setLeads(Array.isArray(leadData) ? leadData : []);
      if (!agencyData) setView('settings');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function handleAuth(type, form) {
    const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
    const body = type === 'register' ? { ...form, name: form.name } : form;
    const payload = await api(endpoint, { method: 'POST', body: JSON.stringify(body) }, '');
    const nextToken = payload.accessToken || payload.access_token || payload.token;
    if (!nextToken) throw new Error('Token qaytmadi');
    localStorage.setItem('caselink_token', nextToken);
    setToken(nextToken);
    setUser(payload.user || null);
    setView(type === 'register' ? 'settings' : 'overview');
    notify(type === 'login' ? 'Tizimga kirdingiz' : 'Account yaratildi. Agentlik profilini toldiring.');
  }

  function logout() {
    localStorage.removeItem('caselink_token');
    setToken('');
    setUser(null);
    setAgency(null);
    setPackages([]);
    setLeads([]);
    setSelectedPackageId(null);
    setView('overview');
  }

  async function saveAgency(form) {
    const saved = await api('/agencies/me', { method: 'PUT', body: JSON.stringify(form) });
    setAgency(saved);
    notify('Agentlik profili saqlandi');
  }

  async function savePackage(form) {
    if (!agency) {
      notify('Avval agentlik profilini toldiring', 'error');
      setView('settings');
      return;
    }
    const payload = { ...form, price: Number(form.price || 0), pax: Number(form.pax || 2), startsAt: form.startsAt || null, endsAt: form.endsAt || null };
    const path = packageMode === 'edit' && selectedPackage ? `/packages/${selectedPackage.id}` : '/packages';
    const method = packageMode === 'edit' && selectedPackage ? 'PUT' : 'POST';
    const saved = await api(path, { method, body: JSON.stringify(payload) });
    await loadAll();
    setSelectedPackageId(saved.id);
    setPackageMode('edit');
    notify(packageMode === 'edit' ? 'Paket yangilandi' : 'Paket yaratildi');
  }

  async function publishPackage(pkg) {
    const saved = await api(`/packages/${pkg.id}/publish`, { method: 'POST' });
    await loadAll();
    setSelectedPackageId(saved.id);
    notify('Public sahifa tayyor');
  }

  async function saveBlock(form) {
    if (!selectedPackage) {
      notify('Avval paket yarating yoki tanlang', 'error');
      return;
    }
    const data = buildBlockData(blockType, form);
    const preview = buildBlockPreview(blockType, data);
    await api(`/packages/${selectedPackage.id}/blocks`, { method: 'POST', body: JSON.stringify({ type: blockType, data, preview }) });
    await loadAll();
    notify(`${blockLabel(blockType)} bloki qhildi`);
  }

  function prepareCreatePackage() {
    setSelectedPackageId(null);
    setPackageMode('create');
    setView('builder');
  }

  function prepareEditPackage(pkg) {
    setSelectedPackageId(pkg.id);
    setPackageMode('edit');
    setView('builder');
  }

  if (!token) return <AuthPage onAuth={handleAuth} toast={toast} />;

  const [title, subtitle] = viewMeta[view] || viewMeta.overview;

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="brandLogo">CL</div>
          <div><strong>CaseLink</strong><span>Travel workspace</span></div>
        </div>
        <nav className="sideNav">
          {[
            ['overview', 'Dashboard'],
            ['packages', 'Packages'],
            ['builder', 'Builder'],
            ['leads', 'Leads'],
            ['settings', 'Settings'],
          ].map(([key, label]) => <button key={key} className={`sideLink ${view === key ? 'active' : ''}`} onClick={() => setView(key)}>{label}</button>)}
        </nav>
        <div className="sideWorkspace">
          <span>Workspace</span>
          <strong>{agency?.name || 'Setup required'}</strong>
          <div className="miniProgress"><i style={{ width: `${readiness}%` }} /></div>
          <small>{readiness}% ready</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="overline">CaseLink workspace</p>
            <h1>{title}</h1>
            <p className="subtle">{subtitle}</p>
          </div>
          <div className="sessionArea">
            <span className="pill neutral">{agency?.name || 'Agency not set'}</span>
            <span className="pill success">{user?.name || user?.email || 'Agent'}</span>
            <button className="primaryButton" onClick={prepareCreatePackage}>New package</button>
            <button className="textButton" onClick={logout}>Logout</button>
          </div>
        </header>

        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

        {view === 'overview' && <Dashboard metrics={metrics} packages={packages} leads={leads} launchSteps={launchSteps} readiness={readiness} agency={agency} setView={setView} onCreate={prepareCreatePackage} onEdit={prepareEditPackage} onPublish={publishPackage} />}
        {view === 'packages' && <PackageCatalog packages={packages} onCreate={prepareCreatePackage} onEdit={prepareEditPackage} onPublish={publishPackage} />}
        {view === 'builder' && <Builder agency={agency} selectedPackage={selectedPackage} packageMode={packageMode} onPackageSubmit={savePackage} blockType={blockType} setBlockType={setBlockType} onBlockSubmit={saveBlock} onSetup={() => setView('settings')} />}
        {view === 'leads' && <LeadsView leads={leads} packages={packages} />}
        {view === 'settings' && <Settings agency={agency} onSubmit={saveAgency} launchSteps={launchSteps} readiness={readiness} />}
      </main>
    </div>
  );
}

function AuthPage({ onAuth, toast }) {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await onAuth(tab, data);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authHero">
        <div className="authBrand"><div className="brandLogo">CL</div><strong>CaseLink</strong></div>
        <div className="authCopy">
          <p className="overline">Travel agency SaaS</p>
          <h1>Tour paketdan leadgacha bitta professional workspace.</h1>
          <p>Agent taklifni yidi, mijoz public sahifada kadi, leadlar esa CRMga tushadi.</p>
        </div>
        <div className="authProofGrid">
          <span>SSR public offers</span><span>Package builder</span><span>Lead inbox</span>
        </div>
      </section>
      <section className="authPanel">
        <div className="authTabs"><button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')} type="button">Login</button><button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')} type="button">Register</button></div>
        <div className="panelTitle"><h2>{tab === 'login' ? 'Workspacega kirish' : 'Workspace yaratish'}</h2><p>{tab === 'login' ? 'Email va parol orqali davom eting.' : 'Role avtomatik owner badi. Team keyin taklif qilinadi.'}</p></div>
        {(error || toast?.type === 'error') && <div className="formError">{error || toast.message}</div>}
        <form className="formStack" onSubmit={submit}>
          {tab === 'register' && <label>Full name<input name="name" placeholder="Ali Valiyev" required /></label>}
          <label>Email<input name="email" type="email" placeholder="agent@agency.uz" required /></label>
          {tab === 'register' && <label>Phone<input name="phone" placeholder="+998 90 123 45 67" /></label>}
          <label>Password<input name="password" type="password" placeholder="Minimum 6 belgi" required /></label>
          <button className="primaryButton" disabled={loading}>{loading ? 'Processing...' : tab === 'login' ? 'Login' : 'Create workspace'}</button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ metrics, packages, leads, launchSteps, readiness, agency, setView, onCreate, onEdit, onPublish }) {
  const nextStep = launchSteps.find((step) => !step.done);
  return <div className="dashboardGrid">
    <section className="heroPanel">
      <div><p className="overline">Launch status</p><h2>{agency ? 'Workspace ishga tayyorlanmoqda' : 'Avval agentlik profilini yakunlang'}</h2><p>{nextStep ? nextStep.text : 'Barcha asosiy qadamlar bajarilgan. Endi real mijozlar bilan ishlash mumkin.'}</p></div>
      <div className="readinessDial"><strong>{readiness}%</strong><span>ready</span></div>
    </section>
    <MetricGrid metrics={metrics} />
    <LaunchSteps steps={launchSteps} />
    <section className="commandGrid">
      <button className="commandCard primary" disabled={!agency} onClick={onCreate}><span>Create</span><strong>New package</strong><small>{agency ? 'Mijozga yuboriladigan offer yarating' : 'Avval agency profilini toldiring'}</small></button>
      <button className="commandCard" onClick={() => setView('leads')}><span>CRM</span><strong>Review leads</strong><small>Yangi sorovlar va kontaktlar</small></button>
      <button className="commandCard" onClick={() => setView('settings')}><span>Setup</span><strong>Agency profile</strong><small>Brend va aloqa malumotlari</small></button>
    </section>
    <div className="dashboardColumns">
      <PackageList packages={packages.slice(0, 4)} onEdit={onEdit} onPublish={onPublish} />
      <RecentLeads leads={leads.slice(0, 5)} packages={packages} />
    </div>
  </div>;
}

function MetricGrid({ metrics }) {
  const data = [
    ['Packages', metrics.packages, `${metrics.published} published`],
    ['Clicks', metrics.clicks, 'Public visits'],
    ['Leads', metrics.leads, `${metrics.newLeads} new`],
    ['Drafts', metrics.drafts, 'Need publish'],
  ];
  return <section className="metricGrid">{data.map(([label, value, helper]) => <div className="metricCard" key={label}><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>)}</section>;
}

function LaunchSteps({ steps }) {
  return <section className="launchStrip">{steps.map((step, index) => <button key={step.key} className={step.done ? 'done' : ''} onClick={step.action || undefined}><span>{index + 1}</span><div><strong>{step.title}</strong><small>{step.text}</small></div></button>)}</section>;
}

function PackageList({ packages, onEdit, onPublish }) {
  return <section className="panel"><PanelTitle title="Recent packages" text="Oxirgi tayyorlangan takliflar" />{packages.length ? <div className="listRows">{packages.map((pkg) => <PackageRow key={pkg.id} pkg={pkg} onEdit={onEdit} onPublish={onPublish} />)}</div> : <EmptyState title="Hali package y" text="Birinchi taklifni builder orqali yarating." />}</section>;
}

function RecentLeads({ leads, packages }) {
  return <section className="panel"><PanelTitle title="Recent leads" text="Public sahifadan kelgan sorovlar" />{leads.length ? <div className="listRows">{leads.map((lead) => <div className="rowItem" key={lead.id}><div><strong>{lead.clientName || lead.phone || 'Client'}</strong><p>{packages.find((pkg) => pkg.id === lead.packageId)?.title || lead.source || 'Public page'}</p></div>{pill(lead.status)}</div>)}</div> : <EmptyState title="Lead hali yoq" text="Public link yuborilganda leadlar shu yerda korinadi." />}</section>;
}

function PackageCatalog({ packages, onCreate, onEdit, onPublish }) {
  return <section className="panel"><div className="panelHead"><PanelTitle title="Package catalog" text="Barcha takliflar, status va performance" /><button className="primaryButton" onClick={onCreate}>New package</button></div>{packages.length ? <div className="packageCards">{packages.map((pkg) => <PackageRow key={pkg.id} pkg={pkg} onEdit={onEdit} onPublish={onPublish} />)}</div> : <EmptyState title="Catalog bh" text="Yangi tour paket yaratib, mijozga public link yuboring." />}</section>;
}

function PackageRow({ pkg, onEdit, onPublish }) {
  return <article className="packageRow"><div className="packageThumb" style={{ backgroundImage: `url(${firstImage(pkg)})` }} /><div><strong>{pkg.title}</strong><p>{pkg.destination || 'Destination'} - {money(pkg.price, pkg.currency)}</p><small>{pkg.clickCount || 0} clicks - {pkg.leadCount || 0} leads</small></div><div className="rowActions">{pill(pkg.status)}<button className="textButton" onClick={() => onEdit(pkg)}>Edit</button>{pkg.status !== 'published' && <button className="smallButton" onClick={() => onPublish(pkg)}>Publish</button>}</div></article>;
}

function Builder({ agency, selectedPackage, packageMode, onPackageSubmit, blockType, setBlockType, onBlockSubmit, onSetup }) {
  return <div className="builderLayout">
    {!agency && <SetupPanel onSetup={onSetup} />}
    <section className="panel builderForm"><PanelTitle title={packageMode === 'edit' ? 'Edit package' : 'Package details'} text="Mijozga korinadigan asosiy malumotlar" />
      <PackageForm selectedPackage={selectedPackage} packageMode={packageMode} onSubmit={onPackageSubmit} />
    </section>
    <section className="panel blockPanel"><PanelTitle title="Content blocks" text="Raw JSON emas, oddiy bloklar orqali offer ying" />
      <BlockComposer selectedPackage={selectedPackage} blockType={blockType} setBlockType={setBlockType} onSubmit={onBlockSubmit} />
    </section>
    <aside className="previewColumn"><SelectedSummary selectedPackage={selectedPackage} /><PublicPreview selectedPackage={selectedPackage} /><BlockList selectedPackage={selectedPackage} /></aside>
  </div>;
}

function SetupPanel({ onSetup }) {
  return <section className="setupPanel"><div><span>Setup required</span><strong>Agentlik profilisiz package yaratib bolmaydi</strong><p>Brend, telefon va email public sahifalarda chiqadi.</p></div><button className="primaryButton" onClick={onSetup}>Complete setup</button></section>;
}

function PackageForm({ selectedPackage, packageMode, onSubmit }) {
  const defaults = selectedPackage || { title: '', destination: '', description: '', price: '', currency: 'USD', pax: 2, startsAt: '', endsAt: '' };
  function submit(event) { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget))); }
  return <form className="formGrid" onSubmit={submit}><label className="wide">Package title<input name="title" defaultValue={defaults.title} placeholder="Antalya family vacation" required /></label><label>Destination<input name="destination" defaultValue={defaults.destination || ''} placeholder="Antalya, Turkey" /></label><label>Currency<input name="currency" defaultValue={defaults.currency || 'USD'} /></label><label>Price<input name="price" type="number" defaultValue={defaults.price || ''} placeholder="1850" /></label><label>Pax<input name="pax" type="number" defaultValue={defaults.pax || 2} /></label><label>Start date<input name="startsAt" type="date" defaultValue={defaults.startsAt ? String(defaults.startsAt).slice(0, 10) : ''} /></label><label>End date<input name="endsAt" type="date" defaultValue={defaults.endsAt ? String(defaults.endsAt).slice(0, 10) : ''} /></label><label className="wide">Description<textarea name="description" defaultValue={defaults.description || ''} placeholder="Hotel, flight, transfer and booking notes." /></label><button className="primaryButton wide">{packageMode === 'edit' ? 'Save package' : 'Create package'}</button></form>;
}

function BlockComposer({ selectedPackage, blockType, setBlockType, onSubmit }) {
  const preset = blockPresets[blockType];
  function submit(event) { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset(); }
  return <form className="blockComposer" onSubmit={submit}><div className="blockTypeGrid">{Object.entries(blockPresets).map(([key, item]) => <button key={key} type="button" className={blockType === key ? 'active' : ''} onClick={() => setBlockType(key)}><strong>{item.label}</strong><span>{item.helper}</span></button>)}</div><div className="dynamicFields">{preset.fields.includes('title') && <label>Title<input name="title" placeholder="Rixos Premium Belek" /></label>}{preset.fields.includes('url') && <label>Link<input name="url" placeholder="https://example.com" /></label>}{preset.fields.includes('nights') && <label>Nights<input name="nights" type="number" placeholder="5" /></label>}{preset.fields.includes('meal') && <label>Meal<input name="meal" placeholder="Ultra all inclusive" /></label>}{preset.fields.includes('from') && <label>From<input name="from" placeholder="TAS" /></label>}{preset.fields.includes('to') && <label>To<input name="to" placeholder="AYT" /></label>}{preset.fields.includes('flightNo') && <label>Flight no<input name="flightNo" placeholder="HY263" /></label>}{preset.fields.includes('departure') && <label>Departure<input name="departure" placeholder="09:30" /></label>}{preset.fields.includes('arrival') && <label>Arrival<input name="arrival" placeholder="12:40" /></label>}{preset.fields.includes('address') && <label className="wide">Address<input name="address" placeholder="Belek, Antalya" /></label>}{preset.fields.includes('text') && <label className="wide">Text<textarea name="text" placeholder="Important note for this offer" /></label>}{preset.fields.includes('items') && <label className="wide">Items<textarea name="items" placeholder="Hotel\nFlight\nTransfer\nInsurance" /></label>}</div><button className="secondaryButton" disabled={!selectedPackage}>Add {preset.label} block</button></form>;
}

function buildBlockData(type, form) {
  const items = String(form.items || '').split('\n').map((item) => item.trim()).filter(Boolean);
  if (type === 'gallery') return { images: items };
  if (type === 'program') return { days: items.map((title, index) => ({ day: index + 1, title })) };
  if (type === 'included') return { items };
  if (type === 'hotel') return { title: form.title || 'Hotel', url: form.url || '', nights: Number(form.nights || 0), meal: form.meal || '' };
  if (type === 'flight') return { from: form.from || '', to: form.to || '', flightNo: form.flightNo || '', departure: form.departure || '', arrival: form.arrival || '' };
  if (type === 'map') return { address: form.address || '' };
  if (type === 'note') return { text: form.text || '' };
  return { title: form.title || blockLabel(type), url: form.url || '' };
}

function buildBlockPreview(type, data) {
  return { title: data.title || data.address || blockLabel(type), count: data.images?.length || data.items?.length || data.days?.length || undefined };
}

function SelectedSummary({ selectedPackage }) {
  return <section className="panel compact"><PanelTitle title="Selected package" text="Hozir tahrirlanayotgan offer" />{selectedPackage ? <div className="summaryBox"><strong>{selectedPackage.title}</strong><span>{selectedPackage.destination || 'Destination'}</span><span>{selectedPackage.blocks?.length || 0} blocks - {publicUrl(selectedPackage.slug) || 'not published'}</span></div> : <EmptyState title="Paket tanlanmagan" text="Avval package yarating yoki catalogdan edit qiling." />}</section>;
}

function PublicPreview({ selectedPackage }) {
  return <section className="phonePreview"><div className="phoneChrome" />{selectedPackage ? <><div className="phoneHero" style={{ backgroundImage: `url(${firstImage(selectedPackage)})` }} /><div className="phoneBody"><span>{selectedPackage.destination || 'Travel offer'}</span><h3>{selectedPackage.title}</h3><p>{selectedPackage.description || 'Tour package description'}</p><strong>{money(selectedPackage.price, selectedPackage.currency)}</strong><a href={publicUrl(selectedPackage.slug)} target="_blank">Open public page</a></div></> : <div className="phoneEmpty"><strong>Preview</strong><p>Package yaratilgandan keyin public kinish chiqadi.</p></div>}</section>;
}

function BlockList({ selectedPackage }) {
  const blocks = selectedPackage?.blocks || [];
  return <section className="panel compact"><PanelTitle title="Blocks" text="Public sahifa kontenti" />{blocks.length ? <div className="blockList">{blocks.map((block) => <div className="blockRow" key={block.id}><span>{blockLabel(block.type)}</span><strong>{blockText(block)}</strong></div>)}</div> : <EmptyState title="Blok y" text="Hotel, flight yoki gallery blokini qhing." />}</section>;
}

function LeadsView({ leads, packages }) {
  const statuses = ['new', 'contacted', 'won'];
  return <div className="leadBoard">{statuses.map((status) => <section className="panel" key={status}><PanelTitle title={status} text={`${leads.filter((lead) => lead.status === status).length} leads`} />{leads.filter((lead) => lead.status === status).map((lead) => <article className="leadCard" key={lead.id}><strong>{lead.clientName || lead.phone || 'Client'}</strong><p>{packages.find((pkg) => pkg.id === lead.packageId)?.title || lead.source || 'Public offer'}</p><small>{lead.phone || lead.email || '-'}</small></article>)}{!leads.filter((lead) => lead.status === status).length && <EmptyState title="Bh" text="Bu statusda lead y." />}</section>)}</div>;
}

function Settings({ agency, onSubmit, launchSteps, readiness }) {
  return <div className="settingsGrid"><section className="panel"><PanelTitle title="Agency profile" text="Public takliflarda korinadigan brend va aloqa malumotlari" /><AgencyForm agency={agency} onSubmit={onSubmit} /></section><aside className="settingsSide"><section className="panel compact"><PanelTitle title="Workspace readiness" text={`${readiness}% complete`} /><LaunchSteps steps={launchSteps} /></section><section className="panel compact"><PanelTitle title="Team access" text="Keyingi bosqich" /><div className="featureNote"><strong>Manager va agentlar invite orqali qoshiladi.</strong><p>Role tanlash registerda bolmaydi. Owner keyin team memberlarga role beradi.</p></div></section></aside></div>;
}

function AgencyForm({ agency, onSubmit }) {
  function submit(event) { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget))); }
  return <form className="formGrid" onSubmit={submit}><label className="wide">Agency name<input name="name" defaultValue={agency?.name || ''} placeholder="Case Travel" required /></label><label>Phone<input name="phone" defaultValue={agency?.phone || ''} placeholder="+998 90 123 45 67" /></label><label>Email<input name="email" type="email" defaultValue={agency?.email || ''} placeholder="sales@agency.uz" /></label><label className="wide">Legal name<input name="legalName" defaultValue={agency?.legalName || ''} placeholder="Case Travel LLC" /></label><label className="wide">Website<input name="website" defaultValue={agency?.website || ''} placeholder="https://agency.uz" /></label><button className="primaryButton wide">Save agency</button></form>;
}

function PanelTitle({ title, text }) {
  return <div className="panelTitle"><div><h2>{title}</h2>{text && <p>{text}</p>}</div></div>;
}

function EmptyState({ title, text }) {
  return <div className="emptyState"><strong>{title}</strong><p>{text}</p></div>;
}