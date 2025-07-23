namespace GanpatiFestivalGame.Models.ViewModels
{
    public class LeaderboardViewModel
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int CollectedCount { get; set; }
        public int TotalAvatars { get; set; }
        public decimal CompletionPercentage => TotalAvatars > 0 ? (decimal)CollectedCount / TotalAvatars * 100 : 0;
        public int Rank { get; set; }
        public List<string> CollectedAvatars { get; set; } = new List<string>();
    }
}