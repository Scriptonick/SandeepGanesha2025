import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dbHelpers, getAvatarEmoji } from '../services/supabase';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { user } = useAuth();
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load avatars on mount
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      const avatarData = await dbHelpers.getAvatars();
      const avatarsWithEmojis = avatarData.map(avatar => ({
        ...avatar,
        id: avatar.id,
        name: avatar.name,
        location: avatar.location,
        emoji: getAvatarEmoji(avatar.id)
      }));
      setAvatars(avatarsWithEmojis);
    } catch (error) {
      console.error('Load avatars error:', error);
    }
  };

  const getUserCollections = async (userId) => {
    try {
      return await dbHelpers.getUserCollections(userId);
    } catch (error) {
      console.error('Get collections error:', error);
      return [];
    }
  };

  const canScratchToday = async (userId) => {
    try {
      return await dbHelpers.canScratchToday(userId);
    } catch (error) {
      console.error('Can scratch error:', error);
      return false;
    }
  };

  const getTimeUntilNextScratch = (userId) => {
    // This is a simplified version - in a real app, you'd get this from the API
    // For now, we'll use a 1-minute countdown for testing
    const nextScratch = new Date();
    nextScratch.setMinutes(nextScratch.getMinutes() + 1);
    
    const now = new Date();
    const diff = nextScratch - now;
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const scratchCard = async (userId) => {
    try {
      return await dbHelpers.scratchCard(userId);
    } catch (error) {
      console.error('Scratch card error:', error);
      return { success: false, message: error.message };
    }
  };

  const getLeaderboard = async () => {
    try {
      return await dbHelpers.getLeaderboard();
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return [];
    }
  };

  const updateInventory = async (avatarId, quantity) => {
    try {
      await dbHelpers.updateInventory(avatarId, quantity);
      return { success: true };
    } catch (error) {
      console.error('Update inventory error:', error);
      return { success: false, error: error.message };
    }
  };

  const assignScratchToUser = async (userId) => {
    try {
      // Reset user's last scratch date to allow immediate scratch
      await dbHelpers.updateUser(userId, { 
        last_scratch_date: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
      });
      return { 
        success: true, 
        message: 'Successfully gave user a new scratch card! They can scratch immediately now.' 
      };
    } catch (error) {
      console.error('Assign scratch error:', error);
      return { success: false, message: error.message };
    }
  };

  const getStats = async () => {
    try {
      return await dbHelpers.getAdminStats();
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        totalUsers: 0,
        totalAvatars: 8,
        totalCollections: 0,
        todayScratches: 0
      };
    }
  };

  const getInventory = async () => {
    try {
      return await dbHelpers.getInventory();
    } catch (error) {
      console.error('Get inventory error:', error);
      return [];
    }
  };

  const value = {
    avatars,
    loading,
    getUserCollections,
    canScratchToday,
    getTimeUntilNextScratch,
    scratchCard,
    getLeaderboard,
    updateInventory,
    assignScratchToUser,
    getStats,
    getInventory
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};