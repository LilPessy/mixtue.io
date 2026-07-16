import React from 'react';
import './FormField.css'; 

const FormField = ({ label, placeholder, value, onChange, type = 'text', accept }) => {
  return (
    <div className="input-container">
      <label className="input-label">{label}</label>
      
      {type === 'file' ? (
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="custom-input"
          style={{ padding: '14px 24px' }}/>
      ) : (
        /* Altrimenti mostriamo il campo normale (testo, email, password...) */
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="custom-input"
        />
      )}
    </div>
  );
};

export default FormField;