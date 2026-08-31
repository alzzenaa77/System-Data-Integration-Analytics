import React, { useState } from 'react';
import api from '../services/api';

function ClarificationModal({ dataId, dataType, onClose, onSubmit }) {
  const [clarification, setClarification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!clarification.trim()) {
      alert('Please enter clarification text');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/${dataType}/${dataId}/clarification`, { clarification });
      if (onSubmit) onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to submit clarification:', error);
      alert('Failed to submit clarification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="clarification-modal-overlay" onClick={onClose}>
      <div className="clarification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="clarification-modal-header">
          <h3>Submit Clarification</h3>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        <div className="clarification-modal-body">
          <p style={{ marginBottom: '15px', color: '#666' }}>
            Validator meminta klarifikasi tambahan untuk data ini. Silakan berikan penjelasan atau informasi tambahan yang diperlukan.
          </p>
          <div className="clarification-form">
            <textarea
              value={clarification}
              onChange={(e) => setClarification(e.target.value)}
              placeholder="Masukkan klarifikasi atau informasi tambahan..."
              disabled={submitting}
            />
          </div>
        </div>
        <div className="clarification-modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Clarification'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClarificationModal;
