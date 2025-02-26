import React from 'react';

const Modal = ({ isOpen, onClose, children, title = 'Modal' }) => {
  if (!isOpen) return null;
  
  // Prevent the modal from closing when clicking inside the content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-content" onClick={handleContentClick}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
