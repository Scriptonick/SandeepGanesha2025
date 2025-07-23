import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import ScratchModal from '../components/ScratchModal';

const HomeScreen = () => {
  const { user } = useAuth();
  const { 
    avatars, 
    getUserCollections, 
    canScratchToday, 
    getTimeUntilNextScratch, 
    scratchCard,
    getLeaderboard 
  } = useGame();

  const [showScratchModal, setShowScratchModal] = useState(false);
  const [scratchResult, setScratchResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [scratching, setScratching] = useState(false);

  const userCollections = getUserCollections(user?.id);
  const collectedAvatars = avatars.filter(avatar => userCollections.includes(avatar.id));
  const remainingAvatars = avatars.filter(avatar => !userCollections.includes(avatar.id));
  const canScratch = canScratchToday(user?.id);
  const leaderboard = getLeaderboard();
  const userRank = leaderboard.findIndex(entry => entry.id === user?.id) + 1 || 'N/A';
  const completionPercentage = (collectedAvatars.length / avatars.length) * 100;

  useEffect(() => {
    if (!canScratch) {
      const updateTimer = () => {
        const time = getTimeUntilNextScratch(user?.id);
        setTimeLeft(time);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [canScratch, user?.id, getTimeUntilNextScratch]);

  const handleScratch = async () => {
    setScratching(true);
    
    // Add delay for better UX
    setTimeout(async () => {
      const result = await scratchCard(user?.id);
      setScratchResult(result);
      setShowScratchModal(true);
      setScratching(false);
    }, 2000);
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">🕉️ Ganpati Collection</div>
        <div className="screen-subtitle">Welcome back, {user?.name}!</div>
      </div>

      {/* Progress Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🏆 Your Progress
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="progress-circle">
            <svg viewBox="0 0 100 100">
              <circle
                className="progress-circle-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className="progress-circle-fill"
                cx="50"
                cy="50"
                r="45"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="progress-text">
              <div className="progress-number">{collectedAvatars.length}/8</div>
              <div className="progress-label">Collected</div>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b4513', margin: '5px 0' }}>
              {completionPercentage.toFixed(1)}% Complete
            </p>
            <p style={{ color: '#6c757d' }}>Rank: #{userRank}</p>
          </div>
        </div>
      </div>

      {/* Scratch Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🎫 Daily Scratch Card
          </div>
        </div>
        
        {canScratch ? (
          <div 
            className={`scratch-card ${scratching ? 'pulse' : ''}`}
            onClick={!scratching ? handleScratch : undefined}
            style={{ cursor: scratching ? 'not-allowed' : 'pointer' }}
          >
            <div className="scratch-icon">
              {scratching ? '⏳' : '🕉️'}
            </div>
            <div className="scratch-title">
              {scratching ? 'Scratching...' : 'SCRATCH ME!'}
            </div>
            <div className="scratch-subtitle">
              {scratching ? 'Please wait...' : 'Get your daily avatar chance'}
            </div>
          </div>
        ) : (
          <div className="countdown-card">
            <div className="countdown-icon">⏰</div>
            <h4 style={{ color: '#8b4513', marginBottom: '10px' }}>Next scratch available in:</h4>
            {timeLeft && (
              <div className="countdown-time">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            )}
            <p style={{ color: '#6c757d', marginTop: '10px' }}>Come back tomorrow for another chance!</p>
          </div>
        )}
      </div>

      {/* Mini Leaderboard */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🏅 Top Collectors
          </div>
        </div>
        <div>
          {leaderboard.slice(0, 5).map((entry, index) => (
            <div 
              key={entry.id} 
              className={`leaderboard-item ${entry.id === user?.id ? 'current-user' : ''}`}
            >
              <div className="leaderboard-rank">#{entry.rank}</div>
              <div className="leaderboard-info">
                <div className="leaderboard-name">{entry.name}</div>
                <div className="leaderboard-progress">
                  {entry.completionPercentage.toFixed(1)}% complete
                </div>
              </div>
              <div className="leaderboard-score">{entry.collectedCount}/8</div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Collection */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🕉️ Ashtavinayak Collection
          </div>
        </div>
        <div className="avatar-grid">
          {avatars.map(avatar => {
            const isCollected = userCollections.includes(avatar.id);
            return (
              <div key={avatar.id} className={`avatar-card ${isCollected ? 'collected' : ''}`}>
                <div className={`avatar-image ${!isCollected ? 'mystery' : ''}`}>
                  {isCollected ? avatar.emoji : '?'}
                  {isCollected && <div className="avatar-check">✓</div>}
                </div>
                <div className="avatar-name">{avatar.name}</div>
                <div className="avatar-location">{avatar.location}</div>
                <div className={`avatar-status ${isCollected ? 'collected' : 'missing'}`}>
                  {isCollected ? 'Collected ✨' : 'Not Found'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Branding Footer */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: 'linear-gradient(135deg, #ff6600, #ffcc33)', 
        borderRadius: '15px',
        textAlign: 'center',
        color: 'white'
      }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
          ⭐ Powered by Orion Stars ⭐
        </p>
        <p style={{ fontSize: '14px', margin: '0', opacity: 0.9 }}>
          Supported by Sandeep CHSL
        </p>
      </div>

      {/* Scratch Result Modal */}
      {showScratchModal && scratchResult && (
        <ScratchModal
          result={scratchResult}
          onClose={() => {
            setShowScratchModal(false);
            setScratchResult(null);
          }}
        />
      )}
    </div>
  );
};

export default HomeScreen;