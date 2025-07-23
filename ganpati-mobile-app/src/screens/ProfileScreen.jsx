import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { avatars, getUserCollections } = useGame();
  
  const userCollections = getUserCollections(user?.id);
  const collectedAvatars = avatars.filter(avatar => userCollections.includes(avatar.id));
  const completionPercentage = (collectedAvatars.length / avatars.length) * 100;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">👤 Profile</div>
        <div className="screen-subtitle">Your Game Stats</div>
      </div>

      {/* User Info */}
      <div className="card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #ff6600, #ffcc33)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
            color: 'white'
          }}>
            👤
          </div>
          <h2 style={{ color: '#8b4513', marginBottom: '5px' }}>{user?.name}</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>{user?.email}</p>
          <div style={{ 
            display: 'inline-block',
            padding: '6px 12px',
            background: user?.role === 'admin' ? '#dc3545' : '#28a745',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {user?.role}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            📊 Collection Stats
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '20px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {collectedAvatars.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Avatars Collected</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {completionPercentage.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Completion</div>
          </div>
        </div>
      </div>

      {/* Collected Avatars */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🏆 Your Collection
          </div>
        </div>
        
        {collectedAvatars.length > 0 ? (
          <div className="avatar-grid">
            {collectedAvatars.map(avatar => (
              <div key={avatar.id} className="avatar-card collected">
                <div className="avatar-image">
                  {avatar.emoji}
                  <div className="avatar-check">✓</div>
                </div>
                <div className="avatar-name">{avatar.name}</div>
                <div className="avatar-location">{avatar.location}</div>
                <div className="avatar-status collected">
                  Collected ✨
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎫</div>
            <h3 style={{ marginBottom: '10px' }}>No Avatars Yet</h3>
            <p>Start scratching daily cards to build your collection!</p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🏅 Achievements
          </div>
        </div>
        
        <div style={{ padding: '10px 0' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '15px', 
            background: collectedAvatars.length >= 1 ? '#28a745' : '#e9ecef',
            color: collectedAvatars.length >= 1 ? 'white' : '#6c757d',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '24px', marginRight: '15px' }}>🎯</div>
            <div>
              <div style={{ fontWeight: 'bold' }}>First Collection</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Collect your first avatar</div>
            </div>
            {collectedAvatars.length >= 1 && (
              <div style={{ marginLeft: 'auto', fontSize: '20px' }}>✓</div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '15px', 
            background: collectedAvatars.length >= 4 ? '#28a745' : '#e9ecef',
            color: collectedAvatars.length >= 4 ? 'white' : '#6c757d',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '24px', marginRight: '15px' }}>🔥</div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Halfway There</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Collect 4 avatars</div>
            </div>
            {collectedAvatars.length >= 4 && (
              <div style={{ marginLeft: 'auto', fontSize: '20px' }}>✓</div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '15px', 
            background: collectedAvatars.length >= 8 ? '#28a745' : '#e9ecef',
            color: collectedAvatars.length >= 8 ? 'white' : '#6c757d',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', marginRight: '15px' }}>👑</div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Master Collector</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Collect all 8 avatars</div>
            </div>
            {collectedAvatars.length >= 8 && (
              <div style={{ marginLeft: 'auto', fontSize: '20px' }}>✓</div>
            )}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="card">
        <button 
          className="btn btn-danger" 
          onClick={handleLogout}
          style={{ width: '100%' }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;