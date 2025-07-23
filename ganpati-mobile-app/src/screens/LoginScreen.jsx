import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="screen" style={{ background: 'linear-gradient(135deg, #ff6600, #ffcc33)', minHeight: '100vh' }}>
      <div style={{ paddingTop: '60px', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🕉️</div>
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
          Ganpati Collection Game
        </h1>
        <p style={{ color: 'white', opacity: 0.9, fontSize: '16px' }}>
          Collect all 8 Ashtavinayak Avatars
        </p>
      </div>

      <div className="card" style={{ margin: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#8b4513', marginBottom: '10px' }}>
            {isLogin ? 'Welcome Back!' : 'Join the Festival!'}
          </h2>
          <p style={{ color: '#6c757d' }}>
            {isLogin ? 'Sign in to continue your collection' : 'Create account to start collecting'}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#dc3545',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6c757d', marginBottom: '15px' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            className="btn btn-outline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ name: '', email: '', password: '' });
            }}
            style={{ width: '100%' }}
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px', textAlign: 'center' }}>
            <strong>Available Login Credentials:</strong>
          </p>
          <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.6' }}>
            <p style={{ margin: '8px 0', padding: '8px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
              <strong>🛠️ Admin Account:</strong><br />
              Email: admin@ganpati.com<br />
              Password: 123456
            </p>
            <p style={{ margin: '8px 0', padding: '8px', background: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
              <strong>👤 User Account 1:</strong><br />
              Email: user@test.com<br />
              Password: 123456
            </p>
            <p style={{ margin: '8px 0', padding: '8px', background: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
              <strong>👤 User Account 2:</strong><br />
              Email: jane@test.com<br />
              Password: 123456
            </p>
          </div>
          <p style={{ fontSize: '11px', color: '#6c757d', margin: '10px 0 0 0', textAlign: 'center', fontStyle: 'italic' }}>
            💡 Admin users can manage inventory and users. Regular users can play the collection game.
          </p>
          
          {/* Branding */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'linear-gradient(135deg, #ff6600, #ffcc33)', 
            borderRadius: '8px',
            textAlign: 'center',
            color: 'white'
          }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
              ⭐ Powered by Orion Stars ⭐
            </p>
            <p style={{ fontSize: '12px', margin: '0', opacity: 0.9 }}>
              Supported by Sandeep CHSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;