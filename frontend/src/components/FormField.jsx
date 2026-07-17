import React from 'react';
import './FormField.css'; 

const FormField = ({ label, placeholder, value, onChange, type = 'text', accept }) => {
  return (
    <div className="input-container">
      <label className="input-label">{label}</label>
      
      {type === 'file' ? (
        <label className="custom-file-upload">
          <input
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden-file-input"
          />
          <span className="file-upload-text">
            {value ? value : "Scegli un'immagine dal dispositivo..."}
          </span>
        </label>
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