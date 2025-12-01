import React, { useState } from "react";
import WebApp from "@twa-dev/sdk";

interface PartnerCodePopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (partnerCode: string | null) => void;
}

const PartnerCodePopup: React.FC<PartnerCodePopupProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState("");

  if (!open) return null;

  const handleYes = () => {
    setShowInput(true);
    try {
      WebApp.expand();
    } catch {
      // ignore
    }
  };

  const handleNo = () => {
    onSubmit(null);
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = code?.trim() || "";
    if (!trimmed) {
      try {
        WebApp.showAlert("Please enter a valid partner code.");
      } catch {
        // fallback
        alert("Please enter a valid partner code.");
      }
      return;
    }
    onSubmit(trimmed);
    onClose();
  };

  const handleCancel = () => {
    // user cancels the input; treat it like 'No'
    onSubmit(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="z-10 bg-white rounded-lg m-2 shadow-lg max-w-md w-full p-4">
        <h2 className="text-lg font-bold mb-4 text-center">
          Do you have a partner code?
        </h2>
        {!showInput ? (
          <div className="flex gap-3 justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleYes}
            >
              Yes
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={handleNo}
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              className="border px-3 py-2 rounded"
              placeholder="Enter partner code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerCodePopup;
