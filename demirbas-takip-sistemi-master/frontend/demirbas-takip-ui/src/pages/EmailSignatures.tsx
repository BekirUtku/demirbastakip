import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Header from '../components/layout/Header';

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
  mobile: string;
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
/** Kısa imza: sadece selamlama + isim + unvan + İngilizce unvan + firma. */
function buildCompactHtml(
  f: SigFields,
  img?: { url: string; width: number },
): string {
  const body = img
    ? `<img src="${img.url}" width="${img.width}" alt="İmza" style="display:block;border:none;" />`
    : `<div style="font-size:10pt;font-weight:bold;">${esc(f.fullName)}</div>
  ${f.title ? `<div>${esc(f.title)}</div>` : ''}
  ${f.englishTitle ? `<div>${esc(f.englishTitle)}</div>` : ''}
  ${f.companyName ? `<div style="font-weight:bold;">${esc(f.companyName).replace(/\n/g, '<br />')}</div>` : ''}`;
  return `<div style="font-family:'Times New Roman', Times, serif;font-size:9pt;color:#000000;line-height:1.35;margin:0;padding:0;text-align:left;">
  <p style="margin:0 0 14px 0;">${esc(f.greeting)}</p>
  ${body}
</div>`;
}

function buildSignatureHtml(
  f: SigFields,
  personImg?: { url: string; width: number },
): string {
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

  const infoCells = personImg
    ? `<td style="vertical-align:top;">${f.website ? `<a href="${websiteHref}" target="_blank" rel="noopener" style="text-decoration:none;border:none;">` : ''}<img src="${personImg.url}" width="${personImg.width}" alt="Personel Bilgileri" style="display:block;border:none;" />${f.website ? '</a>' : ''}</td>`
    : `<td style="vertical-align:top;padding:2px 16px 2px 0;word-break:break-word;overflow-wrap:break-word;">
        <div style="font-weight:bold;">${esc(f.fullName)}</div>
        ${f.title ? `<div>${esc(f.title)}</div>` : ''}
        ${f.englishTitle ? `<div>${esc(f.englishTitle)}</div>` : ''}
        ${f.companyName ? `<div style="font-weight:bold;margin-top:4px;">${esc(f.companyName).replace(/\n/g, '<br />')}</div>` : ''}
      </td>
      <td style="vertical-align:top;border-left:1px solid #cccccc;padding:2px 0 2px 16px;word-break:break-word;overflow-wrap:break-word;">
        ${f.city ? `<div style="font-weight:bold;margin-bottom:2px;">${esc(f.city)}</div>` : ''}
        ${row('Adres:', f.addressLine1)}
        ${row('', f.addressLine2)}
        ${row('Sabit:', f.phone)}
        ${f.website ? `<div style="margin-top:2px;"><a href="${esc(websiteHref)}" style="color:#000000;text-decoration:none;">${esc(f.website)}</a></div>` : ''}
      </td>`;

  return `<div style="font-family:'Times New Roman', Times, serif;font-size:9pt;color:#000000;line-height:1.35;margin:0;padding:0;text-align:left;max-width:920px;">
  <p style="margin:0 0 14px 0;">${esc(f.greeting)}</p>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:700px;font-family:'Times New Roman', Times, serif;">
    <tr>
      <td style="vertical-align:${p.logoValign};padding-right:16px;">
        <img src="${p.logo}" width="${p.logoWidth}" alt="${esc(p.label)}" style="display:block;border:none;" />
      </td>
      ${infoCells}
    </tr>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:14px;">
    <tr>${bannerCells}<td style="vertical-align:middle;padding:0 0 0 4px;"><img src="${p.efatura}" width="130" alt="E-Fatura" style="display:block;border:none;" /></td></tr>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:14px;max-width:700px;">
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

/** İkon görselini yükler (yüklenemezse null). */
function loadIcon(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

/** Kişi bilgisi bölümünü tarayıcıda Canvas ile PNG'ye çizer (base64 döner). */
async function renderPersonnelPng(
  f: SigFields,
): Promise<{ url: string; width: number }> {
  const scale = 3;
  const F = 12 * scale; // 9pt
  const lh = Math.round(F * 1.42);
  const pad = 8 * scale;
  const divGap = 16 * scale;
  const iconSize = Math.round(F * 1.25);
  const iconGap = Math.round(6 * scale);
  const gapH = Math.round(4 * scale);
  const maxCol = 250 * scale; // her sütun için maksimum metin genişliği (uzunsa alta iner)
  const fontReg = `${F}px "Times New Roman", Times, serif`;
  const fontBold = `bold ${F}px "Times New Roman", Times, serif`;

  const [icLoc, icPhone, icMob] = await Promise.all([
    loadIcon('/logos/icon_location.png'),
    loadIcon('/logos/icon_phone.png'),
    loadIcon('/logos/icon_mobile.png'),
  ]);

  const cv = document.createElement('canvas');
  const mctx = cv.getContext('2d')!;
  const measure = (t: string, font: string) => {
    mctx.font = font;
    return mctx.measureText(t).width;
  };
  const wrap = (t: string, font: string, maxW: number): string[] => {
    mctx.font = font;
    const words = String(t).split(/\s+/).filter(Boolean);
    const out: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (!cur || mctx.measureText(test).width <= maxW) cur = test;
      else {
        out.push(cur);
        cur = w;
      }
    }
    if (cur) out.push(cur);
    return out.length ? out : [''];
  };

  type RL = {
    t: string;
    font: string;
    offset: number;
    icon?: HTMLImageElement | null;
    gap?: boolean;
  };

  // SOL sütun
  const leftSrc: { t?: string; b?: boolean; gap?: boolean }[] = [
    { t: f.fullName, b: true },
  ];
  if (f.title) leftSrc.push({ t: f.title });
  if (f.englishTitle) leftSrc.push({ t: f.englishTitle });
  leftSrc.push({ gap: true });
  (f.companyName || '').split('\n').forEach((ln) => {
    if (ln) leftSrc.push({ t: ln, b: true });
  });
  const leftRender: RL[] = [];
  for (const it of leftSrc) {
    if (it.gap) {
      leftRender.push({ t: '', font: fontReg, offset: 0, gap: true });
      continue;
    }
    const font = it.b ? fontBold : fontReg;
    wrap(it.t as string, font, maxCol).forEach((sub) =>
      leftRender.push({ t: sub, font, offset: 0 }),
    );
  }

  // SAĞ sütun (ikonlu; uzun satırlar kaydırılır)
  const rightSrc: {
    t: string;
    b?: boolean;
    icon?: HTMLImageElement | null;
    indent?: boolean;
  }[] = [];
  if (f.city) rightSrc.push({ t: f.city, b: true });
  if (f.addressLine1)
    rightSrc.push(icLoc ? { t: f.addressLine1, icon: icLoc } : { t: `Adres: ${f.addressLine1}` });
  if (f.addressLine2)
    rightSrc.push(icLoc ? { t: f.addressLine2, indent: true } : { t: f.addressLine2 });
  if (f.phone)
    rightSrc.push(icPhone ? { t: f.phone, icon: icPhone } : { t: `Sabit: ${f.phone}` });
  if (f.mobile)
    rightSrc.push(icMob ? { t: f.mobile, icon: icMob } : { t: `Telefon: ${f.mobile}` });
  if (f.website) rightSrc.push({ t: f.website });
  const rightRender: RL[] = [];
  for (const it of rightSrc) {
    const font = it.b ? fontBold : fontReg;
    const offset = it.icon || it.indent ? iconSize + iconGap : 0;
    wrap(it.t, font, maxCol - offset).forEach((sub, i) =>
      rightRender.push({ t: sub, font, offset, icon: i === 0 ? it.icon : undefined }),
    );
  }

  const lineW = (r: RL) => (r.gap ? 0 : r.offset + measure(r.t, r.font));
  const leftW = Math.max(0, ...leftRender.map(lineW));
  const rightW = Math.max(0, ...rightRender.map(lineW));
  const divX = Math.round(pad + leftW + divGap);
  const rightX = divX + divGap;
  const W = Math.ceil(rightX + rightW + pad);
  const colH = (arr: RL[]) => {
    let y = pad;
    arr.forEach((r) => {
      y += r.gap ? gapH : lh;
    });
    return y;
  };
  const H = Math.ceil(Math.max(colH(leftRender), colH(rightRender)) + pad);

  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, W, H);
  c.textBaseline = 'top';

  let y = pad;
  for (const r of leftRender) {
    if (r.gap) {
      y += gapH;
      continue;
    }
    c.fillStyle = '#000000';
    c.font = r.font;
    c.fillText(r.t, pad, y);
    y += lh;
  }

  const divBottom = Math.max(colH(leftRender), colH(rightRender)) - lh + F;
  c.strokeStyle = '#cccccc';
  c.lineWidth = Math.max(1, Math.floor(scale / 2));
  c.beginPath();
  c.moveTo(divX + 0.5, pad);
  c.lineTo(divX + 0.5, divBottom);
  c.stroke();

  y = pad;
  for (const r of rightRender) {
    if (r.icon) {
      c.drawImage(r.icon, rightX, y + Math.round((F - iconSize) / 2), iconSize, iconSize);
    }
    c.fillStyle = '#000000';
    c.font = r.font;
    c.fillText(r.t, rightX + r.offset, y);
    y += lh;
  }

  return { url: cv.toDataURL('image/png'), width: Math.round(W / scale) };
}

/** Kısa imza bloğunu Canvas ile PNG'ye çizer (tek sütun). */
async function renderCompactPng(
  f: SigFields,
): Promise<{ url: string; width: number }> {
  const scale = 3;
  const F = 12 * scale; // 9pt
  const Fname = Math.round((F * 10) / 9); // 10pt
  const lh = Math.round(F * 1.42);
  const lhName = Math.round(Fname * 1.42);
  const pad = 8 * scale;
  const reg = `${F}px "Times New Roman", Times, serif`;
  const bold = `bold ${F}px "Times New Roman", Times, serif`;
  const boldName = `bold ${Fname}px "Times New Roman", Times, serif`;

  type L = { t: string; font: string; lh: number };
  const lines: L[] = [{ t: f.fullName, font: boldName, lh: lhName }];
  if (f.title) lines.push({ t: f.title, font: reg, lh });
  if (f.englishTitle) lines.push({ t: f.englishTitle, font: reg, lh });
  (f.companyName || '').split('\n').forEach((ln) => {
    if (ln) lines.push({ t: ln, font: bold, lh });
  });

  const cv = document.createElement('canvas');
  const m = cv.getContext('2d')!;
  let maxW = 0;
  lines.forEach((l) => {
    m.font = l.font;
    maxW = Math.max(maxW, m.measureText(l.t).width);
  });
  const W = Math.ceil(maxW + pad * 2);
  let H = pad;
  lines.forEach((l) => {
    H += l.lh;
  });
  H = Math.ceil(H + pad);

  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, W, H);
  c.textBaseline = 'top';
  c.fillStyle = '#000000';
  let y = pad;
  lines.forEach((l) => {
    c.font = l.font;
    c.fillText(l.t, pad, y);
    y += l.lh;
  });

  return { url: cv.toDataURL('image/png'), width: Math.round(W / scale) };
}

/** Türk telefon numarasını biçimlendirir: 5442752525 -> 0544 275 25 25 */
function formatTrPhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('90')) d = '0' + d.slice(2);
  else if (d.length === 10) d = '0' + d;
  if (d.length === 11 && d.startsWith('0')) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
  }
  return raw;
}

export default function EmailSignatures() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
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
    mobile: '',
    email: '',
    website: PRESETS.lokum.website,
  });

  const [format, setFormat] = useState<'full' | 'compact'>('full');
  const [rawMode, setRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bulkIds, setBulkIds] = useState<number[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [personImg, setPersonImg] = useState<{ url: string; width: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, lRes, cRes] = await Promise.all([
          api.get('/Personnel'),
          api.get('/signature-locations').catch(() => ({ data: [] })),
          api.get('/Companies').catch(() => ({ data: [] })),
        ]);
        setPersonnel(pRes.data || []);
        setLocations(lRes.data || []);
        setCompanies(cRes.data || []);
      } catch (e) {
        console.error('Veri yükleme hatası:', e);
      }
    })();
  }, []);

  const set = (k: keyof SigFields, v: string) =>
    setFields((prev) => ({ ...prev, [k]: v }));

  const detectCompany = (companyName: string): CompanyKey =>
    /ogaş|ogas/i.test(companyName || '') ? 'ogas' : 'lokum';

  // Seçilen firma şablonuna karşılık gelen Firma kaydını bul
  const matchCompany = (key: CompanyKey) =>
    companies.find((c) => {
      const n = `${c.name ?? ''} ${c.companyName ?? ''}`.toLowerCase();
      return key === 'ogas' ? /oga[sş]/i.test(n) : /lokum/i.test(n);
    });

  // Firma kaydının adresini adres satırlarına böl
  const companyAddressLines = (key: CompanyKey) => {
    const c = matchCompany(key);
    if (!c?.address) return null;
    const parts = String(c.address)
      .split(/\r?\n/)
      .map((x: string) => x.trim())
      .filter(Boolean);
    return { addressLine1: parts[0] ?? '', addressLine2: parts.slice(1).join(', ') };
  };

  const fieldsForPersonnel = (p: any): SigFields => {
    const company = detectCompany(p.companyName);
    const loc = locations.find((l) => l.id === p.signatureLocationId);
    const addr = companyAddressLines(company);
    return {
      company,
      greeting: GREETING_DEFAULT,
      fullName: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
      title: p.title ?? '',
      englishTitle: p.englishTitle ?? '',
      companyName: PRESETS[company].companyDisplayName,
      city: loc?.displayName ?? loc?.name ?? '',
      addressLine1: addr?.addressLine1 ?? loc?.addressLine1 ?? '',
      addressLine2: addr?.addressLine2 ?? loc?.addressLine2 ?? '',
      phone: formatTrPhone(
        (company === 'ogas' ? loc?.ogasPhone : loc?.lokumPhone) ?? p.phone ?? '',
      ),
      mobile: '',
      email: p.email ?? '',
      website: PRESETS[company].website,
    };
  };

  const onSelectPersonnel = (idStr: string) => {
    const id = idStr ? Number(idStr) : '';
    setSelectedId(id);
    if (!id) return;
    const p = personnel.find((x) => x.id === id);
    if (!p) return;
    setFields(fieldsForPersonnel(p));
    setRawMode(false);
  };

  const onChangeCompany = (company: CompanyKey) => {
    const addr = companyAddressLines(company);
    setFields((prev) => ({
      ...prev,
      company,
      website: PRESETS[company].website,
      companyName: PRESETS[company].companyDisplayName,
      ...(addr ?? {}),
    }));
  };

  // Kişi/alanlar değişince bilgi bloğunu otomatik PNG'ye çevir
  useEffect(() => {
    let cancelled = false;
    (format === 'compact'
      ? renderCompactPng(fields)
      : renderPersonnelPng(fields)
    )
      .then((img) => {
        if (!cancelled) setPersonImg(img);
      })
      .catch(() => {
        if (!cancelled) setPersonImg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [fields, format]);

  const generatedHtml = useMemo(
    () =>
      format === 'compact'
        ? buildCompactHtml(fields, personImg ?? undefined)
        : buildSignatureHtml(fields, personImg ?? undefined),
    [fields, personImg, format],
  );
  const previewHtml = rawMode ? rawHtml : generatedHtml;

  const enterRawMode = () => {
    setRawHtml(generatedHtml);
    setRawMode(true);
  };
  const backToForm = () => setRawMode(false);

  const handleCopy = async () => {
    try {
      const inner = rawMode ? rawHtml : generatedHtml;
      const embedded = await embedImages(inner);
      const plain = embedded.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([embedded], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Kopyalama hatası:', e);
      alert('Panoya kopyalanamadı. Tarayıcı izni gerekebilir veya HTTPS gerekebilir.');
    }
  };

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

  const buildDoc = async (flds: SigFields): Promise<string> => {
    const img =
      format === 'compact'
        ? await renderCompactPng(flds)
        : await renderPersonnelPng(flds);
    const inner =
      format === 'compact'
        ? buildCompactHtml(flds, img)
        : buildSignatureHtml(flds, img);
    const embedded = await embedImages(inner);
    return `<html>\n<head>\n<meta charset="utf-8">\n<title>Imza</title>\n</head>\n<body style="margin:0;padding:0;">\n${embedded}\n</body>\n</html>`;
  };

  const toggleBulk = (id: number) =>
    setBulkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const allBulkSelected =
    personnel.length > 0 && bulkIds.length === personnel.length;
  const toggleAllBulk = () =>
    setBulkIds(allBulkSelected ? [] : personnel.map((p) => p.id));

  const handleBulk = async () => {
    if (bulkIds.length === 0) return;
    setBulkBusy(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const id of bulkIds) {
        const p = personnel.find((x) => x.id === id);
        if (!p) continue;
        const flds = fieldsForPersonnel(p);
        const doc = await buildDoc(flds);
        const safe = (flds.fullName || 'imza').replace(/[^\p{L}\p{N}]+/gu, '_');
        zip.file(`${PRESETS[flds.company].label}_${safe}.htm`, doc);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imzalar_${format === 'compact' ? 'kisa' : 'tam'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Toplu üretim hatası:', e);
      alert('Toplu üretim sırasında hata oluştu. Konsolu kontrol edin.');
    } finally {
      setBulkBusy(false);
    }
  };

  const field = (
    label: string,
    key: keyof SigFields,
    opts: { textarea?: boolean; col?: string; format?: (v: string) => string } = {},
  ) => (
    <div className={`${opts.col ?? 'col-md-6'} mb-2`}>
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
          onBlur={
            opts.format
              ? (e) => set(key, opts.format!(e.target.value))
              : undefined
          }
        />
      )}
    </div>
  );

  return (
    <>
      <Header title="Mail İmzaları" subtitle="Mail İmza Oluşturma ve Düzenleme" />
      <div className="main-content">
        <div className="page-header">
          <h5 className="page-title">✍️ MAIL İMZA DÜZENLEYİCİ</h5>
        </div>

      <div className="row g-4">
        {/* ÜST: Düzenleme paneli */}
        <div className="col-12 mb-4">
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

            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
                İMZA FORMATI
              </label>
              <div className="btn-group w-100">
                {([['full', 'Tam İmza'], ['compact', 'Kısa İmza']] as [
                  'full' | 'compact',
                  string,
                ][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    className={`btn btn-sm ${format === val ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFormat(val)}
                  >
                    {label}
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
              <div className="row g-2">
                {field('Selamlama', 'greeting', { col: 'col-12' })}
                {field('Ad Soyad', 'fullName')}
                {field('Unvan', 'title')}
                {field('İngilizce Unvan', 'englishTitle')}
                {field('Şehir / Lokasyon', 'city')}
                {field('Firma Adı (metin)', 'companyName', { textarea: true, col: 'col-12' })}
                {field('Adres Satır 1', 'addressLine1', { textarea: true, col: 'col-12' })}
                {field('Adres Satır 2', 'addressLine2', { textarea: true, col: 'col-12' })}
                {field('Sabit Telefon', 'phone', { format: formatTrPhone })}
                {field('Cep Telefonu', 'mobile', { format: formatTrPhone })}
                {field('Web Sitesi', 'website')}
              </div>
            )}

            <div className="d-flex gap-2 mt-3">
              <button
                className={`btn ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Kopyalandı' : '📋 Panoya kopyala'}
              </button>
              <button
                className="btn btn-success"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'İndiriliyor…' : '⬇️ .htm olarak indir'}
              </button>
            </div>
          </div>
        </div>

        {/* Toplu üretim */}
        <div className="col-12 mb-4">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong style={{ fontSize: 13 }}>👥 TOPLU İMZA ÜRETİMİ</strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Format: {format === 'compact' ? 'Kısa' : 'Tam'}
              </span>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="bulk-all"
                checked={allBulkSelected}
                onChange={toggleAllBulk}
              />
              <label
                className="form-check-label"
                htmlFor="bulk-all"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                Tümünü seç ({bulkIds.length}/{personnel.length})
              </label>
            </div>
            <div
              style={{
                maxHeight: 220,
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                padding: 8,
              }}
            >
              {personnel.map((p) => (
                <div className="form-check" key={p.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`bulk-${p.id}`}
                    checked={bulkIds.includes(p.id)}
                    onChange={() => toggleBulk(p.id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`bulk-${p.id}`}
                    style={{ fontSize: 12 }}
                  >
                    {p.firstName} {p.lastName}
                    {p.companyName ? ` — ${p.companyName}` : ''}
                  </label>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={handleBulk}
              disabled={bulkBusy || bulkIds.length === 0}
            >
              {bulkBusy
                ? 'Üretiliyor…'
                : `⬇️ Seçilenleri ZIP indir (${bulkIds.length})`}
            </button>
          </div>
        </div>

        {/* ALT: Canlı önizleme */}
        <div className="col-12">
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
    </>
  );
}
