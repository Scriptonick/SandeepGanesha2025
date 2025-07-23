import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { getStats } = useGame();
  
  const stats = getStats();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="screen">
      <div className="admin-header">
        <div className="screen-title">🛠️ Admin Dashboard</div>
        <div className="screen-subtitle">Welcome, {user?.name}</div>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalAvatars}</div>
          <div className="stat-label">Total Avatars</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalCollections}</div>
          <div className="stat-label">Collections</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.todayScratches}</div>
          <div className="stat-label">Today's Scratches</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            ⚡ Quick Actions
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <Link to="/admin/inventory" className="btn btn-primary">
            📦 Manage Inventory
          </Link>
          <Link to="/admin/users" className="btn btn-success">
            👥 Manage Users
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            ℹ️ System Information
          </div>
        </div>
        
        <div style={{ padding: '10px 0' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '10px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <span style={{ color: '#6c757d' }}>Game Version:</span>
            <span style={{ fontWeight: 'bold' }}>1.0.0</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '10px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <span style={{ color: '#6c757d' }}>Active Users:</span>
            <span style={{ fontWeight: 'bold' }}>{stats.totalUsers}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '10px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <span style={{ color: '#6c757d' }}>Total Collections:</span>
            <span style={{ fontWeight: 'bold' }}>{stats.totalCollections}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '10px 0'
          }}>
            <span style={{ color: '#6c757d' }}>Win Rate:</span>
            <span style={{ fontWeight: 'bold' }}>30%</span>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🔧 Admin Tools
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          <button 
            className="btn btn-outline"
            onClick={() => alert('Feature coming soon!')}
          >
            📊 Export Reports
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => alert('Feature coming soon!')}
          >
            🔄 Reset Daily Scratches
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
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
    </div>
  );
};

export default AdminDashboard;