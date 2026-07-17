using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace DemirbasTakip.Api.Services.Implementations;

public class EmailSignatureService : IEmailSignatureService
{
    private readonly AppDbContext _context;

    public EmailSignatureService(AppDbContext context)
    {
        _context = context;
    }


    public async Task<EmailSignaturePreviewDto> PreviewAsync(
        int personnelId,
        CancellationToken cancellationToken = default)
    {
        var personnel = await _context.Personnel
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Department)
            .Include(x => x.SignatureLocation)
            .FirstOrDefaultAsync(
                x => x.Id == personnelId,
                cancellationToken);


        if (personnel == null)
        {
            throw new Exception("Personel bulunamadı.");
        }


        var companyName = personnel.Company.CompanyName;

        var isOgas = companyName.Contains(
            "OGAŞ",
            StringComparison.OrdinalIgnoreCase);


        var fullName =
            $"{personnel.FirstName} {personnel.LastName}";


        var logoPath = isOgas
            ? "/logos/ogas.png"
            : "/logos/lokum_atolyesi.png";


        var location = personnel.SignatureLocation;


        var phone = isOgas
            ? location?.OgasPhone
            : location?.LokumPhone;



        var html = $@"

<table width='900'
cellpadding='0'
cellspacing='0'
style='font-family:Arial;border-collapse:collapse;'>


<tr>


<td width='180'
align='center'>

<img
src='http://localhost:5173{logoPath}'
width='150'
/>

</td>



<td width='330'
style='border-left:1px solid #999;padding-left:15px;line-height:16px;'>


<b style='font-size:15px;'>
{fullName}
</b>

<br/>

<span style='font-size:12px;'>
{personnel.Title}
</span>

<br/>

<span style='font-size:11px;color:#555;'>
{personnel.EnglishTitle}
</span>

<br/>

<b style='font-size:12px;'>
{companyName}
</b>


</td>



<td width='370'
style='border-left:1px solid #999;padding-left:10px;line-height:16px;'>


<b>
AFYONKARAHİSAR
</b>

<br/>

Adres:
{location?.AddressLine1}

<br/>

{location?.AddressLine2}

<br/>

Sabit:
{phone}

<br/>

E-posta:
{personnel.Email}

<br/>

<a href='https://www.lokumatolyesi.com.tr'>
www.lokumatolyesi.com.tr
</a>


</td>


</tr>


</table>


<br/>


";
        // ALT LOGOLAR

        html += $@"

<table width='800'
cellpadding='0'
cellspacing='0'
style='font-family:Arial;border-collapse:collapse;'>


<tr>

<td width='250'>

<img
src='http://localhost:5173/logos/Paylaştıkça_Bereketlenir.png'
width='220'
/>

</td>


<td width='250'>

<img
src='http://localhost:5173/logos/Su_Verimliliği.png'
width='220'
/>

</td>

</tr>


<tr>

<td colspan='2'>

<br/>

<img
src='http://localhost:5173/logos/E-Fatura.png'
width='130'
/>

</td>

</tr>


</table>


<br/>


";



        // YASAL UYARI

        html += $@"

<table width='900'
cellpadding='8'
cellspacing='0'
style='
border:1px solid #000;
border-collapse:collapse;
font-family:Arial;
font-size:8pt;
color:#444;
'>


<tr>

<td>


<b>
YASAL UYARI
</b>


<br/><br/>


Bu elektronik posta ve ilişkili dosyalar sadece alması amaçlanan şahsi veya tüzel kişiye özeldir. Eğer yetkili alıcı değilseniz içeriği açmanız, açıklamanız, kopyalamanız, yönlendirmeniz ve kullanmanız yasaktır ve bu e-postayı derhal silmeniz gerekmektedir. “LOKUM ATÖLYESİ ŞEKERLEME GIDA TURİZM İNŞ. HAYV. SAN. VE TİC. A.Ş. bu mesajın içerdiği bilgilerin mutlak doğruluğu veya eksiksiz olduğu konusunda herhangi bir garanti vermez. Bu nedenle bu bilgilerin kullanımı ile ilgili kayıplardan sorumlu tutulamaz. Bu mesajın içeriğiyle ilgili sorumluluk yalnızca gönderen kişiye aittir ve bu içerik “LOKUM ATÖLYESİ ŞEKERLEME GIDA TURİZM İNŞ. HAYV. SAN. VE TİC. A.Ş. (LOKUM ATÖLYESİ)” tüzel kişiliğinin görüşlerini yansıtmayabilir. Bu e-posta bilinen bilgisayar virüslerine karşı taranmıştır. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla, e posta ortamında toplanan kişisel verilerinizi, Kişisel Verilerin Korunması ve İşlenmesi Politikası (“Politika”) usul ve esaslarıyla işlemekte ve gizli tutmaktayız. Politika belgesine www.lokumatolyesi.com.tr adresinden ulaşabilirsiniz.


<br/><br/>


<b>
DISCLAIMER
</b>


<br/><br/>


This e-mail and related files are the private property of the sender , the personal and the legal entities to whom they were intended to be send. If you are not an authorized recepient of this e-mail it is forbidden to open, copy, forward or use it. It is required that you should delate this e-mail immediately. “LOKUM ATÖLYESİ ŞEKERLEME GIDA TURİZM İNŞ. HAYV. SAN. VE TİC. A.Ş. (LOKUM ATÖLYESİ)” does not guarrantee absolutely the correctness and completeness of the information within this e-mail, and therefore will not be held liable from their illegal use and the forfeit. The sole resposibility will belong to the person who send it and the contents herein might not be reflecting the opinions of “LOKUM ATÖLYESİ ŞEKERLEME GIDA TURİZM İNŞ. HAYV. SAN. VE TİC. A.Ş. (LOKUM ATÖLYESİ)” legal entity. This e-mail has been scanned for all known computer viruses. Assigned as data supervisor in accordance with Law No. 6698 (General Data Protection Regulation Law), your general documents existing in your e-mail environment will be protected and processed by the form and principles of General Data Protection and Processing Policy. You can reach the policy document via “www.lokumatolyesi.com.tr”.


</td>

</tr>


</table>


";



        return new EmailSignaturePreviewDto
        {
            Html = html,
            PersonnelName = fullName,
            CompanyName = companyName
        };

    }



    public async Task<GeneratedSignatureFile> GenerateZipAsync(
        int personnelId,
        CancellationToken cancellationToken = default)
    {

        var preview = await PreviewAsync(
            personnelId,
            cancellationToken);


        return new GeneratedSignatureFile
        {
            FileName = "email-signature.html",

            ContentType = "text/html",

            Data = Convert.ToBase64String(
                Encoding.UTF8.GetBytes(preview.Html)
            )
        };

    }

}