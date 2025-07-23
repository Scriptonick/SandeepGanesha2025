import React, { useEffect } from 'react';

const ScratchModal = ({ result, onClose }) => {
  useEffect(() => {
    // Auto close after 3 seconds if won
    if (result.won) {
      const timer = setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show new collection
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [result.won, onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bounce" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          {result.won ? '🎉' : '😔'}
        </div>
        
        <div className="modal-title">
          {result.won ? 'Congratulations!' : 'Better Luck Tomorrow!'}
        </div>
        
        <div className="modal-message">
          {result.won ? (
            <>
              You won <strong>{result.avatar.name}</strong> from {result.avatar.location}!
              <div style={{ 
                fontSize: '48px', 
                margin: '20px 0',
                background: 'linear-gradient(135deg, #ff6600, #ffcc33)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px auto',
                color: 'white'
              }}>
                {result.avatar.emoji}
              </div>
            </>
          ) : (
            <>
              You didn't win <strong>{result.avatar.name}</strong> this time.
              <div style={{ marginTop: '15px', fontSize: '14px', opacity: 0.7 }}>
                Try again in 1 minute to complete your collection!
              </div>
            </>
          )}
        </div>
        
        <button className="btn btn-primary" onClick={onClose}>
          {result.won ? 'Awesome!' : 'Try Again Tomorrow'}
        </button>
      </div>
    </div>
  );
};

export default ScratchModal;