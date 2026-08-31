import React from 'react';
import api from '../services/api';

function NotificationPanel({ notifications, onClose, onUpdate }) {
  const handleMarkRewardGiven = async (notificationId) => {
    try {
      await api.post(`/mark-reward-given/${notificationId}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to mark reward as given:', error);
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className="notification-panel">
        <div className="notification-header">
          <h3>Notifications</h3>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        <div className="notification-empty">
          <p>No notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button onClick={onClose} className="btn-close">×</button>
      </div>
      <div className="notification-list">
        {notifications.map(notification => {
          const data = notification.data ? JSON.parse(notification.data) : {};
          
          return (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${data.reward_given ? 'reward-given' : ''}`}
            >
              <div className="notification-icon">
                {notification.type === 'POINT_REDEMPTION' && '🎁'}
                {notification.type === 'VALIDATION_REQUEST' && '📋'}
                {notification.type === 'CLARIFICATION' && '💬'}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                {notification.type === 'POINT_REDEMPTION' && (
                  <div className="notification-details">
                    <span className="badge badge-success">{data.points} points</span>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {notification.type === 'POINT_REDEMPTION' && (
                  <div className="reward-tracking">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={data.reward_given || false}
                        onChange={() => handleMarkRewardGiven(notification.id)}
                      />
                      <span>{data.reward_given ? '✅ Reward sudah diberikan' : 'Tandai reward sudah diberikan'}</span>
                    </label>
                    {data.reward_given && data.reward_given_at && (
                      <small className="reward-timestamp">
                        Diberikan: {new Date(data.reward_given_at).toLocaleString()}
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationPanel;
