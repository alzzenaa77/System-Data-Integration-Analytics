import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import ContributorPortal from './components/ContributorPortal';
import ValidatorPortal from './components/ValidatorPortal';
import PartnerPortal from './components/PartnerPortal';
import ManagerPortal from './components/ManagerPortal';
import { DEMO_MODE } from './services/api';

const API_URL = 'http://localhost:3000/api';

// Mock users for demo mode
const MOCK_USERS = {
  'contributor1': { id: '1', username: 'contributor1', fullName: 'John Contributor', role: 'CONTRIBUTOR' },
  'validator1': { id: '2', username: 'validator1', fullName: 'Alice Validator', role: 'VALIDATOR' },
  'partner1': { id: '3', username: 'partner1', fullName: 'Bob Partner', role: 'PARTNER' },
  'manager1': { id: '4', username: 'manager1', fullName: 'Charlie Manager', role: 'SPV_MANAGER_PM' }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      const savedUser = localStorage.getItem('demoUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUser();
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    if (DEMO_MODE) {
      // Demo mode - accept any password for demo users
      if (MOCK_USERS[username]) {
        const userData = MOCK_USERS[username];
        localStorage.setItem('demoUser', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'User tidak ditemukan. Gunakan: contributor1, validator1, partner1, atau manager1'
        };
      }
    }

    // Real API mode
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed'
      };
    }
  };

  const handleLogout = () => {
    if (DEMO_MODE) {
      localStorage.removeItem('demoUser');
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    setUser(null);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPortal = () => {
    switch (user.role) {
      case 'CONTRIBUTOR':
        return <ContributorPortal user={user} onLogout={handleLogout} />;
      case 'VALIDATOR':
        return <ValidatorPortal user={user} onLogout={handleLogout} />;
      case 'PARTNER':
        return <PartnerPortal user={user} onLogout={handleLogout} />;
      case 'SPV_MANAGER_PM':
        return <ManagerPortal user={user} onLogout={handleLogout} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return <div className="App">{renderPortal()}</div>;
}

export default App;
