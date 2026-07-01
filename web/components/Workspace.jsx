'use client';

import { useEffect, useMemo, useState } from 'react';

const defaultApiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5005';

const languages = [['uz','UZ'],['ru','RU'],['en','EN']];
const ui = {
  uz: { dashboardTitle:'Dashboard', dashboardSubtitle:'Bugungi sotuv holati va keyingi qadamlar.', packagesTitle:'Paketlar', packagesSubtitle:'Mijozlarga yuboriladigan takliflar katalogi.', builderTitle:'Builder', builderSubtitle:'Tour paketni yigish, kontent qoshish va publish qilish.', leadsTitle:'Lidlar', leadsSubtitle:'Public sahifalardan kelgan sorovlar.', settingsTitle:'Sozlamalar', settingsSubtitle:'Agentlik profili va workspace sozlamalari.', workspace:'Workspace', setupRequired:'Sozlash kerak', ready:'tayyor', agencyNotSet:'Agentlik sozlanmagan', agent:'Agent', newPackage:'Yangi paket', logout:'Chiqish', login:'Kirish', register:'Royxatdan otish', loginTitle:'Workspacega kirish', registerTitle:'Workspace yaratish', loginHelp:'Email va parol orqali davom eting.', registerHelp:'Role avtomatik owner boladi. Team keyin taklif qilinadi.', authTitle:'Tour paketdan leadgacha bitta professional workspace.', authText:'Agent taklifni yigadi, mijoz public sahifada koradi, leadlar esa CRMga tushadi.', fullName:'Toliq ism', phone:'Telefon', password:'Parol', passwordHint:'Minimum 6 belgi', processing:'Jarayonda...', createWorkspace:'Workspace yaratish', account:'Account', accountText:'Workspace account yaratildi', agencyProfile:'Agentlik profili', agencyText:'Brend, telefon, email va website', firstPackage:'Birinchi paket', firstPackageText:'Professional tour offer yarating', publicOffer:'Public offer', publicOfferText:'SSR linkni mijozga yuboring', launchStatus:'Launch holati', finishAgency:'Avval agentlik profilini yakunlang', workspacePreparing:'Workspace ishga tayyorlanmoqda', allDone:'Barcha asosiy qadamlar bajarilgan. Endi real mijozlar bilan ishlash mumkin.', create:'Yaratish', reviewLeads:'Leadlarni korish', setup:'Sozlash', recentPackages:'Oxirgi paketlar', recentLeads:'Oxirgi leadlar', catalog:'Paket katalogi', packageDetails:'Paket malumotlari', editPackage:'Paketni tahrirlash', contentBlocks:'Kontent bloklari', selectedPackage:'Tanlangan paket', blocks:'Bloklar', agencyFormTitle:'Agentlik profili', readiness:'Workspace tayyorgarligi', teamAccess:'Team access', saveAgency:'Agentlikni saqlash', title:'Sarlavha', link:'Link', nights:'Tunlar', meal:'Ovqatlanish', from:'Qayerdan', to:'Qayerga', flightNo:'Reys raqami', departure:'Uchish', arrival:'Yetib kelish', address:'Manzil', text:'Matn', items:'Elementlar', edit:'Tahrirlash', publish:'Publish', booked:'Bron qilindi', lost:'Yoqotildi', inProgress:'Jarayonda', empty:'Bosh', noBlock:'Blok yoq', noBlockText:'Hotel, flight yoki gallery blokini qoshing.', blockAdded:'bloki qoshildi', requestFailed:'Sorov bajarilmadi', new:'yangi', clicks:'Bosishlar', drafts:'Draftlar', publicVisits:'Public visits', needPublish:'Publish kerak', recentPackagesText:'Oxirgi tayyorlangan takliflar', recentLeadsText:'Public sahifadan kelgan sorovlar', catalogText:'Barcha takliflar, status va performance', packageDetailsText:'Mijozga korinadigan asosiy malumotlar', noPackage:'Hali package yoq', noPackageText:'Birinchi taklifni builder orqali yarating.', emptyCatalog:'Catalog bosh', emptyCatalogText:'Yangi tour paket yaratib, mijozga public link yuboring.', leadEmpty:'Lead hali yoq', leadEmptyText:'Public link yuborilganda leadlar shu yerda korinadi.', destination:'Yonalish', savePackage:'Paketni saqlash', createPackage:'Paket yaratish', setupNeeded:'Sozlash kerak', noAgencyPackage:'Agentlik profilisiz package yaratib bolmaydi', brandPublic:'Brend, telefon va email public sahifalarda chiqadi.', completeSetup:'Setupni yakunlash', selectedPackageText:'Hozir tahrirlanayotgan offer', notPublished:'publish qilinmagan', noSelected:'Paket tanlanmagan', noSelectedText:'Avval package yarating yoki catalogdan edit qiling.', openPublic:'Public sahifani ochish', preview:'Preview', previewText:'Package yaratilgandan keyin public korinish chiqadi.', emptyStatusText:'Bu statusda lead yoq.', client:'Mijoz', booking:'Bron', contacted:'Boglanildi', agencyFormText:'Public takliflarda korinadigan brend va aloqa malumotlari', complete:'complete', nextStage:'Keyingi bosqich', inviteTeam:'Manager va agentlar invite orqali qoshiladi.', roleNote:'Role tanlash registerda bolmaydi. Owner keyin team memberlarga role beradi.', agencyName:'Agentlik nomi', legalName:'Yuridik nom', website:'Website' },
  ru: { dashboardTitle:'Панель', dashboardSubtitle:'Продажи за сегодня и следующие шаги.', packagesTitle:'Пакеты', packagesSubtitle:'Каталог предложений для клиентов.', builderTitle:'Конструктор', builderSubtitle:'Сборка тура, контента и публикация.', leadsTitle:'Лиды', leadsSubtitle:'Заявки с публичных страниц.', settingsTitle:'Настройки', settingsSubtitle:'Профиль агентства и настройки workspace.', workspace:'Workspace', setupRequired:'Нужно настроить', ready:'готово', agencyNotSet:'Агентство не настроено', agent:'Агент', newPackage:'Новый пакет', logout:'Выйти', login:'Войти', register:'Регистрация', loginTitle:'Войти в workspace', registerTitle:'Создать workspace', loginHelp:'Продолжите через email и пароль.', registerHelp:'Роль автоматически будет owner. Команда приглашается позже.', authTitle:'Профессиональный workspace от tour package до lead.', authText:'Агент собирает offer, клиент смотрит public страницу, лиды попадают в CRM.', fullName:'Полное имя', phone:'Телефон', password:'Пароль', passwordHint:'Минимум 6 символов', processing:'Обработка...', createWorkspace:'Создать workspace', account:'Аккаунт', accountText:'Workspace аккаунт создан', agencyProfile:'Профиль агентства', agencyText:'Бренд, телефон, email и сайт', firstPackage:'Первый пакет', firstPackageText:'Создайте профессиональный tour offer', publicOffer:'Публичное предложение', publicOfferText:'Отправьте SSR ссылку клиенту', launchStatus:'Статус запуска', finishAgency:'Сначала завершите профиль агентства', workspacePreparing:'Workspace готовится к запуску', allDone:'Все основные шаги выполнены. Можно работать с реальными клиентами.', create:'Создать', reviewLeads:'Просмотреть лиды', setup:'Настройка', recentPackages:'Последние пакеты', recentLeads:'Последние лиды', catalog:'Каталог пакетов', packageDetails:'Данные пакета', editPackage:'Редактировать пакет', contentBlocks:'Блоки контента', selectedPackage:'Выбранный пакет', blocks:'Блоки', agencyFormTitle:'Профиль агентства', readiness:'Готовность workspace', teamAccess:'Доступ команды', saveAgency:'Сохранить агентство', title:'Заголовок', link:'Ссылка', nights:'Ночи', meal:'Питание', from:'Откуда', to:'Куда', flightNo:'Номер рейса', departure:'Вылет', arrival:'Прилет', address:'Адрес', text:'Текст', items:'Элементы', edit:'Изменить', publish:'Опубликовать', booked:'Забронировано', lost:'Потеряно', inProgress:'В работе', empty:'Пусто', noBlock:'Блоков нет', noBlockText:'Добавьте hotel, flight или gallery блок.', blockAdded:'блок добавлен', requestFailed:'Запрос не выполнен', new:'новые', clicks:'Клики', drafts:'Черновики', publicVisits:'Public визиты', needPublish:'Нужно опубликовать', recentPackagesText:'Недавно подготовленные предложения', recentLeadsText:'Заявки с public страниц', catalogText:'Все предложения, статус и performance', packageDetailsText:'Основная информация для клиента', noPackage:'Пакетов пока нет', noPackageText:'Создайте первое предложение через builder.', emptyCatalog:'Каталог пуст', emptyCatalogText:'Создайте tour package и отправьте public ссылку клиенту.', leadEmpty:'Лидов пока нет', leadEmptyText:'Лиды появятся здесь после отправки public ссылки.', destination:'Направление', savePackage:'Сохранить пакет', createPackage:'Создать пакет', setupNeeded:'Нужна настройка', noAgencyPackage:'Без профиля агентства package создать нельзя', brandPublic:'Бренд, телефон и email будут на public страницах.', completeSetup:'Завершить настройку', selectedPackageText:'Offer, который сейчас редактируется', notPublished:'не опубликован', noSelected:'Пакет не выбран', noSelectedText:'Сначала создайте package или нажмите edit в каталоге.', openPublic:'Открыть public страницу', preview:'Preview', previewText:'Public preview появится после создания package.', emptyStatusText:'В этом статусе лидов нет.', client:'Клиент', booking:'Бронь', contacted:'Связались', agencyFormText:'Бренд и контакты для public предложений', complete:'выполнено', nextStage:'Следующий этап', inviteTeam:'Manager и agents добавляются через invite.', roleNote:'Роль не выбирается при регистрации. Owner позже выдает роли участникам.', agencyName:'Название агентства', legalName:'Юридическое название', website:'Сайт' },
  en: { dashboardTitle:'Dashboard', dashboardSubtitle:'Today sales status and next steps.', packagesTitle:'Packages', packagesSubtitle:'Catalog of offers sent to clients.', builderTitle:'Builder', builderSubtitle:'Build a tour package, add content and publish.', leadsTitle:'Leads', leadsSubtitle:'Requests from public pages.', settingsTitle:'Settings', settingsSubtitle:'Agency profile and workspace settings.', workspace:'Workspace', setupRequired:'Setup required', ready:'ready', agencyNotSet:'Agency not set', agent:'Agent', newPackage:'New package', logout:'Logout', login:'Login', register:'Register', loginTitle:'Log in to workspace', registerTitle:'Create workspace', loginHelp:'Continue with email and password.', registerHelp:'Role is automatically owner. Team invites come later.', authTitle:'One professional workspace from tour package to lead.', authText:'Agents build offers, clients view public pages, and leads land in CRM.', fullName:'Full name', phone:'Phone', password:'Password', passwordHint:'Minimum 6 characters', processing:'Processing...', createWorkspace:'Create workspace', account:'Account', accountText:'Workspace account created', agencyProfile:'Agency profile', agencyText:'Brand, phone, email and website', firstPackage:'First package', firstPackageText:'Create a polished tour offer', publicOffer:'Public offer', publicOfferText:'Share the SSR link with a client', launchStatus:'Launch status', finishAgency:'Complete the agency profile first', workspacePreparing:'Workspace is getting ready', allDone:'All main steps are complete. You can work with real clients now.', create:'Create', reviewLeads:'Review leads', setup:'Setup', recentPackages:'Recent packages', recentLeads:'Recent leads', catalog:'Package catalog', packageDetails:'Package details', editPackage:'Edit package', contentBlocks:'Content blocks', selectedPackage:'Selected package', blocks:'Blocks', agencyFormTitle:'Agency profile', readiness:'Workspace readiness', teamAccess:'Team access', saveAgency:'Save agency', title:'Title', link:'Link', nights:'Nights', meal:'Meal', from:'From', to:'To', flightNo:'Flight no', departure:'Departure', arrival:'Arrival', address:'Address', text:'Text', items:'Items', edit:'Edit', publish:'Publish', booked:'Booked', lost:'Lost', inProgress:'In progress', empty:'Empty', noBlock:'No blocks', noBlockText:'Add a hotel, flight or gallery block.', blockAdded:'block added', requestFailed:'Request failed', new:'new', clicks:'Clicks', drafts:'Drafts', publicVisits:'Public visits', needPublish:'Need publishing', recentPackagesText:'Latest prepared offers', recentLeadsText:'Requests from public pages', catalogText:'All offers, status and performance', packageDetailsText:'Main details visible to the client', noPackage:'No packages yet', noPackageText:'Create the first offer in builder.', emptyCatalog:'Catalog is empty', emptyCatalogText:'Create a tour package and send the public link to a client.', leadEmpty:'No leads yet', leadEmptyText:'Leads will appear here after sending a public link.', destination:'Destination', savePackage:'Save package', createPackage:'Create package', setupNeeded:'Setup required', noAgencyPackage:'You cannot create packages without an agency profile', brandPublic:'Brand, phone and email appear on public pages.', completeSetup:'Complete setup', selectedPackageText:'Offer currently being edited', notPublished:'not published', noSelected:'No package selected', noSelectedText:'Create a package or edit one from catalog.', openPublic:'Open public page', preview:'Preview', previewText:'Public preview appears after package creation.', emptyStatusText:'No leads in this status.', client:'Client', booking:'Booking', contacted:'Contacted', agencyFormText:'Brand and contact details shown in public offers', complete:'complete', nextStage:'Next stage', inviteTeam:'Managers and agents are added by invite.', roleNote:'Role is not selected during registration. Owner assigns team roles later.', agencyName:'Agency name', legalName:'Legal name', website:'Website' }
};
function tx(lang, key) { return ui[lang]?.[key] || ui.uz[key] || key; }


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
  const [lang, setLang] = useState('uz');
  const t = (key) => tx(lang, key);
  function changeLang(nextLang) {
    setLang(nextLang);
    localStorage.setItem('caselink_lang', nextLang);
  }
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
    { key: 'account', title: t('account'), text: t('accountText'), done: Boolean(token), action: null },
    { key: 'agency', title: t('agencyProfile'), text: t('agencyText'), done: Boolean(agency), action: () => setView('settings') },
    { key: 'package', title: t('firstPackage'), text: t('firstPackageText'), done: packages.length > 0, action: () => setView('builder') },
    { key: 'publish', title: t('publicOffer'), text: t('publicOfferText'), done: packages.some((pkg) => pkg.status === 'published'), action: () => setView('packages') },
  ], [agency, packages, token, lang]);

  const readiness = Math.round((launchSteps.filter((step) => step.done).length / launchSteps.length) * 100);

  useEffect(() => {
    const savedApi = localStorage.getItem('caselink_api_base');
    const savedToken = localStorage.getItem('caselink_token');
    const savedLang = localStorage.getItem('caselink_lang');
    if (savedApi) setApiBase(savedApi);
    if (savedToken) setToken(savedToken);
    if (savedLang && ui[savedLang]) setLang(savedLang);
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
    if (!res.ok) throw new Error(payload?.message || payload?.error || t('requestFailed'));
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
        api('/caselink/leads', {}, nextToken).catch(() => []),
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

  async function updateLeadStatus(lead, status) {
    await api(`/caselink/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadAll();
    notify('Lead status yangilandi');
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
    notify(`${blockLabel(blockType)} ${t('blockAdded')}`);
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

  if (!token) return <AuthPage onAuth={handleAuth} toast={toast} lang={lang} setLang={changeLang} />;

  const title = t(`${view}Title`);
  const subtitle = t(`${view}Subtitle`);

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="brandLogo">CL</div>
          <div><strong>CaseLink</strong><span>{t('workspace')}</span></div>
        </div>
        <nav className="sideNav">
          {[
            ['overview', t('dashboardTitle')],
            ['packages', t('packagesTitle')],
            ['builder', t('builderTitle')],
            ['leads', t('leadsTitle')],
            ['settings', t('settingsTitle')],
          ].map(([key, label]) => <button key={key} className={`sideLink ${view === key ? 'active' : ''}`} onClick={() => setView(key)}>{label}</button>)}
        </nav>
        <div className="sideWorkspace">
          <span>{t('workspace')}</span>
          <strong>{agency?.name || t('setupRequired')}</strong>
          <div className="miniProgress"><i style={{ width: `${readiness}%` }} /></div>
          <small>{readiness}% {t('ready')}</small>
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
            <span className="pill neutral">{agency?.name || t('agencyNotSet')}</span>
            <span className="pill success">{user?.name || user?.email || t('agent')}</span>
            <button className="primaryButton" onClick={prepareCreatePackage}>{t('newPackage')}</button>
            <LanguageSwitcher lang={lang} setLang={changeLang} /><button className="textButton" onClick={logout}>{t('logout')}</button>
          </div>
        </header>

        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

        {view === 'overview' && <Dashboard t={t} metrics={metrics} packages={packages} leads={leads} launchSteps={launchSteps} readiness={readiness} agency={agency} setView={setView} onCreate={prepareCreatePackage} onEdit={prepareEditPackage} onPublish={publishPackage} />}
        {view === 'packages' && <PackageCatalog t={t} packages={packages} onCreate={prepareCreatePackage} onEdit={prepareEditPackage} onPublish={publishPackage} />}
        {view === 'builder' && <Builder t={t} agency={agency} selectedPackage={selectedPackage} packageMode={packageMode} onPackageSubmit={savePackage} blockType={blockType} setBlockType={setBlockType} onBlockSubmit={saveBlock} onSetup={() => setView('settings')} />}
        {view === 'leads' && <LeadsView t={t} leads={leads} packages={packages} onStatusChange={updateLeadStatus} />}
        {view === 'settings' && <Settings t={t} agency={agency} onSubmit={saveAgency} launchSteps={launchSteps} readiness={readiness} />}
      </main>
    </div>
  );
}

function LanguageSwitcher({ lang, setLang }) {
  return <div className="languageSwitch" aria-label="Language">{languages.map(([key, label]) => <button key={key} type="button" className={lang === key ? 'active' : ''} onClick={() => setLang(key)}>{label}</button>)}</div>;
}

function AuthPage({ onAuth, toast, lang, setLang }) {
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
          <h1>{tx(lang, 'authTitle')}</h1>
          <p>{tx(lang, 'authText')}</p>
        </div>
        <div className="authProofGrid">
          <span>SSR public offers</span><span>Package builder</span><span>Lead inbox</span>
        </div>
      </section>
      <section className="authPanel"><LanguageSwitcher lang={lang} setLang={setLang} />
        <div className="authTabs"><button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')} type="button">{tx(lang, 'login')}</button><button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')} type="button">{tx(lang, 'register')}</button></div>
        <div className="panelTitle"><h2>{tab === 'login' ? tx(lang, 'loginTitle') : tx(lang, 'registerTitle')}</h2><p>{tab === 'login' ? tx(lang, 'loginHelp') : tx(lang, 'registerHelp')}</p></div>
        {(error || toast?.type === 'error') && <div className="formError">{error || toast.message}</div>}
        <form className="formStack" onSubmit={submit}>
          {tab === 'register' && <label>{tx(lang, 'fullName')}<input name="name" placeholder="Ali Valiyev" required /></label>}
          <label>Email<input name="email" type="email" placeholder="agent@agency.uz" required /></label>
          {tab === 'register' && <label>{tx(lang, 'phone')}<input name="phone" placeholder="+998 90 123 45 67" /></label>}
          <label>{tx(lang, 'password')}<input name="password" type="password" placeholder={tx(lang, 'passwordHint')} required /></label>
          <button className="primaryButton" disabled={loading}>{loading ? tx(lang, 'processing') : tab === 'login' ? tx(lang, 'login') : tx(lang, 'createWorkspace')}</button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ t, metrics, packages, leads, launchSteps, readiness, agency, setView, onCreate, onEdit, onPublish }) {
  const nextStep = launchSteps.find((step) => !step.done);
  return <div className="dashboardGrid">
    <section className="heroPanel">
      <div><p className="overline">{t('launchStatus')}</p><h2>{agency ? t('workspacePreparing') : t('finishAgency')}</h2><p>{nextStep ? nextStep.text : t('allDone')}</p></div>
      <div className="readinessDial"><strong>{readiness}%</strong><span>{t('ready')}</span></div>
    </section>
    <MetricGrid t={t} metrics={metrics} />
    <LaunchSteps steps={launchSteps} />
    <section className="commandGrid">
      <button className="commandCard primary" disabled={!agency} onClick={onCreate}><span>{t('create')}</span><strong>{t('newPackage')}</strong><small>{agency ? 'Mijozga yuboriladigan offer yarating' : 'Avval agency profilini toldiring'}</small></button>
      <button className="commandCard" onClick={() => setView('leads')}><span>CRM</span><strong>{t('reviewLeads')}</strong><small>Yangi sorovlar va kontaktlar</small></button>
      <button className="commandCard" onClick={() => setView('settings')}><span>{t('setup')}</span><strong>{t('agencyProfile')}</strong><small>Brend va aloqa malumotlari</small></button>
    </section>
    <div className="dashboardColumns">
      <PackageList t={t} packages={packages.slice(0, 4)} onEdit={onEdit} onPublish={onPublish} />
      <RecentLeads t={t} leads={leads.slice(0, 5)} packages={packages} />
    </div>
  </div>;
}

function MetricGrid({ t, metrics }) {
  const data = [
    [t('packagesTitle'), metrics.packages, `${metrics.published} published`],
    [t('clicks'), metrics.clicks, t('publicVisits')],
    [t('leadsTitle'), metrics.leads, `${metrics.newLeads} ${t('new')}`],
    [t('drafts'), metrics.drafts, t('needPublish')],
  ];
  return <section className="metricGrid">{data.map(([label, value, helper]) => <div className="metricCard" key={label}><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>)}</section>;
}

function LaunchSteps({ steps }) {
  return <section className="launchStrip">{steps.map((step, index) => <button key={step.key} className={step.done ? 'done' : ''} onClick={step.action || undefined}><span>{index + 1}</span><div><strong>{step.title}</strong><small>{step.text}</small></div></button>)}</section>;
}

function PackageList({ t, packages, onEdit, onPublish }) {
  return <section className="panel"><PanelTitle title={t('recentPackages')} text={t('recentPackagesText')} />{packages.length ? <div className="listRows">{packages.map((pkg) => <PackageRow key={pkg.id} t={t} pkg={pkg} onEdit={onEdit} onPublish={onPublish} />)}</div> : <EmptyState title={t('noPackage')} text={t('noPackageText')} />}</section>;
}

function RecentLeads({ t, leads, packages }) {
  return <section className="panel"><PanelTitle title={t('recentLeads')} text={t('recentLeadsText')} />{leads.length ? <div className="listRows">{leads.map((lead) => <div className="rowItem" key={lead.id}><div><strong>{lead.clientName || lead.phone || t('client')}</strong><p>{packages.find((pkg) => pkg.id === lead.packageId)?.title || lead.source || 'Public page'}</p></div>{pill(lead.status)}</div>)}</div> : <EmptyState title={t('leadEmpty')} text={t('leadEmptyText')} />}</section>;
}

function PackageCatalog({ t, packages, onCreate, onEdit, onPublish }) {
  return <section className="panel"><div className="panelHead"><PanelTitle title={t('catalog')} text={t('catalogText')} /><button className="primaryButton" onClick={onCreate}>{t('newPackage')}</button></div>{packages.length ? <div className="packageCards">{packages.map((pkg) => <PackageRow key={pkg.id} t={t} pkg={pkg} onEdit={onEdit} onPublish={onPublish} />)}</div> : <EmptyState title={t('emptyCatalog')} text={t('emptyCatalogText')} />}</section>;
}

function PackageRow({ t, pkg, onEdit, onPublish }) {
  return <article className="packageRow"><div className="packageThumb" style={{ backgroundImage: `url(${firstImage(pkg)})` }} /><div><strong>{pkg.title}</strong><p>{pkg.destination || t('destination')} - {money(pkg.price, pkg.currency)}</p><small>{pkg.clickCount || 0} clicks - {pkg.leadCount || 0} leads</small></div><div className="rowActions">{pill(pkg.status)}<button className="textButton" onClick={() => onEdit(pkg)}>{t('edit')}</button>{pkg.status !== 'published' && <button className="smallButton" onClick={() => onPublish(pkg)}>{t('publish')}</button>}</div></article>;
}

function Builder({ t, agency, selectedPackage, packageMode, onPackageSubmit, blockType, setBlockType, onBlockSubmit, onSetup }) {
  return <div className="builderLayout">
    {!agency && <SetupPanel t={t} onSetup={onSetup} />}
    <section className="panel builderForm"><PanelTitle title={packageMode === 'edit' ? t('editPackage') : t('packageDetails')} text={t('packageDetailsText')} />
      <PackageForm t={t} selectedPackage={selectedPackage} packageMode={packageMode} onSubmit={onPackageSubmit} />
    </section>
    <section className="panel blockPanel"><PanelTitle title={t('contentBlocks')} text={t('contentBlocks')} />
      <BlockComposer t={t} selectedPackage={selectedPackage} blockType={blockType} setBlockType={setBlockType} onSubmit={onBlockSubmit} />
    </section>
    <aside className="previewColumn"><SelectedSummary t={t} selectedPackage={selectedPackage} /><PublicPreview t={t} selectedPackage={selectedPackage} /><BlockList t={t} selectedPackage={selectedPackage} /></aside>
  </div>;
}

function SetupPanel({ t, onSetup }) {
  return <section className="setupPanel"><div><span>{t('setupNeeded')}</span><strong>{t('noAgencyPackage')}</strong><p>{t('brandPublic')}</p></div><button className="primaryButton" onClick={onSetup}>{t('completeSetup')}</button></section>;
}

function PackageForm({ t, selectedPackage, packageMode, onSubmit }) {
  const defaults = selectedPackage || { title: '', destination: '', description: '', price: '', currency: 'USD', pax: 2, startsAt: '', endsAt: '' };
  function submit(event) { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget))); }
  return <form className="formGrid" onSubmit={submit}><label className="wide">{t('title')}<input name="title" defaultValue={defaults.title} placeholder="Antalya family vacation" required /></label><label>{t('destination')}<input name="destination" defaultValue={defaults.destination || ''} placeholder="Antalya, Turkey" /></label><label>Currency<input name="currency" defaultValue={defaults.currency || 'USD'} /></label><label>Price<input name="price" type="number" defaultValue={defaults.price || ''} placeholder="1850" /></label><label>Pax<input name="pax" type="number" defaultValue={defaults.pax || 2} /></label><label>Start date<input name="startsAt" type="date" defaultValue={defaults.startsAt ? String(defaults.startsAt).slice(0, 10) : ''} /></label><label>End date<input name="endsAt" type="date" defaultValue={defaults.endsAt ? String(defaults.endsAt).slice(0, 10) : ''} /></label><label className="wide">Description<textarea name="description" defaultValue={defaults.description || ''} placeholder="Hotel, flight, transfer and booking notes." /></label><button className="primaryButton wide">{packageMode === 'edit' ? t('savePackage') : t('createPackage')}</button></form>;
}

function BlockComposer({ t, selectedPackage, blockType, setBlockType, onSubmit }) {
  const preset = blockPresets[blockType];
  function submit(event) { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset(); }
  return <form className="blockComposer" onSubmit={submit}><div className="blockTypeGrid">{Object.entries(blockPresets).map(([key, item]) => <button key={key} type="button" className={blockType === key ? 'active' : ''} onClick={() => setBlockType(key)}><strong>{item.label}</strong><span>{item.helper}</span></button>)}</div><div className="dynamicFields">{preset.fields.includes('title') && <label>{t('title')}<input name="title" placeholder="Rixos Premium Belek" /></label>}{preset.fields.includes('url') && <label>{t('link')}<input name="url" placeholder="https://example.com" /></label>}{preset.fields.includes('nights') && <label>{t('nights')}<input name="nights" type="number" placeholder="5" /></label>}{preset.fields.includes('meal') && <label>{t('meal')}<input name="meal" placeholder="Ultra all inclusive" /></label>}{preset.fields.includes('from') && <label>{t('from')}<input name="from" placeholder="TAS" /></label>}{preset.fields.includes('to') && <label>{t('to')}<input name="to" placeholder="AYT" /></label>}{preset.fields.includes('flightNo') && <label>{t('flightNo')}<input name="flightNo" placeholder="HY263" /></label>}{preset.fields.includes('departure') && <label>{t('departure')}<input name="departure" placeholder="09:30" /></label>}{preset.fields.includes('arrival') && <label>{t('arrival')}<input name="arrival" placeholder="12:40" /></label>}{preset.fields.includes('address') && <label className="wide">{t('address')}<input name="address" placeholder="Belek, Antalya" /></label>}{preset.fields.includes('text') && <label className="wide">{t('text')}<textarea name="text" placeholder="Important note for this offer" /></label>}{preset.fields.includes('items') && <label className="wide">{t('items')}<textarea name="items" placeholder="Hotel\nFlight\nTransfer\nInsurance" /></label>}</div><button className="secondaryButton" disabled={!selectedPackage}>Add {preset.label} block</button></form>;
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

function SelectedSummary({ t, selectedPackage }) {
  return <section className="panel compact"><PanelTitle title={t('selectedPackage')} text={t('selectedPackageText')} />{selectedPackage ? <div className="summaryBox"><strong>{selectedPackage.title}</strong><span>{selectedPackage.destination || 'Destination'}</span><span>{selectedPackage.blocks?.length || 0} blocks - {publicUrl(selectedPackage.slug) || t('notPublished')}</span></div> : <EmptyState title={t('noSelected')} text={t('noSelectedText')} />}</section>;
}

function PublicPreview({ t, selectedPackage }) {
  return <section className="phonePreview"><div className="phoneChrome" />{selectedPackage ? <><div className="phoneHero" style={{ backgroundImage: `url(${firstImage(selectedPackage)})` }} /><div className="phoneBody"><span>{selectedPackage.destination || 'Travel offer'}</span><h3>{selectedPackage.title}</h3><p>{selectedPackage.description || 'Tour package description'}</p><strong>{money(selectedPackage.price, selectedPackage.currency)}</strong><a href={publicUrl(selectedPackage.slug)} target="_blank">{t('openPublic')}</a></div></> : <div className="phoneEmpty"><strong>{t('preview')}</strong><p>{t('previewText')}</p></div>}</section>;
}

function BlockList({ t, selectedPackage }) {
  const blocks = selectedPackage?.blocks || [];
  return <section className="panel compact"><PanelTitle title={t('blocks')} text="Public sahifa kontenti" />{blocks.length ? <div className="blockList">{blocks.map((block) => <div className="blockRow" key={block.id}><span>{blockLabel(block.type)}</span><strong>{blockText(block)}</strong></div>)}</div> : <EmptyState title={t('noBlock')} text={t('noBlockText')} />}</section>;
}

function LeadsView({ t, leads, packages, onStatusChange }) {
  const statuses = [
    ['new', t('new')],
    ['in_progress', t('inProgress')],
    ['won', t('booked')],
    ['lost', t('lost')],
  ];
  return <div className="leadBoard">{statuses.map(([status, title]) => {
    const items = leads.filter((lead) => lead.status === status);
    return <section className="panel" key={status}><PanelTitle title={title} text={items.length + ' leads'} />{items.map((lead) => <LeadCard key={lead.id} t={t} lead={lead} packages={packages} onStatusChange={onStatusChange} />)}{!items.length && <EmptyState title={t('empty')} text={t('emptyStatusText')} />}</section>;
  })}</div>;
}

function LeadCard({ t, lead, packages, onStatusChange }) {
  const pkg = lead.package || packages.find((item) => item.id === lead.packageId);
  return <article className="leadCard"><div className="leadTop"><strong>{lead.name || lead.phone || t('client')}</strong>{lead.intent === 'booking' && <span className="pill success">{t('booking')}</span>}</div><p>{pkg?.title || lead.source || t('publicOffer')}</p><small>{lead.phone || lead.email || '-'}</small><div className="leadMeta"><span>{lead.pax ? lead.pax + ' pax' : 'Pax not set'}</span><span>{lead.preferredDate || 'Date not set'}</span><span>{lead.preferredContact || 'Contact not set'}</span></div>{lead.message && <p className="leadMessage">{lead.message}</p>}<div className="leadActions"><button className="textButton" onClick={() => onStatusChange(lead, 'in_progress')}>{t('contacted')}</button><button className="smallButton" onClick={() => onStatusChange(lead, 'won')}>{t('booked')}</button><button className="textButton" onClick={() => onStatusChange(lead, 'lost')}>{t('lost')}</button></div></article>;
}

function Settings({ t, agency, onSubmit, launchSteps, readiness }) {
  return <div className="settingsGrid"><section className="panel"><PanelTitle title={t('agencyFormTitle')} text={t('agencyFormText')} /><AgencyForm t={t} agency={agency} onSubmit={onSubmit} /></section><aside className="settingsSide"><section className="panel compact"><PanelTitle title={t('readiness')} text={`${readiness}% ${t('complete')}`} /><LaunchSteps steps={launchSteps} /></section><section className="panel compact"><PanelTitle title={t('teamAccess')} text={t('nextStage')} /><div className="featureNote"><strong>{t('inviteTeam')}</strong><p>{t('roleNote')}</p></div></section></aside></div>;
}

function AgencyForm({ t, agency, onSubmit }) {
  function submit(event) { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget))); }
  return <form className="formGrid" onSubmit={submit}><label className="wide">{t('agencyName')}<input name="name" defaultValue={agency?.name || ''} placeholder="Case Travel" required /></label><label>Phone<input name="phone" defaultValue={agency?.phone || ''} placeholder="+998 90 123 45 67" /></label><label>Email<input name="email" type="email" defaultValue={agency?.email || ''} placeholder="sales@agency.uz" /></label><label className="wide">{t('legalName')}<input name="legalName" defaultValue={agency?.legalName || ''} placeholder="Case Travel LLC" /></label><label className="wide">{t('website')}<input name="website" defaultValue={agency?.website || ''} placeholder="https://agency.uz" /></label><button className="primaryButton wide">{t('saveAgency')}</button></form>;
}

function PanelTitle({ title, text }) {
  return <div className="panelTitle"><div><h2>{title}</h2>{text && <p>{text}</p>}</div></div>;
}

function EmptyState({ title, text }) {
  return <div className="emptyState"><strong>{title}</strong><p>{text}</p></div>;
}