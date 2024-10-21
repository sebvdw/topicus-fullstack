using api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace api.Models;

public partial class DbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public DbContext()
    {
    }
    
    public DbContext(DbContextOptions<DbContext> options)
        : base(options)
    {
    }     
    
    
        public DbSet<Municipality> Municipality { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<Translation> Translation { get; set; }
        public DbSet<Theme> Theme { get; set; }
        public DbSet<Font> Font { get; set; }
        public DbSet<BlobContainer> BlobContainer { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
modelBuilder.Entity<Municipality>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<Font>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.HashPassword).IsRequired().HasMaxLength(255);
                entity.HasOne<Municipality>()
                    .WithMany()
                    .HasForeignKey(e => e.MunicipalityId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Translation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Body).IsRequired();
                entity.Property(e => e.PrivacyStatement).IsRequired();
                entity.HasOne<Municipality>()
                      .WithMany()
                      .HasForeignKey(e => e.MunicipalityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Theme>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PrimaryColor).IsRequired().HasMaxLength(50);
                entity.Property(e => e.SecondaryColor).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IsDefault).IsRequired();
                entity.HasOne<Municipality>()
                      .WithMany()
                      .HasForeignKey(e => e.MunicipalityId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Font)
                      .WithMany()
                      .HasForeignKey(e => e.FontId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<BlobContainer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.HasOne<Municipality>()
                      .WithMany()
                      .HasForeignKey(e => e.MunicipalityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
    }
    
}