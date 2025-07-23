using System.ComponentModel.DataAnnotations;

namespace GanpatiFestivalGame.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string Password { get; set; } // Should be hashed in real implementation

        [Required]
        public UserRole Role { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsBlocked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? LastScratchDate { get; set; }

        // Navigation Properties
        public virtual ICollection<UserCollection> UserCollections { get; set; }
        public virtual ICollection<ScratchCard> ScratchCards { get; set; }
    }

    public enum UserRole
    {
        Admin = 1,
        User = 2
    }
}