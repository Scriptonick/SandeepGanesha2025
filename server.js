const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'GanpatiFestivalGame',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 1) { // 1 = Admin
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Routes

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute(
      'SELECT * FROM Users WHERE Email = ? AND IsActive = 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is blocked
    if (user.IsBlocked) {
      return res.status(401).json({ error: 'Your account has been blocked' });
    }

    // For demo purposes, we'll use plain text password comparison
    // In production, use bcrypt.compare(password, user.Password)
    if (password !== user.Password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.Id, 
        email: user.Email, 
        role: user.Role,
        name: user.Name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        role: user.Role === 1 ? 'admin' : 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT Id FROM Users WHERE Email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO Users (Name, Email, Password, Role) VALUES (?, ?, ?, 2)',
      [name, email, password] // In production, hash the password
    );

    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        role: 2,
        name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Avatar Routes
app.get('/api/avatars', async (req, res) => {
  try {
    const [avatars] = await pool.execute(
      'SELECT * FROM GanpatiAvatars WHERE IsActive = 1 ORDER BY Id'
    );
    res.json(avatars);
  } catch (error) {
    console.error('Get avatars error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Collection Routes
app.get('/api/collections/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [collections] = await pool.execute(
      'SELECT GanpatiAvatarId FROM UserCollections WHERE UserId = ?',
      [userId]
    );
    
    res.json(collections.map(c => c.GanpatiAvatarId));
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scratch Card Routes
app.get('/api/scratch/can-scratch/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [user] = await pool.execute(
      'SELECT LastScratchDate FROM Users WHERE Id = ?',
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const lastScratchDate = user[0].LastScratchDate;
    const today = new Date().toISOString().split('T')[0];
    
    // For testing: allow scratch every minute instead of daily
    const canScratch = !lastScratchDate || 
      (new Date() - new Date(lastScratchDate)) >= 60000; // 1 minute
    
    res.json({ canScratch });
  } catch (error) {
    console.error('Can scratch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/scratch/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user can scratch
    const [user] = await pool.execute(
      'SELECT LastScratchDate FROM Users WHERE Id = ? AND IsActive = 1 AND IsBlocked = 0',
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found or blocked' });
    }
    
    const lastScratchDate = user[0].LastScratchDate;
    const now = new Date();
    
    // For testing: 1 minute cooldown
    if (lastScratchDate && (now - new Date(lastScratchDate)) < 60000) {
      return res.status(400).json({ error: 'Already scratched recently' });
    }
    
    // Get available avatars
    const [collectedAvatars] = await pool.execute(
      'SELECT GanpatiAvatarId FROM UserCollections WHERE UserId = ?',
      [userId]
    );
    
    const collectedIds = collectedAvatars.map(c => c.GanpatiAvatarId);
    const placeholders = collectedIds.length > 0 ? collectedIds.map(() => '?').join(',') : '0';
    
    const [availableAvatars] = await pool.execute(
      `SELECT ga.* FROM GanpatiAvatars ga 
       JOIN AvatarInventories ai ON ga.Id = ai.GanpatiAvatarId 
       WHERE ga.IsActive = 1 AND ai.Quantity > 0 
       ${collectedIds.length > 0 ? `AND ga.Id NOT IN (${placeholders})` : ''}`,
      collectedIds
    );
    
    if (availableAvatars.length === 0) {
      return res.status(400).json({ error: 'No avatars available' });
    }
    
    // Random selection with 70% win rate
    const selectedAvatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
    const isWon = Math.random() < 0.7;
    
    // Update user's last scratch date
    await pool.execute(
      'UPDATE Users SET LastScratchDate = ? WHERE Id = ?',
      [now, userId]
    );
    
    // Record scratch
    await pool.execute(
      'INSERT INTO ScratchCards (UserId, GanpatiAvatarId, IsWon) VALUES (?, ?, ?)',
      [userId, selectedAvatar.Id, isWon]
    );
    
    if (isWon) {
      // Add to collection
      await pool.execute(
        'INSERT INTO UserCollections (UserId, GanpatiAvatarId) VALUES (?, ?)',
        [userId, selectedAvatar.Id]
      );
      
      // Reduce inventory
      await pool.execute(
        'UPDATE AvatarInventories SET Quantity = Quantity - 1 WHERE GanpatiAvatarId = ?',
        [selectedAvatar.Id]
      );
    }
    
    res.json({
      success: true,
      won: isWon,
      avatar: {
        id: selectedAvatar.Id,
        name: selectedAvatar.Name,
        location: selectedAvatar.Location,
        emoji: getAvatarEmoji(selectedAvatar.Id)
      },
      message: isWon ? 'Congratulations! 🎉' : 'Better luck next time! 😔'
    });
  } catch (error) {
    console.error('Scratch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard Routes
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [leaderboard] = await pool.execute(`
      SELECT 
        u.Id,
        u.Name,
        COUNT(uc.Id) as CollectedCount,
        (SELECT COUNT(*) FROM GanpatiAvatars WHERE IsActive = 1) as TotalAvatars
      FROM Users u
      LEFT JOIN UserCollections uc ON u.Id = uc.UserId
      WHERE u.Role = 2 AND u.IsActive = 1 AND u.IsBlocked = 0
      GROUP BY u.Id, u.Name
      ORDER BY CollectedCount DESC, u.Name ASC
    `);
    
    const result = leaderboard.map((entry, index) => ({
      id: entry.Id,
      name: entry.Name,
      collectedCount: entry.CollectedCount,
      totalAvatars: entry.TotalAvatars,
      completionPercentage: (entry.CollectedCount / entry.TotalAvatars) * 100,
      rank: index + 1
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.Id,
        u.Name,
        u.Email,
        u.IsBlocked,
        u.CreatedAt,
        COUNT(uc.Id) as CollectedCount,
        (SELECT COUNT(*) FROM GanpatiAvatars WHERE IsActive = 1) as TotalAvatars
      FROM Users u
      LEFT JOIN UserCollections uc ON u.Id = uc.UserId
      WHERE u.Role = 2
      GROUP BY u.Id, u.Name, u.Email, u.IsBlocked, u.CreatedAt
      ORDER BY u.Name
    `);
    
    const result = users.map(user => ({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      isBlocked: user.IsBlocked,
      createdAt: user.CreatedAt,
      collectedCount: user.CollectedCount,
      totalAvatars: user.TotalAvatars,
      completionPercentage: (user.CollectedCount / user.TotalAvatars) * 100
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT Id FROM Users WHERE Email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO Users (Name, Email, Password, Role) VALUES (?, ?, ?, 2)',
      [name, email, password]
    );
    
    res.json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password } = req.body;
    
    await pool.execute(
      'UPDATE Users SET Name = ?, Email = ?, Password = ? WHERE Id = ? AND Role = 2',
      [name, email, password, userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete user collections first
    await pool.execute('DELETE FROM UserCollections WHERE UserId = ?', [userId]);
    await pool.execute('DELETE FROM ScratchCards WHERE UserId = ?', [userId]);
    await pool.execute('DELETE FROM Users WHERE Id = ? AND Role = 2', [userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/users/:userId/block', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { blocked } = req.body;
    
    await pool.execute(
      'UPDATE Users SET IsBlocked = ? WHERE Id = ? AND Role = 2',
      [blocked, userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:userId/assign-scratch', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Reset user's last scratch date to allow immediate scratch
    const pastTime = new Date();
    pastTime.setMinutes(pastTime.getMinutes() - 2);
    
    await pool.execute(
      'UPDATE Users SET LastScratchDate = ? WHERE Id = ?',
      [pastTime, userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Successfully gave user a new scratch card! They can scratch immediately now.' 
    });
  } catch (error) {
    console.error('Assign scratch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inventory Routes
app.get('/api/admin/inventory', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [inventory] = await pool.execute(`
      SELECT 
        ai.Id,
        ai.GanpatiAvatarId,
        ai.Quantity,
        ga.Name,
        ga.Location
      FROM AvatarInventories ai
      JOIN GanpatiAvatars ga ON ai.GanpatiAvatarId = ga.Id
      WHERE ga.IsActive = 1
      ORDER BY ga.Id
    `);
    
    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/inventory/:avatarId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { avatarId } = req.params;
    const { quantity } = req.body;
    
    await pool.execute(
      'UPDATE AvatarInventories SET Quantity = ?, UpdatedAt = NOW() WHERE GanpatiAvatarId = ?',
      [quantity, avatarId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stats Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [userCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM Users WHERE Role = 2 AND IsActive = 1'
    );
    
    const [avatarCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM GanpatiAvatars WHERE IsActive = 1'
    );
    
    const [collectionCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM UserCollections'
    );
    
    const [todayScratches] = await pool.execute(
      'SELECT COUNT(*) as count FROM ScratchCards WHERE DATE(ScratchedAt) = CURDATE()'
    );
    
    res.json({
      totalUsers: userCount[0].count,
      totalAvatars: avatarCount[0].count,
      totalCollections: collectionCount[0].count,
      todayScratches: todayScratches[0].count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get avatar emoji
function getAvatarEmoji(avatarId) {
  const emojiMap = {
    1: '🕉️', // Mayureshwar
    2: '🐘', // Siddhivinayak
    3: '🙏', // Ballaleshwar
    4: '💎', // Varadavinayak
    5: '🌟', // Chintamani
    6: '🏔️', // Girijatmaj
    7: '⚡', // Vighnahar
    8: '👑'  // Mahaganapati
  };
  return emojiMap[avatarId] || '🕉️';
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ganpati Festival API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, async () => {
  await testConnection();
  console.log(`🚀 Ganpati Festival API server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
});