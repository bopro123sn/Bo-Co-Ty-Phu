
import React from 'react';

interface ActionModalProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border-2 border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default ActionModal;
