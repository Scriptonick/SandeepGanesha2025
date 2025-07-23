using System.ComponentModel.DataAnnotations;

namespace GanpatiFestivalGame.Models
{
    public class ScratchCard
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int GanpatiAvatarId { get; set; }

        public DateTime ScratchedAt { get; set; } = DateTime.Now;
        public bool IsWon { get; set; }

        // Navigation Properties
        public virtual User User { get; set; }
        public virtual GanpatiAvatar GanpatiAvatar { get; set; }
    }
}