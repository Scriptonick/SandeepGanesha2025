using System.ComponentModel.DataAnnotations;

namespace GanpatiFestivalGame.Models
{
    public class AvatarInventory
    {
        public int Id { get; set; }

        [Required]
        public int GanpatiAvatarId { get; set; }

        [Required]
        public int Quantity { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual GanpatiAvatar GanpatiAvatar { get; set; }
    }
}