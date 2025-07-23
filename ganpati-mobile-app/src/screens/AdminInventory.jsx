import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

const AdminInventory = () => {
  const { avatars, gameData, updateInventory } = useGame();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (avatarId, value) => {
    setQuantities({
      ...quantities,
      [avatarId]: parseInt(value) || 0
    });
  };

  const handleUpdate = (avatarId) => {
    const newQuantity = quantities[avatarId] ?? gameData.inventory[avatarId];
    updateInventory(avatarId, newQuantity);
    alert('Inventory updated successfully!');
  };

  const getQuantityBadgeClass = (quantity) => {
    if (quantity > 20) return 'high';
    if (quantity > 5) return 'medium';
    return 'low';
  };

  return (
    <div className="screen">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="screen-title">📦 Inventory Management</div>
            <div className="screen-subtitle">Manage Avatar Quantities</div>
          </div>
          <Link to="/admin" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
            ← Back
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            🎯 Avatar Inventory
          </div>
        </div>
        
        <div>
          {avatars.map(avatar => {
            const currentQuantity = gameData.inventory[avatar.id] || 0;
            const newQuantity = quantities[avatar.id] ?? currentQuantity;
            
            return (
              <div key={avatar.id} className="inventory-item">
                <div className="inventory-info">
                  <div className="inventory-avatar">
                    {avatar.emoji}
                  </div>
                  <div className="inventory-details">
                    <h4>{avatar.name}</h4>
                    <p>{avatar.location}</p>
                  </div>
                </div>
                
                <div className="inventory-quantity">
                  <div className={`quantity-badge ${getQuantityBadgeClass(currentQuantity)}`}>
                    {currentQuantity}
                  </div>
                  <input
                    type="number"
                    className="quantity-input"
                    value={newQuantity}
                    onChange={(e) => handleQuantityChange(avatar.id, e.target.value)}
                    min="0"
                    max="999"
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdate(avatar.id)}
                    disabled={newQuantity === currentQuantity}
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: '12px',
                      opacity: newQuantity === currentQuantity ? 0.5 : 1
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            📊 Inventory Summary
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '20px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {Object.values(gameData.inventory).reduce((sum, qty) => sum + qty, 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Total Items</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6600' }}>
              {Object.values(gameData.inventory).filter(qty => qty > 0).length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Available Types</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            ⚡ Quick Actions
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          <button
            className="btn btn-success"
            onClick={() => {
              avatars.forEach(avatar => {
                updateInventory(avatar.id, 50);
              });
              alert('All inventories set to 50!');
              window.location.reload();
            }}
          >
            🔄 Reset All to 50
          </button>
          <button
            className="btn btn-warning"
            onClick={() => {
              avatars.forEach(avatar => {
                const current = gameData.inventory[avatar.id] || 0;
                updateInventory(avatar.id, current + 10);
              });
              alert('Added 10 to all inventories!');
              window.location.reload();
            }}
          >
            ➕ Add 10 to All
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

export default AdminInventory;