/* ------------------------------------------------------------------ */
/*  Firma ön ayarları (logo, kampanya görselleri, web sitesi, uyarı)  */
/* ------------------------------------------------------------------ */

export type CompanyKey = 'lokum' | 'ogas';

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
const LOKUM_LEGAL_FIRST =
  '“LOKUM ATÖLYESİ ŞEKERLEME GIDA TURİZM İNŞ. HAYV. SAN. VE TİC. A.Ş.';

export const PRESETS: Record<CompanyKey, CompanyPreset> = {
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

export const GREETING_DEFAULT = 'Saygılar Sunar, İşlerinizde Başarılar Dileriz.';

/* ------------------------------------------------------------------ */
/*  Yardımcılar                                                     */
/* ------------------------------------------------------------------ */

export interface AssetOverride {
  logo?: { url: string; width: number; ox: number; oy: number };
  banners?: { url: string; width: number; ox: number; oy: number }[];
  efatura?: { url: string; width: number; ox: number; oy: number };
}

export interface SigFields {
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

/** Punto ayarı yapılabilen alanlar. */
export type FieldKey =
  | 'greeting'
  | 'fullName'
  | 'title'
  | 'englishTitle'
  | 'companyName'
  | 'city'
  | 'addressLine1'
  | 'addressLine2'
  | 'phone'
  | 'mobile'
  | 'website';

const STYLE_KEY = 'signatureStyle';
export interface SigStyle {
  font: string;
  size: number;
  discSize: number;
  /** Alan bazlı özel punto (pt). Verilmezse genel `size` kullanılır. */
  fieldSizes?: Partial<Record<FieldKey, number>>;
}
const DEFAULT_STYLE: SigStyle = {
  font: "'Times New Roman', Times, serif",
  size: 9,
  discSize: 7,
  fieldSizes: {},
};
let STYLE: SigStyle = (() => {
  try {
    const r =
      typeof localStorage !== 'undefined' ? localStorage.getItem(STYLE_KEY) : null;
    if (r) return { ...DEFAULT_STYLE, ...JSON.parse(r) };
  } catch {
    /* yoksay */
  }
  return { ...DEFAULT_STYLE };
})();
export function getSignatureStyle(): SigStyle {
  return STYLE;
}
export function setSignatureStyle(s: Partial<SigStyle>): void {
  STYLE = { ...STYLE, ...s };
  try {
    localStorage.setItem(STYLE_KEY, JSON.stringify(STYLE));
  } catch {
    /* yoksay */
  }
}

/** Bir alanın efektif puntosunu döndürür (özel yoksa genel). */
const sz = (k: FieldKey): number => STYLE.fieldSizes?.[k] ?? STYLE.size;

const esc = (s: string) =>
  (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const row = (label: string, value: string, fontSize?: number) =>
  value
    ? `<div style="margin:1px 0;${fontSize ? `font-size:${fontSize}pt;` : ''}">${label ? `<span>${esc(label)}</span> ` : ''}${esc(value)}</div>`
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

/** Kısa imza: sadece selamlama + isim + unvan + İngilizce unvan + firma. */
export function buildCompactHtml(
  f: SigFields,
  img?: { url: string; width: number },
): string {
  const nameSize = STYLE.fieldSizes?.fullName ?? (STYLE.size + 1);
  const body = img
    ? `<img src="${img.url}" width="${img.width}" alt="İmza" style="display:block;border:none;" />`
    : `<div style="font-size:${nameSize}pt;font-weight:bold;">${esc(f.fullName)}</div>
  ${f.title ? `<div style="font-size:${sz('title')}pt;">${esc(f.title)}</div>` : ''}
  ${f.englishTitle ? `<div style="font-size:${sz('englishTitle')}pt;">${esc(f.englishTitle)}</div>` : ''}
  ${f.companyName ? `<div style="font-size:${sz('companyName')}pt;font-weight:bold;">${esc(f.companyName).replace(/\n/g, '<br />')}</div>` : ''}`;
  return `<div style="font-family:${STYLE.font};font-size:${STYLE.size}pt;color:#000000;line-height:1.35;margin:0;padding:0;text-align:left;">
  <p style="margin:0 0 14px 0;font-size:${sz('greeting')}pt;">${esc(f.greeting)}</p>
  ${body}
</div>`;
}

export function buildSignatureHtml(
  f: SigFields,
  personImg?: { url: string; width: number },
  ov?: AssetOverride,
): string {
  const p = PRESETS[f.company];
  const logoA = ov?.logo ?? { url: p.logo, width: p.logoWidth, ox: 0, oy: 0 };
  const bannersList =
    ov?.banners ?? p.banners.map((b) => ({ url: b, width: 220, ox: 0, oy: 0 }));
  const efat = ov?.efatura ?? { url: p.efatura, width: 130, ox: 0, oy: 0 };
  const websiteHref =
    f.website.startsWith('http') ? f.website : `https://${f.website}`;

  const legalNames =
    f.company === 'lokum' ? [LOKUM_LEGAL, LOKUM_LEGAL_FIRST] : [OGAS_LEGAL];
  const discTr = boldNames(esc(p.disclaimerTr), legalNames);
  const discEn = boldNames(esc(p.disclaimerEn), legalNames);

  const bannerCells = bannersList
    .map(
      (b) =>
        `<td style="padding:0 12px 0 0;vertical-align:top;"><img src="${b.url}" width="${b.width}" alt="Kampanya" style="display:block;border:none;margin:${b.oy}px 0 0 ${b.ox}px;" /></td>`,
    )
    .join('');

  const infoCells = personImg
    ? `<td style="vertical-align:top;">${f.website ? `<a href="${websiteHref}" target="_blank" rel="noopener" style="text-decoration:none;border:none;">` : ''}<img src="${personImg.url}" width="${personImg.width}" alt="Personel Bilgileri" style="display:block;border:none;" />${f.website ? '</a>' : ''}</td>`
    : `<td style="vertical-align:top;padding:2px 16px 2px 0;word-break:break-word;overflow-wrap:break-word;">
        <div style="font-size:${sz('fullName')}pt;font-weight:bold;">${esc(f.fullName)}</div>
        ${f.title ? `<div style="font-size:${sz('title')}pt;">${esc(f.title)}</div>` : ''}
        ${f.englishTitle ? `<div style="font-size:${sz('englishTitle')}pt;">${esc(f.englishTitle)}</div>` : ''}
        ${f.companyName ? `<div style="font-size:${sz('companyName')}pt;font-weight:bold;margin-top:4px;">${esc(f.companyName).replace(/\n/g, '<br />')}</div>` : ''}
      </td>
      <td style="vertical-align:top;border-left:1px solid #cccccc;padding:2px 0 2px 16px;word-break:break-word;overflow-wrap:break-word;">
        ${f.city ? `<div style="font-size:${sz('city')}pt;font-weight:bold;margin-bottom:2px;">${esc(f.city)}</div>` : ''}
        ${row('Adres:', f.addressLine1, sz('addressLine1'))}
        ${row('', f.addressLine2, sz('addressLine2'))}
        ${row('Sabit:', f.phone, sz('phone'))}
        ${f.website ? `<div style="margin-top:2px;font-size:${sz('website')}pt;"><a href="${esc(websiteHref)}" style="color:#000000;text-decoration:none;">${esc(f.website)}</a></div>` : ''}
      </td>`;

  return `<div style="font-family:${STYLE.font};font-size:${STYLE.size}pt;color:#000000;line-height:1.35;margin:0;padding:0;text-align:left;max-width:920px;">
  <p style="margin:0 0 14px 0;font-size:${sz('greeting')}pt;">${esc(f.greeting)}</p>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:700px;font-family:${STYLE.font};">
    <tr>
      <td style="vertical-align:${p.logoValign};padding-right:4px;">
        <img src="${logoA.url}" width="${logoA.width}" alt="${esc(p.label)}" style="display:block;border:none;margin:${logoA.oy}px 0 0 ${logoA.ox}px;" />
      </td>
      ${infoCells}
    </tr>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;line-height:0;"><tr><td style="height:14px;line-height:14px;font-size:1px;">&nbsp;</td></tr></table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>${bannerCells}<td style="vertical-align:middle;padding:0 0 0 4px;"><img src="${efat.url}" width="${efat.width}" alt="E-Fatura" style="display:block;border:none;margin:${efat.oy}px 0 0 ${efat.ox}px;" /></td></tr>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;line-height:0;"><tr><td style="height:14px;line-height:14px;font-size:1px;">&nbsp;</td></tr></table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:700px;">
    <tr>
      <td style="border:1px solid #000000;padding:8px;font-family:${STYLE.font};font-size:${STYLE.discSize}pt;color:#000000;line-height:1.35;word-break:break-word;overflow-wrap:break-word;">
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
export async function embedImages(html: string): Promise<string> {
  const paths = Array.from(
    new Set((html.match(/\/(?:logos|signatures\/uploads)\/[^"')\s]+/g) || [])),
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

function loadIcon(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

/** Kişi bilgisi bölümünü Canvas ile PNG'ye çizer (alan bazlı puntoyu uygular). */
export async function renderPersonnelPng(
  f: SigFields,
): Promise<{ url: string; width: number }> {
  const scale = 4;
  const px = (pt: number) => Math.round((pt * 4) / 3) * scale; // pt -> ölçekli px
  const lhOf = (pxSize: number) => Math.round(pxSize * 1.42);
  const fontOf = (pt: number, bold: boolean) => {
    const p = px(pt);
    return {
      font: `${bold ? 'bold ' : ''}${p}px ${STYLE.font}`,
      fSize: p,
      lh: lhOf(p),
    };
  };

  const pad = 8 * scale;
  const divGap = 16 * scale;
  const iconGap = Math.round(6 * scale);
  const gapH = Math.round(4 * scale);
  const maxCol = 250 * scale;

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
    fSize: number;
    lh: number;
    offset: number;
    icon?: HTMLImageElement | null;
    gap?: boolean;
  };

  // SOL sütun kaynak listesi
  type LeftSrc =
    | { key: FieldKey; text: string; bold?: boolean }
    | { gap: true };
  const leftSrc: LeftSrc[] = [{ key: 'fullName', text: f.fullName, bold: true }];
  if (f.title) leftSrc.push({ key: 'title', text: f.title });
  if (f.englishTitle) leftSrc.push({ key: 'englishTitle', text: f.englishTitle });
  leftSrc.push({ gap: true });
  (f.companyName || '').split('\n').forEach((ln) => {
    if (ln) leftSrc.push({ key: 'companyName', text: ln, bold: true });
  });

  const leftRender: RL[] = [];
  for (const it of leftSrc) {
    if ('gap' in it) {
      leftRender.push({ t: '', font: '', fSize: 0, lh: gapH, offset: 0, gap: true });
      continue;
    }
    const fo = fontOf(sz(it.key), it.bold || false);
    wrap(it.text, fo.font, maxCol).forEach((sub) =>
      leftRender.push({
        t: sub,
        font: fo.font,
        fSize: fo.fSize,
        lh: fo.lh,
        offset: 0,
      }),
    );
  }

  // SAĞ sütun kaynak listesi (ikonlu; uzun satırlar sarılır)
  type RightSrc = {
    key: FieldKey;
    text: string;
    bold?: boolean;
    icon?: HTMLImageElement | null;
    indent?: boolean;
  };
  const rightSrc: RightSrc[] = [];
  if (f.city) rightSrc.push({ key: 'city', text: f.city, bold: true });
  if (f.addressLine1) {
    rightSrc.push(
      icLoc
        ? { key: 'addressLine1', text: f.addressLine1, icon: icLoc }
        : { key: 'addressLine1', text: `Adres: ${f.addressLine1}` },
    );
  }
  if (f.addressLine2) {
    rightSrc.push(
      icLoc
        ? { key: 'addressLine2', text: f.addressLine2, indent: true }
        : { key: 'addressLine2', text: f.addressLine2 },
    );
  }
  if (f.phone) {
    rightSrc.push(
      icPhone
        ? { key: 'phone', text: f.phone, icon: icPhone }
        : { key: 'phone', text: `Sabit: ${f.phone}` },
    );
  }
  if (f.mobile) {
    rightSrc.push(
      icMob
        ? { key: 'mobile', text: f.mobile, icon: icMob }
        : { key: 'mobile', text: `Telefon: ${f.mobile}` },
    );
  }
  if (f.website) rightSrc.push({ key: 'website', text: f.website });

  const rightRender: RL[] = [];
  for (const it of rightSrc) {
    const fo = fontOf(sz(it.key), it.bold || false);
    const iconSize = Math.round(fo.fSize * 1.25);
    const offset = it.icon || it.indent ? iconSize + iconGap : 0;
    wrap(it.text, fo.font, maxCol - offset).forEach((sub, i) =>
      rightRender.push({
        t: sub,
        font: fo.font,
        fSize: fo.fSize,
        lh: fo.lh,
        offset,
        icon: i === 0 ? it.icon : undefined,
      }),
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
      y += r.lh;
    });
    return y;
  };
  const H = Math.ceil(Math.max(colH(leftRender), colH(rightRender)) + pad);

  // Ayırıcı çizginin bittiği nokta: son metnin görsel altına yaklaşık
  const lastNonGap = (arr: RL[]): RL | null => {
    for (let i = arr.length - 1; i >= 0; i--) if (!arr[i].gap) return arr[i];
    return null;
  };
  const lastL = lastNonGap(leftRender);
  const lastR = lastNonGap(rightRender);
  const leftBot = colH(leftRender) - (lastL ? lastL.lh - lastL.fSize : 0);
  const rightBot = colH(rightRender) - (lastR ? lastR.lh - lastR.fSize : 0);
  const divBottom = Math.max(leftBot, rightBot);

  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, W, H);
  c.textBaseline = 'top';

  let y = pad;
  for (const r of leftRender) {
    if (r.gap) {
      y += r.lh;
      continue;
    }
    c.fillStyle = '#000000';
    c.font = r.font;
    c.fillText(r.t, pad, y);
    y += r.lh;
  }

  c.strokeStyle = '#cccccc';
  c.lineWidth = Math.max(1, Math.floor(scale / 2));
  c.beginPath();
  c.moveTo(divX + 0.5, pad);
  c.lineTo(divX + 0.5, divBottom);
  c.stroke();

  y = pad;
  for (const r of rightRender) {
    if (r.icon) {
      const iconSize = Math.round(r.fSize * 1.25);
      c.drawImage(
        r.icon,
        rightX,
        y + Math.round((r.fSize - iconSize) / 2),
        iconSize,
        iconSize,
      );
    }
    c.fillStyle = '#000000';
    c.font = r.font;
    c.fillText(r.t, rightX + r.offset, y);
    y += r.lh;
  }

  return { url: cv.toDataURL('image/png'), width: Math.round(W / scale) };
}

/** Kısa imza bloğunu Canvas ile PNG'ye çizer (alan bazlı puntoyu uygular). */
export async function renderCompactPng(
  f: SigFields,
): Promise<{ url: string; width: number }> {
  const scale = 4;
  const px = (pt: number) => Math.round((pt * 4) / 3) * scale;
  const lhOf = (pxSize: number) => Math.round(pxSize * 1.42);
  const fontOf = (pt: number, bold: boolean) => {
    const p = px(pt);
    return {
      font: `${bold ? 'bold ' : ''}${p}px ${STYLE.font}`,
      lh: lhOf(p),
    };
  };
  const pad = 8 * scale;

  // fullName için özel: kullanıcı özel punto verdiyse onu kullan;
  // aksi halde varsayılan davranış (genel puntonun 1pt üstü) korunur.
  const nameSizePt = STYLE.fieldSizes?.fullName ?? (STYLE.size + 1);

  type L = { t: string; font: string; lh: number };
  const lines: L[] = [];
  { const fo = fontOf(nameSizePt, true); lines.push({ t: f.fullName, font: fo.font, lh: fo.lh }); }
  if (f.title) { const fo = fontOf(sz('title'), false); lines.push({ t: f.title, font: fo.font, lh: fo.lh }); }
  if (f.englishTitle) { const fo = fontOf(sz('englishTitle'), false); lines.push({ t: f.englishTitle, font: fo.font, lh: fo.lh }); }
  (f.companyName || '').split('\n').forEach((ln) => {
    if (ln) { const fo = fontOf(sz('companyName'), true); lines.push({ t: ln, font: fo.font, lh: fo.lh }); }
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
  lines.forEach((l) => { H += l.lh; });
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
export function formatTrPhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('90')) d = '0' + d.slice(2);
  else if (d.length === 10) d = '0' + d;
  if (d.length === 11 && d.startsWith('0')) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
  }
  return raw;
}

/* ------------------------------------------------------------------ */
/*  Personelden imza alanları + panoya kopyalama (paylaşılan)         */
/* ------------------------------------------------------------------ */

export function detectCompany(companyName: string): CompanyKey {
  return /ogaş|ogas/i.test(companyName || '') ? 'ogas' : 'lokum';
}

export function companyAddressLines(
  companies: any[],
  key: CompanyKey,
): { addressLine1: string; addressLine2: string } | null {
  const c = companies.find((x) => {
    const n = `${x.name ?? ''} ${x.companyName ?? ''}`.toLowerCase();
    return key === 'ogas' ? /oga[sş]/i.test(n) : /lokum/i.test(n);
  });
  if (!c?.address) return null;
  const parts = String(c.address)
    .split(/\r?\n/)
    .map((x: string) => x.trim())
    .filter(Boolean);
  return { addressLine1: parts[0] ?? '', addressLine2: parts.slice(1).join(', ') };
}

export function fieldsForPersonnel(
  p: any,
  locations: any[],
  companies: any[],
): SigFields {
  const company = detectCompany(p.companyName);
  const loc = locations.find((l) => l.id === p.signatureLocationId);
  const addr = companyAddressLines(companies, company);
  const branchAddress = p.branchAddress ? String(p.branchAddress) : '';
  return {
    company,
    greeting: GREETING_DEFAULT,
    fullName: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
    title: p.title ?? '',
    englishTitle: p.englishTitle ?? '',
    companyName: PRESETS[company].companyDisplayName,
    city: p.branchName ?? loc?.displayName ?? loc?.name ?? '',
    addressLine1: branchAddress || addr?.addressLine1 || loc?.addressLine1 || '',
    addressLine2: branchAddress ? '' : (addr?.addressLine2 ?? loc?.addressLine2 ?? ''),
    phone: formatTrPhone(
      p.branchPhone ||
        (company === 'ogas' ? loc?.ogasPhone : loc?.lokumPhone) ||
        p.phone ||
        '',
    ),
    mobile: '',
    email: p.email ?? '',
    website: PRESETS[company].website,
  };
}

export async function buildSignatureInner(
  fields: SigFields,
  format: 'full' | 'compact',
  ov?: AssetOverride,
): Promise<string> {
  const img =
    format === 'compact'
      ? await renderCompactPng(fields)
      : await renderPersonnelPng(fields);
  const inner =
    format === 'compact'
      ? buildCompactHtml(fields, img)
      : buildSignatureHtml(fields, img, ov);
  return embedImages(inner);
}

/** Yüklenen görsellerden firmaya özel override üretir. */
export function assetOverrides(assets: any[], company: CompanyKey): AssetOverride {
  const forCo = (Array.isArray(assets) ? assets : []).filter(
    (a) => a.company === company && a.isActive,
  );
  const pick = (kind: string) =>
    forCo.filter((a) => a.kind === kind).sort((a, b) => a.sortOrder - b.sortOrder);
  const logo = pick('logo')[0];
  const efatura = pick('efatura')[0];
  const banners = pick('banner');
  return {
    logo: logo ? { url: logo.url, width: logo.width, ox: logo.offsetX || 0, oy: logo.offsetY || 0 } : undefined,
    efatura: efatura ? { url: efatura.url, width: efatura.width, ox: efatura.offsetX || 0, oy: efatura.offsetY || 0 } : undefined,
    banners: banners.length
      ? banners.map((b) => ({ url: b.url, width: b.width, ox: b.offsetX || 0, oy: b.offsetY || 0 }))
      : undefined,
  };
}

export async function copyHtmlToClipboard(embedded: string): Promise<void> {
  const plain = embedded.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([embedded], { type: 'text/html' }),
      'text/plain': new Blob([plain], { type: 'text/plain' }),
    }),
  ]);
}

function loadAnyImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src.startsWith('data:') ? src : encodeURI(src);
  });
}

/** Logo + kişi bilgisi + banner + e-fatura'yı TEK bir PNG'ye çizer. */
export async function renderCombinedImage(
  fields: SigFields,
  ov?: AssetOverride,
): Promise<{ url: string; width: number }> {
  const p = PRESETS[fields.company];
  const logoA = ov?.logo ?? { url: p.logo, width: p.logoWidth, ox: 0, oy: 0 };
  const bannersList =
    ov?.banners ?? p.banners.map((b) => ({ url: b, width: 220, ox: 0, oy: 0 }));
  const efat = ov?.efatura ?? { url: p.efatura, width: 130, ox: 0, oy: 0 };

  const info = await renderPersonnelPng(fields);
  const [infoImg, logoImg, efatImg, ...bannerImgs] = await Promise.all([
    loadAnyImage(info.url),
    loadAnyImage(logoA.url),
    loadAnyImage(efat.url),
    ...bannersList.map((b) => loadAnyImage(b.url)),
  ]);

  const dispH = (img: HTMLImageElement | null, w: number) =>
    img && img.naturalWidth ? (img.naturalHeight * w) / img.naturalWidth : 0;

  const ratios: number[] = [2];
  if (infoImg?.naturalWidth) ratios.push(infoImg.naturalWidth / info.width);
  if (logoImg?.naturalWidth) ratios.push(logoImg.naturalWidth / logoA.width);
  bannerImgs.forEach((im, i) => {
    if (im?.naturalWidth) ratios.push(im.naturalWidth / bannersList[i].width);
  });
  if (efatImg?.naturalWidth) ratios.push(efatImg.naturalWidth / efat.width);
  const SC = Math.min(8, Math.max(3, Math.ceil(Math.max(...ratios))));

  const gapLogo = 4;
  const infoH = dispH(infoImg, info.width);
  const logoH = dispH(logoImg, logoA.width);
  const logoX = Math.max(0, logoA.ox);
  const logoY = Math.max(0, logoA.oy);
  const infoX = logoX + logoA.width + gapLogo;
  const row1W = infoX + info.width;
  const row1H = Math.max(logoY + logoH, infoH);

  const marginRow2 = 14;
  const y2 = row1H + marginRow2;
  const row2: { img: HTMLImageElement | null; x: number; y: number; w: number; h: number }[] = [];
  let x = 0;
  bannerImgs.forEach((im, i) => {
    const w = bannersList[i].width;
    const h = dispH(im, w);
    x += Math.max(0, bannersList[i].ox);
    row2.push({ img: im, x, y: y2 + Math.max(0, bannersList[i].oy), w, h });
    x += w + 12;
  });
  const efW = efat.width;
  const efH = dispH(efatImg, efW);
  x += 4 + Math.max(0, efat.ox);
  row2.push({ img: efatImg, x, y: y2 + Math.max(0, efat.oy), w: efW, h: efH });
  const row2Right = x + efW;
  const row2Bottom = Math.max(y2, ...row2.map((r) => r.y + r.h));

  const W = Math.ceil(Math.max(row1W, row2Right));
  const H = Math.ceil(Math.max(row1H, row2Bottom));

  const cv = document.createElement('canvas');
  cv.width = Math.max(1, W * SC);
  cv.height = Math.max(1, H * SC);
  const c = cv.getContext('2d')!;
  c.scale(SC, SC);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, W, H);

  if (logoImg) c.drawImage(logoImg, logoX, logoY, logoA.width, logoH);
  if (infoImg) c.drawImage(infoImg, infoX, 0, info.width, infoH);
  for (const r of row2) {
    if (r.img) c.drawImage(r.img, r.x, r.y, r.w, r.h);
  }

  return { url: cv.toDataURL('image/png'), width: W };
}

/** Tek görsel imza HTML'i: greeting + tek PNG + yasal uyarı (metin). */
export function buildSingleImageHtml(
  f: SigFields,
  combined: { url: string; width: number },
): string {
  const p = PRESETS[f.company];
  const legalNames =
    f.company === 'lokum' ? [LOKUM_LEGAL, LOKUM_LEGAL_FIRST] : [OGAS_LEGAL];
  const discTr = boldNames(esc(p.disclaimerTr), legalNames);
  const discEn = boldNames(esc(p.disclaimerEn), legalNames);
  return `<div style="font-family:${STYLE.font};font-size:${STYLE.size}pt;color:#000000;line-height:1.35;margin:0;padding:0;text-align:left;max-width:920px;">
  <p style="margin:0 0 14px 0;font-size:${sz('greeting')}pt;">${esc(f.greeting)}</p>
  <img src="${combined.url}" width="${combined.width}" alt="İmza" style="display:block;border:none;" />
  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;line-height:0;"><tr><td style="height:14px;line-height:14px;font-size:1px;">&nbsp;</td></tr></table>

  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:700px;">
    <tr>
      <td style="border:1px solid #000000;padding:8px;font-family:${STYLE.font};font-size:${STYLE.discSize}pt;color:#000000;line-height:1.35;word-break:break-word;overflow-wrap:break-word;">
        <b>YASAL UYARI</b><br />${discTr}<br /><br />
        <b>DISCLAIMER</b><br />${discEn}
      </td>
    </tr>
  </table>
</div>`;
}

/** Outlook imzası paketi: resimler göreli yolla (baseName_files/), Outlook gönderirken cid gömer. */
export async function buildOutlookPackage(
  fields: SigFields,
  format: 'full' | 'compact',
  ov: AssetOverride | undefined,
  baseName: string,
): Promise<{ htm: string; files: { name: string; blob: Blob }[] }> {
  const img =
    format === 'compact'
      ? await renderCompactPng(fields)
      : await renderPersonnelPng(fields);
  const inner =
    format === 'compact'
      ? buildCompactHtml(fields, img)
      : buildSignatureHtml(fields, img, ov);

  const srcs: string[] = [];
  const re = /src="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner))) {
    if (!srcs.includes(m[1])) srcs.push(m[1]);
  }

  const files: { name: string; blob: Blob }[] = [];
  const map = new Map<string, string>();
  let i = 0;
  for (const src of srcs) {
    let blob: Blob | null = null;
    try {
      if (src.startsWith('data:')) {
        blob = await (await fetch(src)).blob();
      } else if (src.startsWith('/')) {
        blob = await (await fetch(encodeURI(src))).blob();
      }
    } catch {
      blob = null;
    }
    if (!blob) continue;
    let ext = (blob.type.split('/')[1] || 'png').toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';
    i += 1;
    const fname = `image${String(i).padStart(3, '0')}.${ext}`;
    files.push({ name: fname, blob });
    map.set(src, `${baseName}_files/${fname}`);
  }

  let out = inner;
  for (const [src, rel] of map) {
    out = out.split(`src="${src}"`).join(`src="${rel}"`);
  }
  const htm = `<html>\n<head>\n<meta charset="utf-8">\n<title>Imza</title>\n</head>\n<body style="margin:0;padding:0;">\n${out}\n</body>\n</html>`;
  return { htm, files };
}

export async function copyPersonnelSignature(
  p: any,
  locations: any[],
  companies: any[],
  format: 'full' | 'compact' = 'full',
  assets: any[] = [],
): Promise<void> {
  const fields = fieldsForPersonnel(p, locations, companies);
  const ov = assetOverrides(assets, fields.company);
  const embedded = await buildSignatureInner(fields, format, ov);
  await copyHtmlToClipboard(embedded);
}