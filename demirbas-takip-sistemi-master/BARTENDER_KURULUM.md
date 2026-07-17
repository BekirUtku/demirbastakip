# BarTender Etiket Yazdirma Kurulumu

## Onkosullar
- BarTender (Starter surumu yeterli — Automation gerekmez)
- TSC etiket yazicisi, Windows'a kurulu ve "Aygit ve Yazicilar"da gorunuyor
- TSC driver versiyonu: 12.3 (zaten kurulu)
- Etiket yazicisi ag uzerinden paylasimli

## Adim 1 — Sablon Klasoru Olustur

Sabit bir konum belirle (orn. `C:\BarTender\DemirbasEtiket\`).
Indirilen CSV dosyalarini her seferinde **ayni isimle** bu klasore kaydetmek BarTender'i kolaylastirir.

> Tarayici varsayilan olarak `Indirilenler` klasorune kaydeder. Tarayici ayarlarindan
> her indirmede konum sormasini veya dogrudan `C:\BarTender\DemirbasEtiket\`
> klasorune kaydetmesini sagla.

## Adim 2 — Etiket Tasarimi (.btw olusturma)

1. BarTender'i ac → **File → New** → **Blank Template**
2. Etiket boyutunu yazicinin yukledigi etiket boyutuyla eslestir (orn. 50x30mm). Yazici: **TSC** sec.
3. **File → Database Connection Setup** (veya Veritabani simgesi)
4. **Add** → **Text File** → **Next**
5. Dosya yolu: indirdigin CSV'yi sec (orn. `C:\BarTender\DemirbasEtiket\barkod_toplu_xxx.csv`)
6. **File Format:**
   - Field Delimiter: **Comma**
   - Text Qualifier: **Double Quote**
   - **First row contains field names** isaretli olmali
   - Code Page / Encoding: **65001 (UTF-8)** sec
7. **Next → Finish**

## Adim 3 — Etikete Barkod Ekle

1. Arac cubugundan **Barcode** simgesini sec → etiket uzerine tikla
2. **Symbology:** Code 128
3. Cift tikla → **Data Source** → **Database Field** → `Barcode` kolonunu sec
4. **Human Readable:**
   - "Show human readable text" isaretli olmali
   - Font: Arial 10pt (veya tercih)
   - Position: Below barcode

## Adim 4 — Yazici Secimi

1. **File → Print Setup**
2. Printer: TSC yazicini sec
3. Kagit boyutu otomatik gelecek

## Adim 5 — Sablonu Kaydet

`File → Save As` → `C:\BarTender\DemirbasEtiket\demirbas_etiket.btw`

## Adim 6 — Gunluk Kullanim

1. Sistemden **Yazdir** (tek satir) veya **Secilenler Yazdir** (coklu) butonuna tikla
2. CSV inince `demirbas_etiket.btw`'yi ac (zaten aciksa, **Database → Refresh** veya `F5`)
3. **Ctrl+P** → kac etiket basilacagi gorunur (CSV'deki satir sayisi kadar)
4. **Print** → biter

## Sorun Giderme

**Turkce karakter bozuk cikiyor:**
- Database Connection Setup'ta Code Page **65001 (UTF-8)** olmali

**Barkod bos geliyor:**
- Veri kaynagi dogru kolona bagli mi? (`Database Field → Barcode`)
- CSV'nin ilk satiri header (`Barcode`) olmali

**Eski veriyi yazdirilyor:**
- BarTender'i yeniden baslat veya **Database → Refresh** (F5)

**Sadece bir etiket basiyor (toplu yazdirmada):**
- Print diyalogunda **"Print all records"** veya **"Serial Numbers from Database"** secili olmali,
  "Identical Copies" degil
