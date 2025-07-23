using System.ComponentModel.DataAnnotations;

namespace GanpatiFestivalGame.Models
{
    public class UserCollection
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int GanpatiAvatarId { get; set; }

        public DateTime CollectedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual User User { get; set; }
        public virtual GanpatiAvatar GanpatiAvatar { get; set; }
    }
}