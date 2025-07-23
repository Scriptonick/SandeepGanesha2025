import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

const AdminUsers = () => {
  const { assignScratchToUser } = useGame();
  const { getAllUsers, addUser, removeUser, updateUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '' });
  const [editUserData, setEditUserData] = useState({ name: '', email: '', password: '' });
  
  const users = getAllUsers();

  const toggleUserBlock = (userId) => {
    const newBlockedUsers = new Set(blockedUsers);
    if (newBlockedUsers.has(userId)) {
      newBlockedUsers.delete(userId);
    } else {
      newBlockedUsers.add(userId);
    }
    setBlockedUsers(newBlockedUsers);
    
    const action = newBlockedUsers.has(userId) ? 'blocked' : 'unblocked';
    alert(`User has been ${action} successfully!`);
  };

  const resetUserProgress = (userId, userName) => {
    if (window.confirm(`Are you sure you want to reset ${userName}'s progress? This action cannot be undone.`)) {
      // In a real app, this would call an API
      alert(`${userName}'s progress has been reset!`);
    }
  };

  const handleAssignScratch = (user) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const confirmAssignScratch = () => {
    const result = assignScratchToUser(selectedUser.id);
    alert(result.message);
    
    if (result.success) {
      setShowAssignModal(false);
      setSelectedUser(null);
    }
  };

  const handleAddUser = () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      alert('Please fill all fields');
      return;
    }

    const result = addUser(newUserData);
    if (result.success) {
      alert('User added successfully!');
      setShowAddModal(false);
      setNewUserData({ name: '', email: '', password: '' });
      window.location.reload(); // Refresh to show new user
    } else {
      alert(result.error);
    }
  };

  const handleRemoveUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) {
      const result = removeUser(userId);
      if (result.success) {
        alert('User removed successfully!');
        window.location.reload();
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      password: user.password
    });
    setShowEditModal(true);
  };

  const confirmEditUser = () => {
    if (!editUserData.name || !editUserData.email || !editUserData.password) {
      alert('Please fill all fields');
      return;
    }

    const result = updateUser(selectedUser.id, editUserData);
    if (result.success) {
      alert('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditUserData({ name: '', email: '', password: '' });
      window.location.reload();
    }
  };

  return (
    <div className="screen">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="screen-title">👥 User Management</div>
            <div className="screen-subtitle">Manage Game Users</div>
          </div>
          <Link to="/admin" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
            ← Back
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            📋 User List
          </div>
          <button
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            ➕ Add User
          </button>
        </div>
        
        <div>
          {users.map(user => {
            const isBlocked = blockedUsers.has(user.id);
            
            return (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p>{user.collectedCount}/8 avatars collected ({user.completionPercentage.toFixed(1)}%)</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={`user-status ${isBlocked ? 'blocked' : 'active'}`}>
                    {isBlocked ? 'Blocked' : 'Active'}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button
                      className={`btn ${isBlocked ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => toggleUserBlock(user.id)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEditUser(user)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAssignScratch(user)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Give Scratch
                    </button>
                    
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveUser(user.id, user.name)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            📊 User Statistics
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '20px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {users.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Total Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {blockedUsers.size}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Blocked Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {users.filter(u => u.completionPercentage === 100).length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {(users.reduce((sum, u) => sum + u.completionPercentage, 0) / users.length).toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Avg Progress</div>
          </div>
        </div>
      </div>

      {/* Assign Scratch Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🎁</div>
            <div className="modal-title">Assign Avatar</div>
            <div className="modal-message">
              <p>Assign avatar to <strong>{selectedUser?.name}</strong></p>
              <p style={{ marginTop: '15px', fontSize: '14px', color: '#6c757d' }}>
                This will give the user a new scratch card that they can use immediately to try winning an avatar.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowAssignModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmAssignScratch}
                style={{ flex: 1 }}
              >
               Give Scratch Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">👤</div>
            <div className="modal-title">Add New User</div>
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowAddModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleAddUser}
                style={{ flex: 1 }}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✏️</div>
            <div className="modal-title">Edit User</div>
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowEditModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-warning" 
                onClick={confirmEditUser}
                style={{ flex: 1 }}
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
      
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

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            ⚡ Bulk Actions
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          <button
            className="btn btn-warning"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all user progress? This action cannot be undone.')) {
                alert('All user progress has been reset!');
              }
            }}
          >
            🔄 Reset All Progress
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to block all users?')) {
                setBlockedUsers(new Set(users.map(u => u.id)));
                alert('All users have been blocked!');
              }
            }}
          >
            🚫 Block All Users
          </button>
          <button
            className="btn btn-success"
            onClick={() => {
              setBlockedUsers(new Set());
              alert('All users have been unblocked!');
            }}
          >
            ✅ Unblock All Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;