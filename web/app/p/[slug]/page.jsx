import LeadForm from '../../../components/LeadForm';
import { API_BASE, SITE_URL, apiFetch, blockText, money, packageImage } from '../../../lib/api';

const langs = ['uz', 'ru', 'en'];
const copy = {
  uz: {
    notFoundTitle: 'Paket topilmadi - CaseLink',
    offerFallback: 'Tayyor turpaket taklifi',
    ready: 'Tayyor taklif',
    confirm: 'Joy va final narx agent tomonidan tasdiqlanadi.',
    call: 'Qongiroq qilish',
    notPublished: 'Taklif publish qilinmagan',
    missingTitle: 'Public sahifa hali tayyor emas',
    missingText: 'boyicha published package topilmadi. Bu link ochilishi uchun agent package yaratib, uni publish qilishi kerak.',
    step1: 'Dashboardga kiring',
    step1Text: 'Agent account bilan platformaga login qiling.',
    step2: 'Package yarating',
    step2Text: 'Builder orqali tour paket malumotlarini toldiring.',
    step3: 'Publish qiling',
    step3Text: 'Packages bolimidan publish qilib, real public linkni mijozga yuboring.',
    openWorkspace: 'Workspace ochish',
  },
  ru: {
    notFoundTitle: 'Пакет не найден - CaseLink',
    offerFallback: 'Готовое предложение тура',
    ready: 'Готовое предложение',
    confirm: 'Места и финальная цена подтверждаются агентом.',
    call: 'Позвонить',
    notPublished: 'Предложение не опубликовано',
    missingTitle: 'Public-страница еще не готова',
    missingText: 'не найден опубликованный пакет. Чтобы ссылка открылась, агент должен создать package и опубликовать его.',
    step1: 'Войдите в dashboard',
    step1Text: 'Авторизуйтесь в платформе как агент.',
    step2: 'Создайте package',
    step2Text: 'Заполните данные тура через Builder.',
    step3: 'Опубликуйте',
    step3Text: 'В разделе Packages нажмите publish и отправьте клиенту реальную public-ссылку.',
    openWorkspace: 'Открыть workspace',
  },
  en: {
    notFoundTitle: 'Package not found - CaseLink',
    offerFallback: 'Ready tour package offer',
    ready: 'Ready offer',
    confirm: 'Availability and final price are confirmed by the agent.',
    call: 'Call',
    notPublished: 'Offer not published',
    missingTitle: 'The public page is not ready yet',
    missingText: 'does not match a published package. To open this link, the agent must create and publish a package first.',
    step1: 'Open dashboard',
    step1Text: 'Log in to the platform with an agent account.',
    step2: 'Create a package',
    step2Text: 'Fill tour package details in Builder.',
    step3: 'Publish it',
    step3Text: 'Publish it from Packages and send the real public link to the client.',
    openWorkspace: 'Open workspace',
  },
};

function getLang(query) {
  return langs.includes(query?.lang) ? query.lang : 'uz';
}

async function getPackage(slug) {
  try {
    return await apiFetch(`/public/packages/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const lang = getLang(query);
  const t = copy[lang];
  const pkg = await getPackage(slug);
  if (!pkg) {
    return { title: t.notFoundTitle };
  }

  const title = `${pkg.title} - ${pkg.agency?.name || 'CaseLink'}`;
  const description = pkg.description || `Tour package: ${money(pkg.price, pkg.currency)}`;
  const image = packageImage(pkg);
  const url = `${SITE_URL}/p/${pkg.slug}?lang=${lang}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: pkg.agency?.name || 'CaseLink',
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: pkg.title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PublicPackagePage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const lang = getLang(query);
  const t = copy[lang];
  const source = query?.source || 'direct';
  const pkg = await getPackage(slug);

  if (!pkg) {
    return <MissingPublicOffer slug={slug} lang={lang} />;
  }

  const hero = packageImage(pkg);
  const blocks = [...(pkg.blocks || [])].sort((a, b) => a.order - b.order);
  const telegram = (pkg.agency?.contactTelegram || '').replace('@', '');

  return (
    <main className="publicShell">
      <article className="publicPage">
        <section className="publicHero" style={{ backgroundImage: `url('${hero}')` }}>
          <div className="publicHeroContent">
            <div className="publicHeroTop">
              <span className="pill">{pkg.agency?.name || 'CaseLink'}</span>
              <LanguageLinks slug={pkg.slug} lang={lang} />
            </div>
            <h1>{pkg.title}</h1>
            <p>{pkg.description || t.offerFallback}</p>
          </div>
        </section>

        <section className="publicContent">
          <div className="publicBlocks">
            {blocks.map((block) => (
              <article key={block.id} className="publicBlock">
                <span>{block.type}</span>
                <h2>{block.preview?.title || block.data?.title || block.type}</h2>
                <p>{blockText(block)}</p>
              </article>
            ))}
          </div>

          <aside className="publicSidebar">
            <div className="bookingPrice">
              <span className="pill success">{t.ready}</span>
              <div className="price">{money(pkg.price, pkg.currency)}</div>
              <p>{t.confirm}</p>
            </div>
            {telegram && <a className="actionLink" href={`https://t.me/${telegram}`} target="_blank">Telegram</a>}
            {pkg.agency?.contactPhone && <a className="actionLink secondary" href={`tel:${pkg.agency.contactPhone}`}>{t.call}</a>}
            <LeadForm apiBase={API_BASE} slug={pkg.slug} source={source} lang={lang} />
          </aside>
        </section>
      </article>
    </main>
  );
}

function LanguageLinks({ slug, lang }) {
  return <div className="publicLang">{langs.map((item) => <a key={item} className={item === lang ? 'active' : ''} href={`/p/${slug}?lang=${item}`}>{item.toUpperCase()}</a>)}</div>;
}

function MissingPublicOffer({ slug, lang }) {
  const t = copy[lang] || copy.uz;
  return (
    <main className="publicShell">
      <section className="missingOffer">
        <div>
          <div className="publicHeroTop">
            <span className="pill warn">{t.notPublished}</span>
            <LanguageLinks slug={slug} lang={lang} />
          </div>
          <h1>{t.missingTitle}</h1>
          <p><strong>/p/{slug}</strong> {t.missingText}</p>
        </div>
        <div className="missingSteps">
          <div><span>1</span><strong>{t.step1}</strong><p>{t.step1Text}</p></div>
          <div><span>2</span><strong>{t.step2}</strong><p>{t.step2Text}</p></div>
          <div><span>3</span><strong>{t.step3}</strong><p>{t.step3Text}</p></div>
        </div>
        <a className="actionLink" href="/">{t.openWorkspace}</a>
      </section>
    </main>
  );
}
