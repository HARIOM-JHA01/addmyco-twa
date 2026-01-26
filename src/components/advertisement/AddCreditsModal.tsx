import React from "react";
import { CreditBalance } from "../../types/advertisement";

interface AddCreditsModalProps {
  isOpen: boolean;
  credits: CreditBalance | null;
  creditsToAdd: number;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onCreditsChange: (value: number) => void;
  onSubmit: () => void;
}

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  isOpen,
  credits,
  creditsToAdd,
  loading,
  error,
  onClose,
  onCreditsChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const availableCredits =
    credits?.availableCredits ?? credits?.balanceCredits ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="p-6">
          <h3 className="text-lg font-bold text-[#007cb6] mb-4 text-center">
            Assign More Credits
          </h3>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Available Credits:</span>{" "}
              <span className="text-blue-600 font-bold">
                {availableCredits}
              </span>
            </p>
          </div>

          <label className="block mb-2 text-sm font-bold text-gray-700">
            Credits to Add *
          </label>
          <input
            type="number"
            min="1"
            max={availableCredits}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
            value={creditsToAdd}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              onCreditsChange(Math.max(1, Math.min(value, availableCredits)));
            }}
            disabled={loading}
            placeholder="Enter credits"
          />

          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={loading || creditsToAdd < 1}
            className="w-full bg-[#007cb6] text-white py-3 rounded-lg font-bold hover:bg-[#005f8e] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Adding..."
              : `Add ${creditsToAdd} Credit${creditsToAdd !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};
