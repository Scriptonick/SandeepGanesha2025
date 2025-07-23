using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace GanpatiFestivalGame.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<GanpatiAvatar> GanpatiAvatars { get; set; }
        public DbSet<UserCollection> UserCollections { get; set; }
        public DbSet<ScratchCard> ScratchCards { get; set; }
        public DbSet<AvatarInventory> AvatarInventories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed Ashtavinayak Avatars
            modelBuilder.Entity<GanpatiAvatar>().HasData(
                new GanpatiAvatar { Id = 1, Name = "Mayureshwar", Location = "Morgaon", Description = "The first avatar of Lord Ganesha", ImageUrl = "/images/avatars/mayureshwar.jpg", IsActive = true },
                new GanpatiAvatar { Id = 2, Name = "Siddhivinayak", Location = "Siddhatek", Description = "The grantor of success", ImageUrl = "/images/avatars/siddhivinayak.jpg", IsActive = true },
                new GanpatiAvatar { Id = 3, Name = "Ballaleshwar", Location = "Pali", Description = "The devoted child avatar", ImageUrl = "/images/avatars/ballaleshwar.jpg", IsActive = true },
                new GanpatiAvatar { Id = 4, Name = "Varadavinayak", Location = "Mahad", Description = "The boon giver", ImageUrl = "/images/avatars/varadavinayak.jpg", IsActive = true },
                new GanpatiAvatar { Id = 5, Name = "Chintamani", Location = "Theur", Description = "The remover of worries", ImageUrl = "/images/avatars/chintamani.jpg", IsActive = true },
                new GanpatiAvatar { Id = 6, Name = "Girijatmaj", Location = "Lenyadri", Description = "Son of Goddess Parvati", ImageUrl = "/images/avatars/girijatmaj.jpg", IsActive = true },
                new GanpatiAvatar { Id = 7, Name = "Vighnahar", Location = "Ozar", Description = "The remover of obstacles", ImageUrl = "/images/avatars/vighnahar.jpg", IsActive = true },
                new GanpatiAvatar { Id = 8, Name = "Mahaganapati", Location = "Ranjangaon", Description = "The great Ganesha", ImageUrl = "/images/avatars/mahaganapati.jpg", IsActive = true }
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}