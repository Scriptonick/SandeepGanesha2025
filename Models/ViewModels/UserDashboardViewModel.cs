namespace GanpatiFestivalGame.Models.ViewModels
{
    public class UserDashboardViewModel
    {
        public User User { get; set; }
        public List<GanpatiAvatar> CollectedAvatars { get; set; }
        public List<GanpatiAvatar> RemainingAvatars { get; set; }
        public bool CanScratchToday { get; set; }
        public TimeSpan? TimeUntilNextScratch { get; set; }
        public List<LeaderboardViewModel> Leaderboard { get; set; }
        public int UserRank { get; set; }
        public decimal CompletionPercentage { get; set; }
    }
}