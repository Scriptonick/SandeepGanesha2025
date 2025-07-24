import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Avatar emoji mapping
export const getAvatarEmoji = (avatarId) => {
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
};

// Database helper functions
export const dbHelpers = {
  // Auth functions
  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    if (error) throw error;
    
    // Insert user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            name: name,
            email: email,
            role: 2, // Regular user
            is_active: true,
            is_blocked: false
          }
        ]);
      
      if (profileError) throw profileError;
    }
    
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Avatar functions
  async getAvatars() {
    const { data, error } = await supabase
      .from('ganpati_avatars')
      .select('*')
      .eq('is_active', true)
      .order('id');
    
    if (error) throw error;
    return data;
  },

  // Collection functions
  async getUserCollections(userId) {
    const { data, error } = await supabase
      .from('user_collections')
      .select('ganpati_avatar_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data.map(item => item.ganpati_avatar_id);
  },

  // Scratch functions
  async canScratchToday(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('last_scratch_date')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    const lastScratchDate = data.last_scratch_date;
    const now = new Date();
    
    // For testing: allow scratch every minute instead of daily
    if (!lastScratchDate) return true;
    
    const timeDiff = now - new Date(lastScratchDate);
    return timeDiff >= 60000; // 1 minute for testing
  },

  async scratchCard(userId) {
    try {
      // Check if user can scratch
      const canScratch = await this.canScratchToday(userId);
      if (!canScratch) {
        return { success: false, message: 'Already scratched recently' };
      }

      // Get user's collected avatars
      const collectedAvatars = await this.getUserCollections(userId);
      
      // Get available avatars (not collected and have inventory)
      const { data: availableAvatars, error: avatarError } = await supabase
        .from('ganpati_avatars')
        .select(`
          *,
          avatar_inventories!inner(quantity)
        `)
        .eq('is_active', true)
        .gt('avatar_inventories.quantity', 0)
        .not('id', 'in', `(${collectedAvatars.join(',') || '0'})`);

      if (avatarError) throw avatarError;
      
      if (!availableAvatars || availableAvatars.length === 0) {
        return { success: false, message: 'No avatars available' };
      }

      // Random selection with 70% win rate
      const selectedAvatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
      const isWon = Math.random() < 0.7;
      const now = new Date().toISOString();

      // Update user's last scratch date
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_scratch_date: now })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Record scratch
      const { error: scratchError } = await supabase
        .from('scratch_cards')
        .insert([{
          user_id: userId,
          ganpati_avatar_id: selectedAvatar.id,
          is_won: isWon,
          scratched_at: now
        }]);

      if (scratchError) throw scratchError;

      if (isWon) {
        // Add to collection
        const { error: collectionError } = await supabase
          .from('user_collections')
          .insert([{
            user_id: userId,
            ganpati_avatar_id: selectedAvatar.id,
            collected_at: now
          }]);

        if (collectionError) throw collectionError;

        // Reduce inventory
        const { error: inventoryError } = await supabase
          .from('avatar_inventories')
          .update({ 
            quantity: selectedAvatar.avatar_inventories.quantity - 1,
            updated_at: now
          })
          .eq('ganpati_avatar_id', selectedAvatar.id);

        if (inventoryError) throw inventoryError;
      }

      return {
        success: true,
        won: isWon,
        avatar: {
          id: selectedAvatar.id,
          name: selectedAvatar.name,
          location: selectedAvatar.location,
          emoji: getAvatarEmoji(selectedAvatar.id)
        },
        message: isWon ? 'Congratulations! 🎉' : 'Better luck next time! 😔'
      };
    } catch (error) {
      console.error('Scratch error:', error);
      return { success: false, message: 'An error occurred' };
    }
  },

  // Leaderboard functions
  async getLeaderboard() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        user_collections(count)
      `)
      .eq('role', 2)
      .eq('is_active', true)
      .eq('is_blocked', false);

    if (error) throw error;

    const totalAvatars = 8;
    const leaderboard = data.map((user, index) => ({
      id: user.id,
      name: user.name,
      collectedCount: user.user_collections[0]?.count || 0,
      totalAvatars,
      completionPercentage: ((user.user_collections[0]?.count || 0) / totalAvatars) * 100,
      rank: index + 1
    }));

    // Sort by collected count descending
    leaderboard.sort((a, b) => b.collectedCount - a.collectedCount);
    
    // Update ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  },

  // Admin functions
  async getAdminUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_collections(count)
      `)
      .eq('role', 2)
      .order('name');

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isBlocked: user.is_blocked,
      createdAt: user.created_at,
      collectedCount: user.user_collections[0]?.count || 0,
      totalAvatars: 8,
      completionPercentage: ((user.user_collections[0]?.count || 0) / 8) * 100
    }));
  },

  async addUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        password: userData.password, // In production, this should be handled by Supabase Auth
        role: 2
      }]);

    if (error) throw error;
    return data;
  },

  async updateUser(userId, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId);

    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },

  async getInventory() {
    const { data, error } = await supabase
      .from('avatar_inventories')
      .select(`
        *,
        ganpati_avatars(name, location)
      `)
      .order('ganpati_avatar_id');

    if (error) throw error;
    return data;
  },

  async updateInventory(avatarId, quantity) {
    const { error } = await supabase
      .from('avatar_inventories')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('ganpati_avatar_id', avatarId);

    if (error) throw error;
  },

  async getAdminStats() {
    const { data: userCount, error: userError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 2)
      .eq('is_active', true);

    const { data: collectionCount, error: collectionError } = await supabase
      .from('user_collections')
      .select('id', { count: 'exact' });

    const { data: todayScratches, error: scratchError } = await supabase
      .from('scratch_cards')
      .select('id', { count: 'exact' })
      .gte('scratched_at', new Date().toISOString().split('T')[0]);

    if (userError || collectionError || scratchError) {
      throw userError || collectionError || scratchError;
    }

    return {
      totalUsers: userCount?.length || 0,
      totalAvatars: 8,
      totalCollections: collectionCount?.length || 0,
      todayScratches: todayScratches?.length || 0
    };
  }
};