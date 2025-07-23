using System.ComponentModel.DataAnnotations;

namespace GanpatiFestivalGame.Models
{
    public class GanpatiAvatar
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(100)]
        public string Location { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [StringLength(200)]
        public string ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual ICollection<UserCollection> UserCollections { get; set; }
        public virtual ICollection<ScratchCard> ScratchCards { get; set; }
        public virtual AvatarInventory AvatarInventory { get; set; }
    }
}