using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Services.Interfaces;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Services.Implementations;

public class WordDocumentService : IWordDocumentService
{
    private readonly AppDbContext _context;

    public WordDocumentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> GenerateAssignmentProtocolAsync(int assignmentId)
    {
        return await GenerateDocumentAsync(assignmentId, false);
    }

    public async Task<byte[]> GenerateReturnProtocolAsync(int assignmentId)
    {
        return await GenerateDocumentAsync(assignmentId, true);
    }

    private async Task<byte[]> GenerateDocumentAsync(int assignmentId, bool isReturn)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Personnel).ThenInclude(p => p.Department)
            .Include(a => a.Personnel).ThenInclude(p => p.Company)
            .Include(a => a.Asset).ThenInclude(ast => ast.Category)
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException("Zimmet kaydı bulunamadı.");

        var p = assignment.Personnel;
        var asset = assignment.Asset;
        var company = p.Company;

        using var ms = new MemoryStream();
        using (var wordDocument = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document))
        {
            var mainPart = wordDocument.AddMainDocumentPart();
            mainPart.Document = new Document();
            var body = new Body();

            var pageSize = new PageSize { Width = 11906, Height = 16838 };
            var pageMargin = new PageMargin { Top = 720, Right = 720, Bottom = 720, Left = 720 };
            var sectPr = new SectionProperties(pageSize, pageMargin);

            AddHeading(body, "ZİMMET TUTANAĞI");

            AddSectionTitle(body, "İŞVERENİN");
            AddTwoColRow(body, "Adı Ünvanı", company?.CompanyName ?? "");
            AddTwoColRow(body, "Adresi", company?.Address ?? "");

            AddSectionTitle(body, "PERSONELİN");
            AddTwoColRow(body, "Adı Soyadı", $"{p.FirstName} {p.LastName}");
            AddTwoColRow(body, "SGK Sicil No (T.C. Kimlik No)", "");
            AddTwoColRow(body, "İşe Giriş Tarihi", p.EmploymentDate?.ToString("dd.MM.yyyy") ?? "");
            AddTwoColRow(body, "Görevi", p.Title ?? "");
            AddTwoColRow(body, "Departmanı", p.Department?.Name ?? "");
            AddTwoColRow(body, "Adres ve İletişim Bilgileri", p.Phone ?? "");

            AddParagraph(body,
                "\tAşağıda tanımı ve özellikleri belirtilen işyerimize ait emtia sağlam ve eksiksiz olarak teslim edilmiştir. " +
                "Kişinin ihmalinden dolayı kaybolma, çalınma veya bozulması durumunda aşağıda teslim edilen ürünün aynısı veya muadili teslim alan tarafından temin edilecektir. " +
                "Aksi durumda gerekli işlemler yapılacaktır.");

            AddSectionTitle(body, "TESLİM EDİLEN EMTİA");

            var assetTable = CreateTable(new[]
            {
                new[] { "BARKOD", "CİNSİ", "MODEL", "AÇIKLAMA" },
                new[] { asset.Barcode, asset.Category?.Name ?? "", asset.Name, asset.Description ?? "" }
            });
            body.AppendChild(assetTable);

            AddEmptyLine(body);
            AddRightAlignedParagraph(body, $"Teslim Tarihi: {assignment.AssignedAt:dd.MM.yyyy}");
            AddEmptyLine(body);

            var signTable = CreateSignatureTable("Teslim Alan Personel\n(Adı Soyadı-İmza)", "Teslim Eden İşveren ya da Vekili\n(Adı Soyadı-İmza)");
            body.AppendChild(signTable);

            AddPageBreak(body);

            AddParagraph(body, "(Bu kısım geri teslimde doldurulacaktır)");
            AddParagraph(body, "Yukarıda tanımlı ve özellikleri belirtilen emtia işyerine;");
            AddParagraph(body, "     [   ] Hasarsız ve Tam Olarak Teslim Edilmiştir             [   ] Hasarlı ya da Eksik Teslim Edilmiştir");
            AddParagraph(body, "Hasarlı ya da eksik teslim alınmış ise aşağıya hasarı ya da eksikliği yazınız");

            if (isReturn && !string.IsNullOrEmpty(assignment.ReturnNotes))
                AddParagraph(body, assignment.ReturnNotes);

            AddEmptyLine(body);
            AddRightAlignedParagraph(body, $"Teslim Tarihi: {(isReturn ? assignment.ReturnedAt?.ToString("dd.MM.yyyy") ?? "" : ".../.../........")}");
            AddEmptyLine(body);

            var returnSignTable = CreateSignatureTable("Teslim Eden Personel\n(Adı Soyadı-İmza)", "Teslim Alan İşveren ya da Vekili\n(Adı Soyadı-İmza)");
            body.AppendChild(returnSignTable);

            AddEmptyLine(body);
            AddHorizontalLine(body);
            AddEmptyLine(body);

            AddHeading(body, $"6698 SAYILI KİŞİSEL VERİLERİN KORUNMASI KANUNU KAPSAMINDA\n{company?.CompanyName ?? ""}\nMOBİL CİHAZ KULLANIM POLİTİKASI");

            AddParagraph(body, $"{company?.CompanyName ?? ""}'ye ait laptop ve akıllı telefonlar gibi mobil cihazların güvenliğinde aşağıdaki güvenlik önlemlerine dikkat edilmesi gerekmektedir.\n\nUygulama;");
            AddBulletPoint(body, "Mobil cihazlara erişimde mutlaka parola kullanılmalıdır.");
            AddBulletPoint(body, "Mobil cihazınızda ne tür bilgiler sakladığınızın farkında olun, hassas ve gizli bilgileri mümkün olduğunca mobil cihazda bulundurulmamalıdır.");
            AddBulletPoint(body, "Verilerin yedekleri alınmalı ve güncel bir kopyası farklı bir yerde saklanmalıdır.");
            AddBulletPoint(body, "Kaybolması ve çalınması kolay olduğundan mobil cihazları başıboş bırakılmamalıdır.");
            AddBulletPoint(body, "Araç ile seyahat sırasında aracı terk ederken mobil cihazlar unutulmamalıdır.");

            AddEmptyLine(body);
            AddParagraph(body, "İlgili Kişinin Hakları");
            AddParagraph(body,
                $"İlgili kişi olarak, Kanunun ilgili kişinin haklarını düzenleyen 11. maddesi kapsamındaki taleplerinizi \"Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğe\" göre " +
                $"{company?.Address ?? "ilgili adrese"} adresine yazılı olarak veya {company?.MailAddress ?? ""} e-posta adresine elektronik ortamdan iletmek suretiyle sayılan haklarınızı kullanabilecektir. " +
                $"Bu konuda daha kapsamlı düzenleme {company?.Name ?? ""} - Kişisel Veri Başvuru ve Yanıt Prosedürü'nde düzenlenmiştir.");

            body.AppendChild(sectPr);
            mainPart.Document.AppendChild(body);
            mainPart.Document.Save();
        }

        return ms.ToArray();
    }

    private static void AddHeading(Body body, string text)
    {
        var para = new Paragraph();
        para.ParagraphProperties = new ParagraphProperties(
            new Justification { Val = JustificationValues.Center });

        var lines = text.Split('\n');
        for (int i = 0; i < lines.Length; i++)
        {
            var run = new Run(new Text(lines[i]));
            run.RunProperties = new RunProperties(new Bold(), new FontSize { Val = "22" });
            para.AppendChild(run);
            if (i < lines.Length - 1)
            {
                var br = new Run(new Break());
                br.RunProperties = new RunProperties(new Bold(), new FontSize { Val = "22" });
                para.AppendChild(br);
            }
        }

        body.AppendChild(para);
        AddEmptyLine(body);
    }

    private static void AddSectionTitle(Body body, string text)
    {
        var para = new Paragraph();
        var run = new Run(new Text(text));
        run.RunProperties = new RunProperties(new Bold(), new Underline { Val = UnderlineValues.Single });
        para.AppendChild(run);
        body.AppendChild(para);
    }

    private static void AddTwoColRow(Body body, string label, string value)
    {
        var table = new Table();
        var tr = new TableRow();

        var tc1 = new TableCell(new TableCellProperties(new TableCellWidth { Type = TableWidthUnitValues.Pct, Width = "40" }),
            new Paragraph(new Run(new Text(label))));
        var tc2 = new TableCell(new TableCellProperties(new TableCellWidth { Type = TableWidthUnitValues.Pct, Width = "5" }),
            new Paragraph(new Run(new Text(":"))));
        var tc3 = new TableCell(new TableCellProperties(new TableCellWidth { Type = TableWidthUnitValues.Pct, Width = "55" }),
            new Paragraph(new Run(new Text(value))));

        tr.Append(tc1, tc2, tc3);
        table.AppendChild(new TableProperties(new TableBorders(
            new TopBorder { Val = BorderValues.None },
            new BottomBorder { Val = BorderValues.None },
            new LeftBorder { Val = BorderValues.None },
            new RightBorder { Val = BorderValues.None },
            new InsideHorizontalBorder { Val = BorderValues.None },
            new InsideVerticalBorder { Val = BorderValues.None }
        )));
        table.AppendChild(tr);
        body.AppendChild(table);
    }

    private static Table CreateTable(string[][] rows)
    {
        var table = new Table();
        var tblProps = new TableProperties(
            new TableBorders(
                new TopBorder { Val = BorderValues.Single, Size = 4 },
                new BottomBorder { Val = BorderValues.Single, Size = 4 },
                new LeftBorder { Val = BorderValues.Single, Size = 4 },
                new RightBorder { Val = BorderValues.Single, Size = 4 },
                new InsideHorizontalBorder { Val = BorderValues.Single, Size = 4 },
                new InsideVerticalBorder { Val = BorderValues.Single, Size = 4 }
            ),
            new TableWidth { Type = TableWidthUnitValues.Pct, Width = "5000" }
        );
        table.AppendChild(tblProps);

        bool isFirst = true;
        foreach (var row in rows)
        {
            var tr = new TableRow();
            foreach (var cell in row)
            {
                var tc = new TableCell();
                var para = new Paragraph();
                var run = new Run(new Text(cell));
                if (isFirst) run.RunProperties = new RunProperties(new Bold());
                para.AppendChild(run);
                tc.AppendChild(para);
                tr.AppendChild(tc);
            }
            table.AppendChild(tr);
            isFirst = false;
        }
        return table;
    }

    private static Table CreateSignatureTable(string left, string right)
    {
        var table = new Table();
        var tblProps = new TableProperties(
            new TableBorders(
                new TopBorder { Val = BorderValues.None },
                new BottomBorder { Val = BorderValues.None },
                new LeftBorder { Val = BorderValues.None },
                new RightBorder { Val = BorderValues.None },
                new InsideHorizontalBorder { Val = BorderValues.None },
                new InsideVerticalBorder { Val = BorderValues.None }
            ),
            new TableWidth { Type = TableWidthUnitValues.Pct, Width = "5000" }
        );
        table.AppendChild(tblProps);

        var tr = new TableRow();
        var tc1 = new TableCell(new TableCellProperties(new TableCellWidth { Type = TableWidthUnitValues.Pct, Width = "2500" }),
            new Paragraph(new Run(new Text(left))));
        var tc2 = new TableCell(new TableCellProperties(new TableCellWidth { Type = TableWidthUnitValues.Pct, Width = "2500" }),
            new Paragraph(new ParagraphProperties(new Justification { Val = JustificationValues.Right }),
                new Run(new Text(right))));
        tr.Append(tc1, tc2);
        table.AppendChild(tr);
        return table;
    }

    private static void AddParagraph(Body body, string text)
    {
        body.AppendChild(new Paragraph(new Run(new Text(text))));
    }

    private static void AddBulletPoint(Body body, string text)
    {
        body.AppendChild(new Paragraph(new Run(new Text("• " + text))));
    }

    private static void AddRightAlignedParagraph(Body body, string text)
    {
        var para = new Paragraph();
        para.ParagraphProperties = new ParagraphProperties(new Justification { Val = JustificationValues.Right });
        para.AppendChild(new Run(new Text(text)));
        body.AppendChild(para);
    }

    private static void AddEmptyLine(Body body)
    {
        body.AppendChild(new Paragraph());
    }

    private static void AddPageBreak(Body body)
    {
        var para = new Paragraph();
        para.AppendChild(new Run(new Break { Type = BreakValues.Page }));
        body.AppendChild(para);
    }

    private static void AddHorizontalLine(Body body)
    {
        var para = new Paragraph();
        var pPr = new ParagraphProperties();
        var pBdr = new ParagraphBorders();
        pBdr.AppendChild(new BottomBorder { Val = BorderValues.Single, Size = 6, Space = 1, Color = "000000" });
        pPr.AppendChild(pBdr);
        para.AppendChild(pPr);
        body.AppendChild(para);
    }
}
