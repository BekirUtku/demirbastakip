using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CategoryQuestion> CategoryQuestions => Set<CategoryQuestion>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<AssetAnswer> AssetAnswers => Set<AssetAnswer>();
    public DbSet<Personnel> Personnel => Set<Personnel>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<MailSettings> MailSettings => Set<MailSettings>();
    public DbSet<MailLog> MailLogs => Set<MailLog>();
    public DbSet<AssetPhoto> AssetPhotos => Set<AssetPhoto>();
    public DbSet<AssignmentPhoto> AssignmentPhotos => Set<AssignmentPhoto>();

    // E-posta imza lokasyonları
    public DbSet<SignatureLocation> SignatureLocations =>
        Set<SignatureLocation>();

    public DbSet<Branch> Branches => Set<Branch>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasIndex(a => a.Barcode)
                  .IsUnique();

            entity.Property(a => a.Status)
                  .HasConversion<int>();
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.Property(a => a.Status)
                  .HasConversion<int>();

            entity.HasOne(a => a.Personnel)
                  .WithMany(p => p.Assignments)
                  .HasForeignKey(a => a.PersonnelId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(a => a.Asset)
                  .WithMany(ast => ast.Assignments)
                  .HasForeignKey(a => a.AssetId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Personnel>(entity =>
        {
            entity.HasOne(p => p.Department)
                  .WithMany(d => d.Personnel)
                  .HasForeignKey(p => p.DepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Company)
                  .WithMany(c => c.Personnel)
                  .HasForeignKey(p => p.CompanyId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Personel ile imza lokasyonu ilişkisi
            entity.HasOne(p => p.SignatureLocation)
                  .WithMany(l => l.Personnel)
                  .HasForeignKey(p => p.SignatureLocationId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.Property(p => p.EnglishTitle)
                  .HasMaxLength(200);
        });

        modelBuilder.Entity<SignatureLocation>(entity =>
        {
            entity.Property(x => x.Type)
                  .HasMaxLength(20)
                  .IsRequired();

            entity.Property(x => x.Name)
                  .HasMaxLength(150)
                  .IsRequired();

            entity.Property(x => x.DisplayName)
                  .HasMaxLength(200)
                  .IsRequired();

            entity.Property(x => x.AddressLine1)
                  .HasMaxLength(300);

            entity.Property(x => x.AddressLine2)
                  .HasMaxLength(300);

            entity.Property(x => x.LokumPhone)
                  .HasMaxLength(50);

            entity.Property(x => x.OgasPhone)
                  .HasMaxLength(50);

            entity.HasIndex(x => x.Name);

            entity.HasIndex(x => new
            {
                x.Type,
                x.IsActive
            });
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.Property(b => b.Name)
                  .HasMaxLength(200)
                  .IsRequired();

            entity.Property(b => b.Address)
                  .HasMaxLength(500);

            entity.Property(b => b.Phone)
                  .HasMaxLength(50);

            entity.HasOne(b => b.Company)
                  .WithMany(c => c.Branches)
                  .HasForeignKey(b => b.CompanyId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(b => b.CompanyId);
        });

        modelBuilder.Entity<Personnel>()
                    .HasOne(p => p.Branch)
                    .WithMany(b => b.Personnel)
                    .HasForeignKey(p => p.BranchId)
                    .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasOne(a => a.Category)
                  .WithMany(c => c.Assets)
                  .HasForeignKey(a => a.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CategoryQuestion>(entity =>
        {
            entity.Property(q => q.AnswerType)
                  .HasConversion<int>();

            entity.HasOne(q => q.Category)
                  .WithMany(c => c.Questions)
                  .HasForeignKey(q => q.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AssetAnswer>(entity =>
        {
            entity.HasOne(a => a.Asset)
                  .WithMany(ast => ast.Answers)
                  .HasForeignKey(a => a.AssetId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.CategoryQuestion)
                  .WithMany(q => q.Answers)
                  .HasForeignKey(a => a.CategoryQuestionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MailLog>(entity =>
        {
            entity.Property(m => m.MailType)
                  .HasConversion<int>();
        });

        modelBuilder.Entity<MailSettings>(entity =>
        {
            entity.Property(m => m.SendTime)
                  .HasConversion(
                      value => value.ToString(),
                      value => TimeSpan.Parse(value));
        });

        modelBuilder.Entity<AssetPhoto>(entity =>
        {
            entity.HasOne(p => p.Asset)
                  .WithMany(a => a.Photos)
                  .HasForeignKey(p => p.AssetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AssignmentPhoto>(entity =>
        {
            entity.Property(p => p.PhotoType)
                  .HasConversion<int>();

            entity.HasOne(p => p.Assignment)
                  .WithMany(a => a.Photos)
                  .HasForeignKey(p => p.AssignmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Performans indeksleri
        modelBuilder.Entity<Assignment>()
                    .HasIndex(a => a.AssignedAt);

        modelBuilder.Entity<Assignment>()
                    .HasIndex(a => new
                    {
                        a.PersonnelId,
                        a.AssignedAt
                    });

        modelBuilder.Entity<Assignment>()
                    .HasIndex(a => a.Status);

        modelBuilder.Entity<Asset>()
                    .HasIndex(a => a.Status);

        modelBuilder.Entity<Asset>()
                    .HasIndex(a => a.CategoryId);

        modelBuilder.Entity<MailLog>()
                    .HasIndex(m => m.SentAt);
    }
}