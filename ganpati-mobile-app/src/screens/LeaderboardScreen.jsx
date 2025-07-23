import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

const LeaderboardScreen = () => {
  const { user } = useAuth();
  const { getLeaderboard } = useGame();
  
  const leaderboard = getLeaderboard();

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">🏅 Leaderboard</div>
        <div className="screen-subtitle">Top Collectors</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🏆 Rankings
          </div>
        </div>
        
        <div>
          {leaderboard.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`leaderboard-item ${entry.id === user?.id ? 'current-user' : ''}`}
            >
              <div className="leaderboard-rank">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${entry.rank}`}
              </div>
              <div className="leaderboard-info">
                <div className="leaderboard-name">
                  {entry.name}
                  {entry.id === user?.id && ' (You)'}
                </div>
                <div className="leaderboard-progress">
                  {entry.completionPercentage.toFixed(1)}% complete
                </div>
              </div>
              <div className="leaderboard-score">{entry.collectedCount}/8</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            📊 Your Stats
          </div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
                {leaderboard.find(entry => entry.id === user?.id)?.rank || 'N/A'}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>Your Rank</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
                {leaderboard.find(entry => entry.id === user?.id)?.collectedCount || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>Collected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🎯 Collection Tips
          </div>
        </div>
        
        <div style={{ padding: '10px 0' }}>
          <div style={{ marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🎫 Daily Scratch</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Don't forget to scratch your daily card for a chance to win new avatars!
            </div>
          </div>
          
          <div style={{ marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🍀 30% Win Rate</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Each scratch card has a 30% chance of winning. Keep trying daily!
            </div>
          </div>
          
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🏆 Complete Collection</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Collect all 8 Ashtavinayak avatars to become the ultimate champion!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;