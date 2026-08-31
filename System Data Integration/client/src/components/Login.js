import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onLogin(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/muc-logo.png" alt="MUC Consulting" className="login-muc-logo" />
        </div>
        <h2>Fee Intelligence System</h2>
        <p className="login-subtitle">MUC Consulting</p>
        
        {error && (
          <div className="alert alert-error">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' , fontWeight: 'bold'}}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p><strong>Test Accounts:</strong></p>
          <p>contributor1 / password123</p>
          <p>validator1 / password123</p>
          <p>partner1 / password123</p>
          <p>manager1 / password123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
