import PublicLayout from './PublicLayout.jsx';
import { legalData } from './legalData.js';
import { BRAND, CONTACT_EMAIL } from '../../lib/seed.js';

/**
 * Sample wording only, sized block by block so the pages keep their shape at every width.
 * The owner must replace it with reviewed legal text before anyone relies on it.
 */
const SAMPLE = [
  'Teks ini hanya contoh untuk menunjukkan tata letak halaman dan bukan dokumen hukum yang berlaku.',
  'Pemilik layanan perlu menggantinya dengan ketentuan resmi yang sudah ditinjau oleh penasihat hukum.',
  'Setiap bagian menjelaskan satu pokok bahasan dengan kalimat yang mudah dipahami oleh pengguna.',
  'Pengguna dapat menghubungi tim layanan apabila memerlukan penjelasan tambahan mengenai isi dokumen ini.',
  'Perubahan dokumen akan diberitahukan melalui saluran yang tersedia sebelum mulai berlaku.',
];

const filler = (length) => {
  let text = '';
  let i = length % 5;
  while (text.length < length) {
    text += `${text ? ' ' : ''}${SAMPLE[i % 5]}`;
    i += 1;
  }
  const cut = text.lastIndexOf(' ', length);
  return `${text.slice(0, cut > 0 ? cut : length).replace(/[.,]$/, '')}.`;
};

const Text = ({ node }) => (
  <>
    {node.b >= 2 ? <><b>"Pengguna"</b> atau <b>"Anda"</b>: </> : null}
    {node.b === 1 ? <><b>"Akun"</b>: </> : null}
    {filler(node.br ? 90 : node.n)}
    {node.br ? <><br />Hubungi kami di {CONTACT_EMAIL}.</> : null}
    {node.code ? <> <code>email.read-only</code></> : null}
    {node.a ? <> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></> : null}
  </>
);

function Block({ node, lead }) {
  const { t, c, txt } = node;
  if (t === 'h1') return <h1 className="legal-h1">{txt}</h1>;
  if (t === 'h2') return <h2>{txt}</h2>;
  if (t === 'h3') return <h3>{txt}</h3>;
  if (t === 'section') return <section><Nodes list={c} /></section>;
  if (t === 'div') return <div className={node.cl}><Nodes list={c} /></div>;
  if (t === 'ul') return <ul><Nodes list={c} /></ul>;
  if (t === 'ol') return <ol><Nodes list={c} /></ol>;
  if (t === 'li') {
    const Sub = node.sub?.t;
    return <li><Text node={node} />{Sub ? <Sub><Nodes list={node.sub.c} /></Sub> : null}</li>;
  }
  return <p className={lead ? 'legal-lead' : undefined}><Text node={node} /></p>;
}

const Nodes = ({ list }) => list.map((node, i) => <Block key={i} node={node} />);

function Article({ slug, title, leadFirst }) {
  const [, h1, ...rest] = legalData[slug];
  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)]" style={{ paddingTop: 'clamp(32px, 5vw, 64px)', paddingBottom: 'clamp(80px, 8.33vw, 120px)' }}>
      <article className="legal">
        <p className="legal-eyebrow">Legal</p>
        <h1 className="legal-h1">{h1?.txt || title}</h1>
        {rest.map((node, i) => <Block key={i} node={node} lead={leadFirst && i === 0} />)}
      </article>
    </div>
  );
}

export function Syarat() {
  return (
    <PublicLayout crumb="Syarat & Ketentuan" title={`Syarat & ketentuan · ${BRAND}`} description={`Contoh syarat dan ketentuan penggunaan ${BRAND}.`}>
      <Article slug="syarat-ketentuan" title="Syarat dan Ketentuan" leadFirst />
    </PublicLayout>
  );
}

export function Privasi() {
  return (
    <PublicLayout crumb="Kebijakan Privasi" title={`Kebijakan privasi · ${BRAND}`} description={`Contoh kebijakan privasi ${BRAND}.`}>
      <Article slug="kebijakan-privasi" title="Kebijakan Privasi" />
    </PublicLayout>
  );
}
