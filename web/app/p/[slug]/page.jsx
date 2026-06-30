import { notFound } from 'next/navigation';
import LeadForm from '../../../components/LeadForm';
import { API_BASE, SITE_URL, apiFetch, blockText, money, packageImage } from '../../../lib/api';

async function getPackage(slug) {
  try {
    return await apiFetch(`/public/packages/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) {
    return {
      title: 'Package not found - CaseLink',
    };
  }

  const title = `${pkg.title} - ${pkg.agency?.name || 'CaseLink'}`;
  const description = pkg.description || `Tour package: ${money(pkg.price, pkg.currency)}`;
  const image = packageImage(pkg);
  const url = `${SITE_URL}/p/${pkg.slug}`;

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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicPackagePage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const source = query?.source || 'direct';
  const pkg = await getPackage(slug);

  if (!pkg) notFound();

  const hero = packageImage(pkg);
  const blocks = [...(pkg.blocks || [])].sort((a, b) => a.order - b.order);
  const telegram = (pkg.agency?.contactTelegram || '').replace('@', '');

  return (
    <main className="publicShell">
      <article className="publicPage">
        <section className="publicHero" style={{ backgroundImage: `url('${hero}')` }}>
          <div className="publicHeroContent">
            <span className="pill">{pkg.agency?.name || 'CaseLink offer'}</span>
            <h1>{pkg.title}</h1>
            <p>{pkg.description || 'Tayyor turpaket taklifi'}</p>
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
            <div>
              <span className="pill">Price</span>
              <div className="price">{money(pkg.price, pkg.currency)}</div>
            </div>
            {telegram && <a className="actionLink" href={`https://t.me/${telegram}`} target="_blank">Telegram</a>}
            {pkg.agency?.contactPhone && <a className="actionLink secondary" href={`tel:${pkg.agency.contactPhone}`}>Call</a>}
            <LeadForm apiBase={API_BASE} slug={pkg.slug} source={source} />
          </aside>
        </section>
      </article>
    </main>
  );
}



