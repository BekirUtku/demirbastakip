using BCrypt.Net;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (!await context.AdminUsers.AnyAsync())
        {
            context.AdminUsers.Add(new AdminUser
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                FullName = "Sistem Yöneticisi",
                Email = "admin@demirbas.local",
                IsActive = true,
                CreatedAt = DateTime.Now
            });

            await context.SaveChangesAsync();
        }

        // GEÇİCİ ŞİFRE SIFIRLAMA KODU
        var existingAdmin = await context.AdminUsers
            .FirstOrDefaultAsync(x => x.Username == "admin");

        if (existingAdmin != null)
        {
            existingAdmin.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword("Admin123!");

            existingAdmin.IsActive = true;

            await context.SaveChangesAsync();
        }

        if (!await context.Companies.AnyAsync())
        {
            context.Companies.AddRange(
                new Company
                {
                    Name = "Afyon Lokum Atölyesi",
                    CompanyName = "AFYON LOKUM ATÖLYESİ",
                    LogoPath = "/logos/lokum_atolyesi.png",
                    Address = "Afyonkarahisar OSB Mah. 1.(1) Sk. No:27 Merkez/Afyonkarahisar",
                    MailAddress = "bilgi@lokumatolyesi.com.tr",
                    IsActive = true
                },
                new Company
                {
                    Name = "Afyon Ogaş Şekerleme",
                    CompanyName = "AFYON OGAŞ ŞEKERLEME",
                    LogoPath = "/logos/lokum_atolyesi.png",
                    Address = "Afyonkarahisar OSB Mah. 1.(1) Sk. Ogaş No:27 Merkez/Afyonkarahisar",
                    MailAddress = "bilgi@ogas.com.tr",
                    IsActive = true
                },
                new Company
                {
                    Name = "YES Investment",
                    CompanyName = "YES INVESTMENT",
                    LogoPath = "/logos/lokum_atolyesi.png",
                    Address = "Afyonkarahisar OSB Mah. 1.(1) Sk. No:27 Merkez/Afyonkarahisar",
                    MailAddress = "bilgi@yesinvestment.com.tr",
                    IsActive = true
                }
            );

            await context.SaveChangesAsync();
        }

        if (!await context.Departments.AnyAsync())
        {
            var admin = await context.AdminUsers.FirstAsync();

            var departments = new[]
            {
                "Bilgi İşlem",
                "Muhasebe",
                "Finans",
                "İnsan Kaynakları",
                "Üretim",
                "Pazarlama",
                "Satış",
                "Yönetim"
            };

            foreach (var dept in departments)
            {
                context.Departments.Add(new Department
                {
                    Name = dept,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                });
            }

            await context.SaveChangesAsync();
        }

        if (!await context.Categories.AnyAsync())
        {
            var admin = await context.AdminUsers.FirstAsync();

            var phoneCategory = new Category
            {
                Name = "Telefon",
                Description = "Akıllı telefon ve cep telefonları",
                IsActive = true,
                CreatedAt = DateTime.Now,
                CreatedByUserId = admin.Id,
                CreatedByUserName = admin.Username
            };

            phoneCategory.Questions = new List<CategoryQuestion>
            {
                new()
                {
                    QuestionText = "Marka",
                    AnswerType = AnswerType.Text,
                    IsRequired = true,
                    DisplayOrder = 1,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Model",
                    AnswerType = AnswerType.Text,
                    IsRequired = true,
                    DisplayOrder = 2,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "IMEI No",
                    AnswerType = AnswerType.Text,
                    IsRequired = false,
                    DisplayOrder = 3,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Renk",
                    AnswerType = AnswerType.Text,
                    IsRequired = false,
                    DisplayOrder = 4,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Depolama (GB)",
                    AnswerType = AnswerType.Number,
                    IsRequired = false,
                    DisplayOrder = 5,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Kılıf Var Mı?",
                    AnswerType = AnswerType.YesNo,
                    IsRequired = false,
                    DisplayOrder = 6,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                }
            };

            var laptopCategory = new Category
            {
                Name = "Laptop",
                Description = "Dizüstü bilgisayarlar",
                IsActive = true,
                CreatedAt = DateTime.Now,
                CreatedByUserId = admin.Id,
                CreatedByUserName = admin.Username
            };

            laptopCategory.Questions = new List<CategoryQuestion>
            {
                new()
                {
                    QuestionText = "Marka",
                    AnswerType = AnswerType.Text,
                    IsRequired = true,
                    DisplayOrder = 1,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Model",
                    AnswerType = AnswerType.Text,
                    IsRequired = true,
                    DisplayOrder = 2,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "İşlemci",
                    AnswerType = AnswerType.Text,
                    IsRequired = false,
                    DisplayOrder = 3,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "RAM (GB)",
                    AnswerType = AnswerType.Number,
                    IsRequired = false,
                    DisplayOrder = 4,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "SSD/HDD (GB)",
                    AnswerType = AnswerType.Number,
                    IsRequired = false,
                    DisplayOrder = 5,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "İşletim Sistemi",
                    AnswerType = AnswerType.Text,
                    IsRequired = false,
                    DisplayOrder = 6,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Çanta Var Mı?",
                    AnswerType = AnswerType.YesNo,
                    IsRequired = false,
                    DisplayOrder = 7,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                }
            };

            var simCategory = new Category
            {
                Name = "Sim Kart",
                Description = "Telefon sim kartları",
                IsActive = true,
                CreatedAt = DateTime.Now,
                CreatedByUserId = admin.Id,
                CreatedByUserName = admin.Username
            };

            simCategory.Questions = new List<CategoryQuestion>
            {
                new()
                {
                    QuestionText = "Operatör",
                    AnswerType = AnswerType.Text,
                    IsRequired = true,
                    DisplayOrder = 1,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Hat Numarası",
                    AnswerType = AnswerType.Text,
                    IsRequired = true,
                    DisplayOrder = 2,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                },
                new()
                {
                    QuestionText = "Paket Türü",
                    AnswerType = AnswerType.Text,
                    IsRequired = false,
                    DisplayOrder = 3,
                    CreatedByUserId = admin.Id,
                    CreatedByUserName = admin.Username
                }
            };

            context.Categories.AddRange(
                phoneCategory,
                laptopCategory,
                simCategory);

            await context.SaveChangesAsync();
        }

        if (!await context.MailSettings.AnyAsync())
        {
            context.MailSettings.Add(new MailSettings
            {
                SmtpHost = "smtp.gmail.com",
                Port = 587,
                FromEmail = "noreply@sirket.com",
                Password = "",
                UseSsl = true,
                SendTime = new TimeSpan(9, 0, 0),
                BirthdayMailSubject = "Doğum Günün Kutlu Olsun! 🎂",
                BirthdayMailTemplate = @"Değerli {PersonelAdSoyad},

{PersonelFirma} Ailesi olarak birlikte olmanın mutluluğunu yaşıyor, doğum gününü en içten dileklerimizle kutluyoruz.
Sevdiklerinle birlikte nice mutlu seneler geçirmeniz dileğiyle,

İyi ki doğdun {PersonelAd} .
"
            });

            await context.SaveChangesAsync();
        }

        // İmza görselleri: mevcut varsayılan logo/banner/e-fatura'yı yönetime ekle
        var defaultAssets = new (string Company, string Kind, string Path, int Width, int Order, string Name)[]
        {
            ("lokum", "logo",    "/logos/lokum_atolyesi_imza.png",      110, 0, "Lokum Logo"),
            ("lokum", "banner",  "/logos/Paylaştıkça_Bereketlenir.png", 220, 1, "Paylaştıkça Bereketlenir"),
            ("lokum", "banner",  "/logos/Su_Verimliliği.png",           220, 2, "Su Verimliliği"),
            ("lokum", "efatura", "/logos/E-Fatura.png",                 130, 0, "E-Fatura"),
            ("ogas",  "logo",    "/logos/ogas.png",                     150, 0, "OGAŞ Logo"),
            ("ogas",  "banner",  "/logos/Su_Verimliliği.png",           220, 1, "Su Verimliliği"),
            ("ogas",  "efatura", "/logos/E-Fatura.png",                 130, 0, "E-Fatura"),
        };
        foreach (var d in defaultAssets)
        {
            var exists = await context.SignatureAssets.AnyAsync(
                a => a.Company == d.Company && a.Kind == d.Kind && a.FileName == d.Path);
            if (!exists)
            {
                context.SignatureAssets.Add(new SignatureAsset
                {
                    Company = d.Company,
                    Kind = d.Kind,
                    FileName = d.Path,
                    OriginalName = d.Name,
                    Width = d.Width,
                    SortOrder = d.Order,
                    IsActive = true,
                });
            }
        }
        await context.SaveChangesAsync();
    }
}