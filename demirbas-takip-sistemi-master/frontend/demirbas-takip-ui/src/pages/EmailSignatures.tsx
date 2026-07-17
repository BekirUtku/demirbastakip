import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

/* ------------------------------------------------------------------ */
/*  Firma ön ayarları (logo, kampanya görselleri, web sitesi, uyarı)  */
/* ------------------------------------------------------------------ */

type CompanyKey = 'lokum' | 'ogas';

interface CompanyPreset {
  key: CompanyKey;
  label: string;
  companyDisplayName: string;
  logo: string;
  logoWidth: number;
  logoValign: string;
  banners: string[];
  efatura: string;
  website: string;
  disclaimerTr: string;
  disclaimerEn: string;
}

const LOKUM_LEGAL =
  '“LOKUM ATÖLYESİ ŞEKERLEME GIDA TURİZM İNŞ. HAYV. SAN. VE TİC. A.Ş. (LOKUM ATÖLYESİ)”';
const OGAS_LEGAL =
  'OGAŞ ŞEKERLEME GIDA TURİZM SANAYİ TİCARET A.Ş. (OGAŞ)';
// TR metinde ilk geçiş: kapanış tırnağı ve (LOKUM ATÖLYESİ) yok
const LOKUM_LEGAL_FIRST =
  '“LOKUM ATÖLYESİ ŞEKERLEME GIDA TURİZM İNŞ. HAYV. SAN. VE TİC. A.Ş.';

const PRESETS: Record<CompanyKey, CompanyPreset> = {
  lokum: {
    key: 'lokum',
    label: 'Lokum Atölyesi',
    companyDisplayName: 'LOKUM ATÖLYESİ ŞEKERLEME\nGIDA TUR.İNŞ.HAYV.SAN.TİC.A.Ş.',
    logo: '/logos/lokum_atolyesi_imza.png',
    logoWidth: 110,
    logoValign: 'top',
    banners: ['/logos/Paylaştıkça_Bereketlenir.png', '/logos/Su_Verimliliği.png'],
    efatura: '/logos/E-Fatura.png',
    website: 'www.lokumatolyesi.com.tr',
    disclaimerTr:
      `Bu elektronik posta ve ilişkili dosyalar sadece alması amaçlanan şahsi veya tüzel kişiye özeldir. Eğer yetkili alıcı değilseniz içeriği açmanız, açıklamanız, kopyalamanız, yönlendirmeniz ve kullanmanız yasaktır ve bu e-postayı derhal silmeniz gerekmektedir. ${LOKUM_LEGAL_FIRST} bu mesajın içerdiği bilgilerin mutlak doğruluğu veya eksiksiz olduğu konusunda herhangi bir garanti vermez. Bu nedenle bu bilgilerin kullanımı ile ilgili kayıplardan sorumlu tutulamaz. Bu mesajın içeriğiyle ilgili sorumluluk yalnızca gönderen kişiye aittir ve bu içerik ${LOKUM_LEGAL} tüzel kişiliğinin görüşlerini yansıtmayabilir. Bu e-posta bilinen bilgisayar virüslerine karşı taranmıştır. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla, e posta ortamında toplanan kişisel verilerinizi, Kişisel Verilerin Korunması ve İşlenmesi Politikası (“Politika”) usul ve esaslarıyla işlemekte ve gizli tutmaktayız. Politika belgesine www.lokumatolyesi.com.tr adresinden ulaşabilirsiniz.`,
    disclaimerEn:
      `This e-mail and related files are the private property of the sender , the personal and the legal entities to whom they were intended to be send. If you are not an authorized recepient of this e-mail it is forbidden to open, copy, forward or use it. It is required that you should delate this e-mail immediately. ${LOKUM_LEGAL} does not guarrantee absolutely the correctness and completeness of the information within this e-mail, and therefore will not be held liable from their illegal use and the forfeit. The sole resposibility will belong to the person who send it and the contents herein might not be reflecting the opinions of ${LOKUM_LEGAL} legal entity. This e-mail has been scanned for all known computer viruses. Assigned as data supervisor in accordance with Law No. 6698 (General Data Protection Regulation Law), your general documents existing in your e-mail environment will be protected and processed by the form and principles of General Data Protection and Processing Policy. You can reach the policy document via “www.lokumatolyesi.com.tr”.`,
  },
  ogas: {
    key: 'ogas',
    label: 'OGAŞ',
    companyDisplayName: 'OGAŞ ŞEKERLEME GIDA TURİZM\nSANAYİ TİCARET A.Ş.',
    logo: '/logos/ogas.png',
    logoWidth: 150,
    logoValign: 'top',
    banners: ['/logos/Su_Verimliliği.png'],
    efatura: '/logos/E-Fatura.png',
    website: 'www.ogas.com.tr',
    disclaimerTr:
      `Bu elektronik posta ve ilişkili dosyalar sadece alması amaçlanan şahsi veya tüzel kişiye özeldir. Eğer yetkili alıcı değilseniz içeriği açmanız, açıklamanız, kopyalamanız, yönlendirmeniz ve kullanmanız yasaktır ve bu e-postayı derhal silmeniz gerekmektedir. ${OGAS_LEGAL}, bu mesajın içerdiği bilgilerin mutlak doğruluğu veya eksiksiz olduğu konusunda herhangi bir garanti vermez. Bu nedenle bu bilgilerin kullanımı ile ilgili kayıplardan sorumlu tutulamaz. Bu mesajın içeriğiyle ilgili sorumluluk yalnızca gönderen kişiye aittir ve bu içerik ${OGAS_LEGAL} tüzel kişiliğinin görüşlerini yansıtmayabilir. Bu e-posta bilinen bilgisayar virüslerine karşı taranmıştır. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla, e posta ortamında toplanan kişisel verilerinizi, Kişisel Verilerin Korunması ve İşlenmesi Politikası (“Politika”) usul ve esaslarıyla işlemekte ve gizli tutmaktayız. Politika belgesine www.ogas.com.tr adresinden ulaşabilirsiniz.`,
    disclaimerEn:
      `This e-mail and related files are the private property of the sender , the personal and the legal entities to whom they were intended to be send. If you are not an authorized recepient of this e-mail it is forbidden to open, copy, forward or use it. It is required that you should delate this e-mail immediately. ${OGAS_LEGAL} does not guarrantee absolutely the correctness and completeness of the information within this e-mail, and therefore will not be held liable from their illegal use and the forfeit. The sole resposibility will belong to the person who send it and the contents herein might not be reflecting the opinions of ${OGAS_LEGAL} legal entity. This e-mail has been scanned for all known computer viruses. Assigned as data supervisor in accordance with Law No. 6698 (General Data Protection Regulation Law), your general documents existing in your e-mail environment will be protected and processed by the form and principles of General Data Protection and Processing Policy. You can reach the policy document via “www.ogas.com.tr”.`,
  },
};

const GREETING_DEFAULT = 'Saygılar Sunar, İşlerinizde Başarılar Dileriz.';

/* ------------------------------------------------------------------ */
/*  Yardımcılar                                                     */
/* ------------------------------------------------------------------ */

interface SigFields {
  company: CompanyKey;
  greeting: string;
  fullName: string;
  title: string;
  englishTitle: string;
  companyName: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  email: string;
  website: string;
}

const esc = (s: string) =>
  (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const row = (label: string, value: string) =>
  value
    ? `<div style="margin:1px 0;">${label ? `<span>${esc(label)}</span> ` : ''}${esc(value)}</div>`
    : '';

/** Metindeki firma ünvanlarını (önemli yerleri) kalın yapar. */
function boldNames(text: string, names: string[]): string {
  const sorted = [...names].sort((a, b) => b.length - a.length);
  let out = text;
  sorted.forEach((n, i) => {
    out = out.split(n).join(`\u0001${i}\u0001`);
  });
  sorted.forEach((n, i) => {
    out = out.split(`\u0001${i}\u0001`).join(`<b>${n}</b>`);
  });
  return out;
}

/** Form alanlarından imza HTML'i üretir (görseller URL olarak). */
function buildSignatureHtml(f: SigFields): string {
  const p = PRESETS[f.company];
  const websiteHref =
    f.website.startsWith('http') ? f.website : `https://${f.website}`;

  const legalNames =
    f.company === 'lokum' ? [LOKUM_LEGAL, LOKUM_LEGAL_FIRST] : [OGAS_LEGAL];
  const discTr = boldNames(esc(p.disclaimerTr), legalNames);
  const discEn = boldNames(esc(p.disclaimerEn), legalNames);

  const bannerCells = p.banners
    .map(
      (b) =>
        `<td style="padding:0 12px 0 0;vertical-align:top;"><img src="${b}" width="220" alt="Kampanya" style="display:block;border:none;" /></td>`,
    )
    .join('');

  return `<div style="font-family:'Times New Roman', Times, serif;font-size:9pt;color:#000000;line-height:1.35;margin:0;padding:0;text-align:left;max-width:920px;">
  <p style="margin:0 0 14px 0;">${esc(f.greeting)}</p>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;width:700px;font-family:'Times New Roman', Times, serif;">
    <tr>
      <td style="width:170px;vertical-align:${p.logoValign};padding-right:16px;">
        <img src="${p.logo}" width="${p.logoWidth}" alt="${esc(p.label)}" style="display:block;border:none;" />
      </td>
      <td style="width:250px;vertical-align:top;padding:2px 16px 2px 0;word-break:break-word;overflow-wrap:break-word;">
        <div style="font-weight:bold;">${esc(f.fullName)}</div>
        ${f.title ? `<div>${esc(f.title)}</div>` : ''}
        ${f.englishTitle ? `<div>${esc(f.englishTitle)}</div>` : ''}
        ${f.companyName ? `<div style="font-weight:bold;margin-top:4px;">${esc(f.companyName).replace(/\n/g, '<br />')}</div>` : ''}
      </td>
      <td style="width:280px;vertical-align:top;border-left:1px solid #cccccc;padding:2px 0 2px 16px;word-break:break-word;overflow-wrap:break-word;">
        ${f.city ? `<div style="font-weight:bold;margin-bottom:2px;">${esc(f.city)}</div>` : ''}
        ${row('Adres:', f.addressLine1)}
        ${row('', f.addressLine2)}
        ${row('Sabit:', f.phone)}
        ${row('E-posta:', f.email)}
        ${f.website ? `<div style="margin-top:2px;"><a href="${esc(websiteHref)}" style="color:#000000;text-decoration:none;">${esc(f.website)}</a></div>` : ''}
      </td>
    </tr>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:14px;">
    <tr>${bannerCells}<td style="vertical-align:middle;padding:0 0 0 4px;"><img src="${p.efatura}" width="130" alt="E-Fatura" style="display:block;border:none;" /></td></tr>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:14px;table-layout:fixed;width:700px;">
    <tr>
      <td style="border:1px solid #000000;padding:8px;font-family:'Times New Roman', Times, serif;font-size:9pt;color:#000000;line-height:1.35;word-break:break-word;overflow-wrap:break-word;">
        <b>YASAL UYARI</b><br />${discTr}<br /><br />
        <b>DISCLAIMER</b><br />${discEn}
      </td>
    </tr>
  </table>
</div>`;
}

/** Bir görseli fetch edip base64 data-URI'ye çevirir. */
async function toDataUri(path: string): Promise<string> {
  const res = await fetch(encodeURI(path));
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/** HTML içindeki tüm /logos/... görsellerini base64 gömer (mail-uyumlu). */
async function embedImages(html: string): Promise<string> {
  const paths = Array.from(
    new Set((html.match(/\/logos\/[^"')\s]+/g) || [])),
  );
  let out = html;
  for (const p of paths) {
    try {
      const uri = await toDataUri(p);
      out = out.split(p).join(uri);
    } catch {
      /* görsel bulunamazsa olduğu gibi bırak */
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Bileşen                                                          */
/* ------------------------------------------------------------------ */

export default function EmailSignatures() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>('');

  const [fields, setFields] = useState<SigFields>({
    company: 'lokum',
    greeting: GREETING_DEFAULT,
    fullName: '',
    title: '',
    englishTitle: '',
    companyName: PRESETS.lokum.companyDisplayName,
    city: '',
    addressLine1: '',
    addressLine2: '',
    phone: '',
    email: '',
    website: PRESETS.lokum.website,
  });

  const [rawMode, setRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, lRes] = await Promise.all([
          api.get('/Personnel'),
          api.get('/signature-locations').catch(() => ({ data: [] })),
        ]);
        setPersonnel(pRes.data || []);
        setLocations(lRes.data || []);
      } catch (e) {
        console.error('Veri yükleme hatası:', e);
      }
    })();
  }, []);

  const set = (k: keyof SigFields, v: string) =>
    setFields((prev) => ({ ...prev, [k]: v }));

  const detectCompany = (companyName: string): CompanyKey =>
    /ogaş|ogas/i.test(companyName || '') ? 'ogas' : 'lokum';

  const onSelectPersonnel = (idStr: string) => {
    const id = idStr ? Number(idStr) : '';
    setSelectedId(id);
    if (!id) return;
    const p = personnel.find((x) => x.id === id);
    if (!p) return;
    const company = detectCompany(p.companyName);
    const loc = locations.find((l) => l.id === p.signatureLocationId);
    setFields({
      company,
      greeting: GREETING_DEFAULT,
      fullName: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
      title: p.title ?? '',
      englishTitle: p.englishTitle ?? '',
      companyName: PRESETS[company].companyDisplayName,
      city: loc?.displayName ?? loc?.name ?? '',
      addressLine1: loc?.addressLine1 ?? '',
      addressLine2: loc?.addressLine2 ?? '',
      phone: (company === 'ogas' ? loc?.ogasPhone : loc?.lokumPhone) ?? p.phone ?? '',
      email: p.email ?? '',
      website: PRESETS[company].website,
    });
    setRawMode(false);
  };

  const onChangeCompany = (company: CompanyKey) => {
    setFields((prev) => ({
      ...prev,
      company,
      website: PRESETS[company].website,
      companyName: PRESETS[company].companyDisplayName,
    }));
  };

  const generatedHtml = useMemo(() => buildSignatureHtml(fields), [fields]);
  const previewHtml = rawMode ? rawHtml : generatedHtml;

  const enterRawMode = () => {
    setRawHtml(generatedHtml);
    setRawMode(true);
  };
  const backToForm = () => setRawMode(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const inner = rawMode ? rawHtml : generatedHtml;
      const embedded = await embedImages(inner);
      const doc = `<html>\n<head>\n<meta charset="utf-8">\n<title>Imza</title>\n</head>\n<body style="margin:0;padding:0;">\n${embedded}\n</body>\n</html>`;
      const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (fields.fullName || 'imza').replace(/[^\p{L}\p{N}]+/gu, '_');
      a.href = url;
      a.download = `${PRESETS[fields.company].label}_${safeName}.htm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('İndirme hatası:', e);
      alert('İmza indirilemedi. Konsolu kontrol edin.');
    } finally {
      setDownloading(false);
    }
  };

  const field = (
    label: string,
    key: keyof SigFields,
    opts: { textarea?: boolean } = {},
  ) => (
    <div className="mb-2">
      <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
        {label}
      </label>
      {opts.textarea ? (
        <textarea
          className="form-control"
          rows={2}
          value={fields[key] as string}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          className="form-control"
          value={fields[key] as string}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">✍️ E-Posta İmza Düzenleyici</h2>

      <div className="row g-4">
        {/* SOL: Düzenleme paneli */}
        <div className="col-lg-5">
          <div className="card p-3">
            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
                PERSONEL SEÇ (alanları otomatik doldurur)
              </label>
              <select
                className="form-select"
                value={selectedId}
                onChange={(e) => onSelectPersonnel(e.target.value)}
              >
                <option value="">Personel seçiniz…</option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                    {p.companyName ? ` — ${p.companyName}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
                FİRMA ŞABLONU
              </label>
              <div className="btn-group w-100">
                {(['lokum', 'ogas'] as CompanyKey[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-sm ${fields.company === c ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => onChangeCompany(c)}
                  >
                    {PRESETS[c].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong style={{ fontSize: 13 }}>
                {rawMode ? 'HAM HTML' : 'ALANLAR'}
              </strong>
              {rawMode ? (
                <button className="btn btn-sm btn-outline-secondary" onClick={backToForm}>
                  ← Forma dön
                </button>
              ) : (
                <button className="btn btn-sm btn-outline-secondary" onClick={enterRawMode}>
                  Ham HTML düzenle
                </button>
              )}
            </div>

            {rawMode ? (
              <textarea
                className="form-control"
                style={{ fontFamily: 'monospace', fontSize: 12, minHeight: 360 }}
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
              />
            ) : (
              <>
                {field('Selamlama', 'greeting')}
                {field('Ad Soyad', 'fullName')}
                {field('Unvan', 'title')}
                {field('İngilizce Unvan', 'englishTitle')}
                {field('Firma Adı (metin)', 'companyName', { textarea: true })}
                {field('Şehir / Lokasyon', 'city')}
                {field('Adres Satır 1', 'addressLine1', { textarea: true })}
                {field('Adres Satır 2', 'addressLine2', { textarea: true })}
                {field('Sabit Telefon', 'phone')}
                {field('E-posta', 'email')}
                {field('Web Sitesi', 'website')}
              </>
            )}

            <button
              className="btn btn-success mt-3"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'İndiriliyor…' : '⬇️ .htm olarak indir'}
            </button>
          </div>
        </div>

        {/* SAĞ: Canlı önizleme */}
        <div className="col-lg-7">
          <div className="card p-3">
            <h5 className="mb-3">Canlı Önizleme</h5>
            <div
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                padding: 16,
                background: '#ffffff',
                overflowX: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
