import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  const [gameData, setGameData] = useState({
    avatars: [],
    userCollections: {},
    inventory: {},
    scratchHistory: {},
    leaderboard: []
  });

  // Ashtavinayak Avatars
  const avatars = [
    { id: 1, name: 'Mayureshwar', location: 'Morgaon', emoji: '🕉️' },
    { id: 2, name: 'Siddhivinayak', location: 'Siddhatek', emoji: '🐘' },
    { id: 3, name: 'Ballaleshwar', location: 'Pali', emoji: '🙏' },
    { id: 4, name: 'Varadavinayak', location: 'Mahad', emoji: '💎' },
    { id: 5, name: 'Chintamani', location: 'Theur', emoji: '🌟' },
    { id: 6, name: 'Girijatmaj', location: 'Lenyadri', emoji: '🏔️' },
    { id: 7, name: 'Vighnahar', location: 'Ozar', emoji: '⚡' },
    { id: 8, name: 'Mahaganapati', location: 'Ranjangaon', emoji: '👑' }
  ];

  useEffect(() => {
    // Initialize game data
    const storedData = localStorage.getItem('ganpati_game_data');
    if (storedData) {
      setGameData(JSON.parse(storedData));
    } else {
      // Initialize with default data
      const initialData = {
        avatars,
        userCollections: {},
        inventory: {
          1: 15, // Mayureshwar - moderate availability
          2: 8,  // Siddhivinayak - rare
          3: 20, // Ballaleshwar - common
          4: 12, // Varadavinayak - moderate
          5: 5,  // Chintamani - very rare
          6: 18, // Girijatmaj - common
          7: 10, // Vighnahar - moderate
          8: 3   // Mahaganapati - extremely rare
        },
        scratchHistory: {},
        leaderboard: []
      };
      setGameData(initialData);
      localStorage.setItem('ganpati_game_data', JSON.stringify(initialData));
    }
  }, []);

  const saveGameData = (newData) => {
    setGameData(newData);
    localStorage.setItem('ganpati_game_data', JSON.stringify(newData));
  };

  const getUserCollections = (userId) => {
    return gameData.userCollections[userId] || [];
  };

  const canScratchToday = (userId) => {
    const userHistory = gameData.scratchHistory[userId] || [];
    if (userHistory.length === 0) return true;
    
    // For testing: 1 minute cooldown instead of 24 hours
    const lastScratch = userHistory[userHistory.length - 1];
    const lastScratchTime = new Date(lastScratch.date);
    const now = new Date();
    const timeDiff = now - lastScratchTime;
    const oneMinuteInMs = 60 * 1000;
    
    return timeDiff >= oneMinuteInMs;
  };

  const getTimeUntilNextScratch = (userId) => {
    if (canScratchToday(userId)) return null;
    
    // For testing: 1 minute cooldown instead of 24 hours
    const userHistory = gameData.scratchHistory[userId] || [];
    const lastScratch = userHistory[userHistory.length - 1];
    if (!lastScratch) return null;
    
    const nextScratchTime = new Date(lastScratch.date);
    nextScratchTime.setMinutes(nextScratchTime.getMinutes() + 1);
    
    const now = new Date();
    const diff = nextScratchTime - now;
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const scratchCard = async (userId) => {
    if (!canScratchToday(userId)) {
      return { success: false, message: 'Already scratched today!' };
    }

    const userCollections = getUserCollections(userId);
    const userScratchCount = gameData.scratchHistory[userId]?.length || 0;
    
    const availableAvatars = avatars.filter(avatar => 
      !userCollections.includes(avatar.id) && gameData.inventory[avatar.id] > 0
    );

    if (availableAvatars.length === 0) {
      return { success: false, message: 'No avatars available!' };
    }

    // Filter out rare avatars for first 5 tries
    let selectableAvatars = availableAvatars;
    if (userScratchCount < 5) {
      // Exclude Chintamani (id: 5) and Mahaganapati (id: 8) for first 5 tries
      selectableAvatars = availableAvatars.filter(avatar => 
        avatar.id !== 5 && avatar.id !== 8
      );
      
      // If no common avatars available, allow rare ones
      if (selectableAvatars.length === 0) {
        selectableAvatars = availableAvatars;
      }
    }

    // 70% chance to win for better testing experience
    const isWon = Math.random() < 0.7;
    const selectedAvatar = selectableAvatars[Math.floor(Math.random() * selectableAvatars.length)];

    const newData = { ...gameData };
    
    // Add to scratch history
    if (!newData.scratchHistory[userId]) {
      newData.scratchHistory[userId] = [];
    }
    newData.scratchHistory[userId].push({
      date: new Date().toISOString(),
      avatarId: selectedAvatar.id,
      won: isWon
    });

    if (isWon) {
      // Add to user collection
      if (!newData.userCollections[userId]) {
        newData.userCollections[userId] = [];
      }
      newData.userCollections[userId].push(selectedAvatar.id);
      
      // Reduce inventory
      newData.inventory[selectedAvatar.id]--;
    }

    saveGameData(newData);

    return {
      success: true,
      won: isWon,
      avatar: selectedAvatar,
      message: isWon ? 'Congratulations! 🎉' : 'Better luck tomorrow! 😔'
    };
  };

  const getLeaderboard = () => {
    const users = [
      { id: 2, name: 'John Doe' },
      { id: 3, name: 'Jane Smith' },
      { id: 4, name: 'Mike Johnson' },
      { id: 5, name: 'Sarah Wilson' },
      { id: 6, name: 'David Brown' }
    ];

    return users.map(user => {
      const collections = getUserCollections(user.id);
      return {
        ...user,
        collectedCount: collections.length,
        totalAvatars: avatars.length,
        completionPercentage: (collections.length / avatars.length) * 100
      };
    }).sort((a, b) => b.collectedCount - a.collectedCount)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  };

  const updateInventory = (avatarId, quantity) => {
    const newData = { ...gameData };
    newData.inventory[avatarId] = quantity;
    saveGameData(newData);
  };

  const assignScratchToUser = (userId, avatarId) => {
    const newData = { ...gameData };
    
    // Add to user collection
    if (!newData.userCollections[userId]) {
      newData.userCollections[userId] = [];
    }
    
    // Check if user already has this avatar
    if (newData.userCollections[userId].includes(avatarId)) {
      return { success: false, message: 'User already has this avatar!' };
    }
    
    // Check if avatar is available in inventory
    if (newData.inventory[avatarId] <= 0) {
      return { success: false, message: 'Avatar not available in inventory!' };
    }
    
    newData.userCollections[userId].push(avatarId);
    
    // Reduce inventory
    newData.inventory[avatarId]--;
    
    // Add to scratch history
    if (!newData.scratchHistory[userId]) {
      newData.scratchHistory[userId] = [];
    }
    newData.scratchHistory[userId].push({
      date: new Date().toISOString(),
      avatarId: avatarId,
      won: true,
      adminAssigned: true
    });
    
    saveGameData(newData);
    
    const avatar = avatars.find(a => a.id === avatarId);
    return { 
      success: true, 
      message: `Successfully assigned ${avatar.name} to user!`,
      avatar: avatar
    };
  };

  const getStats = () => {
    const totalUsers = 5; // Demo data
    const totalCollections = Object.values(gameData.userCollections).reduce((sum, collections) => sum + collections.length, 0);
    const todayScratches = Object.values(gameData.scratchHistory).reduce((sum, history) => {
      const today = new Date().toDateString();
      return sum + history.filter(scratch => new Date(scratch.date).toDateString() === today).length;
    }, 0);

    return {
      totalUsers,
      totalAvatars: avatars.length,
      totalCollections,
      todayScratches
    };
  };

  const value = {
    avatars,
    gameData,
    getUserCollections,
    canScratchToday,
    getTimeUntilNextScratch,
    scratchCard,
    getLeaderboard,
    updateInventory,
    assignScratchToUser,
    getStats
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};