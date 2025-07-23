using GanpatiFestivalGame.Models;
using Microsoft.EntityFrameworkCore;

namespace GanpatiFestivalGame.Services
{
    public interface IGameService
    {
        Task<bool> CanUserScratchToday(int userId);
        Task<ScratchResult> ProcessScratchCard(int userId);
        Task<List<LeaderboardEntry>> GetLeaderboard();
        Task<UserStats> GetUserStats(int userId);
    }

    public class GameService : IGameService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<GameService> _logger;

        public GameService(ApplicationDbContext context, ILogger<GameService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> CanUserScratchToday(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.IsBlocked) return false;

            return user.LastScratchDate?.Date != DateTime.Today;
        }

        public async Task<ScratchResult> ProcessScratchCard(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.IsBlocked)
                {
                    return new ScratchResult { Success = false, Message = "User not found or blocked" };
                }

                if (!await CanUserScratchToday(userId))
                {
                    return new ScratchResult { Success = false, Message = "Already scratched today" };
                }

                // Get available avatars
                var availableAvatars = await GetAvailableAvatarsForUser(userId);
                if (!availableAvatars.Any())
                {
                    return new ScratchResult { Success = false, Message = "No avatars available" };
                }

                var random = new Random();
                var selectedAvatar = availableAvatars[random.Next(availableAvatars.Count)];
                var isWon = random.NextDouble() < 0.3; // 30% chance

                // Update user's last scratch date
                user.LastScratchDate = DateTime.Now;

                // Create scratch record
                var scratch = new ScratchCard
                {
                    UserId = userId,
                    GanpatiAvatarId = selectedAvatar.Id,
                    IsWon = isWon,
                    ScratchedAt = DateTime.Now
                };
                _context.ScratchCards.Add(scratch);

                if (isWon)
                {
                    // Add to collection
                    var collection = new UserCollection
                    {
                        UserId = userId,
                        GanpatiAvatarId = selectedAvatar.Id
                    };
                    _context.UserCollections.Add(collection);

                    // Reduce inventory
                    await ReduceInventory(selectedAvatar.Id);
                }

                await _context.SaveChangesAsync();

                return new ScratchResult
                {
                    Success = true,
                    Won = isWon,
                    Avatar = selectedAvatar,
                    Message = isWon ? "Congratulations!" : "Better luck next time!"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing scratch card for user {UserId}", userId);
                return new ScratchResult { Success = false, Message = "An error occurred" };
            }
        }

        private async Task<List<GanpatiAvatar>> GetAvailableAvatarsForUser(int userId)
        {
            var collectedIds = await _context.UserCollections
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.GanpatiAvatarId)
                .ToListAsync();

            return await _context.GanpatiAvatars
                .Where(ga => ga.IsActive && !collectedIds.Contains(ga.Id))
                .Join(_context.AvatarInventories,
                     ga => ga.Id,
                     ai => ai.GanpatiAvatarId,
                     (ga, ai) => new { Avatar = ga, Inventory = ai })
                .Where(x => x.Inventory.Quantity > 0)
                .Select(x => x.Avatar)
                .ToListAsync();
        }

        private async Task ReduceInventory(int avatarId)
        {
            var inventory = await _context.AvatarInventories
                .FirstOrDefaultAsync(ai => ai.GanpatiAvatarId == avatarId);

            if (inventory != null && inventory.Quantity > 0)
            {
                inventory.Quantity--;
                inventory.UpdatedAt = DateTime.Now;
            }
        }

        public async Task<List<LeaderboardEntry>> GetLeaderboard()
        {
            var totalAvatars = await _context.GanpatiAvatars.CountAsync(ga => ga.IsActive);

            return await _context.Users
                .Where(u => u.Role == UserRole.User && u.IsActive && !u.IsBlocked)
                .Select(u => new LeaderboardEntry
                {
                    UserId = u.Id,
                    UserName = u.Name,
                    CollectedCount = _context.UserCollections.Count(uc => uc.UserId == u.Id),
                    TotalAvatars = totalAvatars
                })
                .OrderByDescending(l => l.CollectedCount)
                .ThenBy(l => l.UserName)
                .ToListAsync();
        }

        public async Task<UserStats> GetUserStats(int userId)
        {
            var collectedCount = await _context.UserCollections.CountAsync(uc => uc.UserId == userId);
            var totalAvatars = await _context.GanpatiAvatars.CountAsync(ga => ga.IsActive);
            var totalScratches = await _context.ScratchCards.CountAsync(sc => sc.UserId == userId);
            var wonScratches = await _context.ScratchCards.CountAsync(sc => sc.UserId == userId && sc.IsWon);

            return new UserStats
            {
                CollectedCount = collectedCount,
                TotalAvatars = totalAvatars,
                TotalScratches = totalScratches,
                WonScratches = wonScratches,
                CompletionPercentage = totalAvatars > 0 ? (decimal)collectedCount / totalAvatars * 100 : 0
            };
        }
    }

    public class ScratchResult
    {
        public bool Success { get; set; }
        public bool Won { get; set; }
        public string Message { get; set; }
        public GanpatiAvatar Avatar { get; set; }
    }

    public class LeaderboardEntry
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int CollectedCount { get; set; }
        public int TotalAvatars { get; set; }
        public decimal CompletionPercentage => TotalAvatars > 0 ? (decimal)CollectedCount / TotalAvatars * 100 : 0;
    }

    public class UserStats
    {
        public int CollectedCount { get; set; }
        public int TotalAvatars { get; set; }
        public int TotalScratches { get; set; }
        public int WonScratches { get; set; }
        public decimal CompletionPercentage { get; set; }
    }
}