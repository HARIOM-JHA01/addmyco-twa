import React from "react";

interface WelcomePopupProps {
  onClose: () => void;
  onJoinChannel: () => void;
  title: string;
  message: string;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({
  onClose,
  onJoinChannel,
  title,
  message,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
          {title}
        </h2>
        <p className="text-center text-gray-600 mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onJoinChannel}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200"
          >
            Join Channel to Get Rewards
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-full transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
