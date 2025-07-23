using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GanpatiFestivalGame.Models;
using GanpatiFestivalGame.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GanpatiFestivalGame.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return RedirectToAction("Login", "Account");

            if (user.Role == UserRole.Admin)
                return RedirectToAction("Dashboard", "Admin");

            var viewModel = await GetUserDashboardViewModel(userId);
            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> ScratchCard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null || user.IsBlocked)
                return Json(new { success = false, message = "User not found or blocked" });

            // Check if user can scratch today
            var today = DateTime.Today;
            if (user.LastScratchDate?.Date == today)
                return Json(new { success = false, message = "You have already scratched today!" });

            // Get available avatars (not yet collected by user and have inventory)
            var collectedAvatarIds = await _context.UserCollections
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.GanpatiAvatarId)
                .ToListAsync();

            var availableAvatars = await _context.GanpatiAvatars
                .Where(ga => ga.IsActive && !collectedAvatarIds.Contains(ga.Id))
                .Join(_context.AvatarInventories, ga => ga.Id, ai => ai.GanpatiAvatarId,
                      (ga, ai) => new { Avatar = ga, Inventory = ai })
                .Where(joined => joined.Inventory.Quantity > 0)
                .Select(joined => joined.Avatar)
                .ToListAsync();

            if (!availableAvatars.Any())
                return Json(new { success = false, message = "No avatars available to collect!" });

            // Random selection with weighted probability
            var random = new Random();
            var wonAvatar = availableAvatars[random.Next(availableAvatars.Count)];
            var isWon = random.Next(1, 101) <= 30; // 30% chance of winning

            // Create scratch card record
            var scratchCard = new ScratchCard
            {
                UserId = userId,
                GanpatiAvatarId = wonAvatar.Id,
                IsWon = isWon,
                ScratchedAt = DateTime.Now
            };

            _context.ScratchCards.Add(scratchCard);

            // Update user's last scratch date
            user.LastScratchDate = DateTime.Now;

            if (isWon)
            {
                // Add to user collection
                var userCollection = new UserCollection
                {
                    UserId = userId,
                    GanpatiAvatarId = wonAvatar.Id,
                    CollectedAt = DateTime.Now
                };

                _context.UserCollections.Add(userCollection);

                // Reduce inventory
                var inventory = await _context.AvatarInventories
                    .FirstOrDefaultAsync(ai => ai.GanpatiAvatarId == wonAvatar.Id);
                
                if (inventory != null && inventory.Quantity > 0)
                {
                    inventory.Quantity--;
                    inventory.UpdatedAt = DateTime.Now;
                }
            }

            await _context.SaveChangesAsync();

            return Json(new { 
                success = true, 
                won = isWon, 
                avatar = new { 
                    name = wonAvatar.Name, 
                    location = wonAvatar.Location,
                    imageUrl = wonAvatar.ImageUrl 
                } 
            });
        }

        public async Task<IActionResult> Leaderboard()
        {
            var leaderboard = await GetLeaderboard();
            return View(leaderboard);
        }

        private async Task<UserDashboardViewModel> GetUserDashboardViewModel(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            
            var collectedAvatars = await _context.UserCollections
                .Where(uc => uc.UserId == userId)
                .Include(uc => uc.GanpatiAvatar)
                .Select(uc => uc.GanpatiAvatar)
                .ToListAsync();

            var allAvatars = await _context.GanpatiAvatars
                .Where(ga => ga.IsActive)
                .ToListAsync();

            var remainingAvatars = allAvatars.Except(collectedAvatars).ToList();

            var canScratchToday = user.LastScratchDate?.Date != DateTime.Today;
            
            TimeSpan? timeUntilNextScratch = null;
            if (!canScratchToday)
            {
                var tomorrow = DateTime.Today.AddDays(1);
                timeUntilNextScratch = tomorrow - DateTime.Now;
            }

            var leaderboard = await GetLeaderboard();
            var userRank = leaderboard.FindIndex(l => l.UserId == userId) + 1;
            var completionPercentage = allAvatars.Count > 0 ? (decimal)collectedAvatars.Count / allAvatars.Count * 100 : 0;

            return new UserDashboardViewModel
            {
                User = user,
                CollectedAvatars = collectedAvatars,
                RemainingAvatars = remainingAvatars,
                CanScratchToday = canScratchToday,
                TimeUntilNextScratch = timeUntilNextScratch,
                Leaderboard = leaderboard.Take(10).ToList(),
                UserRank = userRank,
                CompletionPercentage = completionPercentage
            };
        }

        private async Task<List<LeaderboardViewModel>> GetLeaderboard()
        {
            var totalAvatars = await _context.GanpatiAvatars.CountAsync(ga => ga.IsActive);

            var leaderboard = await _context.Users
                .Where(u => u.Role == UserRole.User && u.IsActive && !u.IsBlocked)
                .GroupJoin(_context.UserCollections, u => u.Id, uc => uc.UserId,
                          (user, collections) => new LeaderboardViewModel
                          {
                              UserId = user.Id,
                              UserName = user.Name,
                              CollectedCount = collections.Count(),
                              TotalAvatars = totalAvatars,
                              CollectedAvatars = collections.Select(c => c.GanpatiAvatar.Name).ToList()
                          })
                .OrderByDescending(l => l.CollectedCount)
                .ThenBy(l => l.UserName)
                .ToListAsync();

            // Assign ranks
            for (int i = 0; i < leaderboard.Count; i++)
            {
                leaderboard[i].Rank = i + 1;
            }

            return leaderboard;
        }
    }
}