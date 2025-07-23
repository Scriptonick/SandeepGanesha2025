using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GanpatiFestivalGame.Models;
using Microsoft.AspNetCore.Authorization;

namespace GanpatiFestivalGame.Controllers
{
    [Authorize]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Dashboard()
        {
            // Check if user is admin
            var userRole = User.FindFirst("Role")?.Value;
            if (userRole != "Admin")
                return Forbid();

            var totalUsers = await _context.Users.CountAsync(u => u.Role == UserRole.User && u.IsActive);
            var totalAvatars = await _context.GanpatiAvatars.CountAsync(ga => ga.IsActive);
            var totalCollections = await _context.UserCollections.CountAsync();
            var todaysScratches = await _context.ScratchCards.CountAsync(sc => sc.ScratchedAt.Date == DateTime.Today);

            ViewBag.TotalUsers = totalUsers;
            ViewBag.TotalAvatars = totalAvatars;
            ViewBag.TotalCollections = totalCollections;
            ViewBag.TodaysScratches = todaysScratches;

            return View();
        }

        public async Task<IActionResult> ManageInventory()
        {
            var inventories = await _context.AvatarInventories
                .Include(ai => ai.GanpatiAvatar)
                .ToListAsync();

            return View(inventories);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateInventory(int avatarId, int quantity)
        {
            var inventory = await _context.AvatarInventories
                .FirstOrDefaultAsync(ai => ai.GanpatiAvatarId == avatarId);

            if (inventory == null)
            {
                inventory = new AvatarInventory
                {
                    GanpatiAvatarId = avatarId,
                    Quantity = quantity,
                    UpdatedAt = DateTime.Now
                };
                _context.AvatarInventories.Add(inventory);
            }
            else
            {
                inventory.Quantity = quantity;
                inventory.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return RedirectToAction("ManageInventory");
        }

        public async Task<IActionResult> ManageUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role == UserRole.User)
                .OrderBy(u => u.Name)
                .ToListAsync();

            return View(users);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleUserBlock(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null && user.Role == UserRole.User)
            {
                user.IsBlocked = !user.IsBlocked;
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("ManageUsers");
        }

        public async Task<IActionResult> Reports()
        {
            var completionStats = await _context.Users
                .Where(u => u.Role == UserRole.User && u.IsActive && !u.IsBlocked)
                .Select(u => new
                {
                    User = u,
                    CompletedCount = _context.UserCollections.Count(uc => uc.UserId == u.Id)
                })
                .ToListAsync();

            var totalAvatars = await _context.GanpatiAvatars.CountAsync(ga => ga.IsActive);

            var reports = completionStats.Select(cs => new
            {
                UserName = cs.User.Name,
                Email = cs.User.Email,
                CompletedCount = cs.CompletedCount,
                TotalAvatars = totalAvatars,
                CompletionPercentage = totalAvatars > 0 ? (decimal)cs.CompletedCount / totalAvatars * 100 : 0,
                IsCompleted = cs.CompletedCount == totalAvatars
            }).OrderByDescending(r => r.CompletionPercentage).ToList();

            return View(reports);
        }
    }
}