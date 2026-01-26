import React from "react";
import { Package } from "../../types/advertisement";

interface UsdtPaymentModalProps {
  isOpen: boolean;
  selectedPackage: Package | null;
  transactionId: string;
  walletAddress: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onTransactionIdChange: (value: string) => void;
  onWalletAddressChange: (value: string) => void;
  onSubmit: () => void;
}

export const UsdtPaymentModal: React.FC<UsdtPaymentModalProps> = ({
  isOpen,
  selectedPackage,
  transactionId,
  walletAddress,
  loading,
  error,
  onClose,
  onTransactionIdChange,
  onWalletAddressChange,
  onSubmit,
}) => {
  if (!isOpen || !selectedPackage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xs relative max-h-[90vh] flex flex-col">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="overflow-y-auto p-6">
          <h3 className="text-lg font-bold text-[#007cb6] mb-4 text-center">
            Purchase Advertisement Credits
          </h3>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Package Details
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {selectedPackage.name}
              </p>
              <p>
                <span className="font-semibold">Credits:</span>{" "}
                {selectedPackage.displayCredits}
              </p>
              <p>
                <span className="font-semibold">Price:</span> $
                {selectedPackage.priceUSDT} USDT
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm">
            <p className="font-semibold mb-2 text-center">
              Payment Instructions:
            </p>
            <p className="text-sm font-semibold text-green-600 mb-2 text-center">
              No Fees No charges!!!
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>
                Send ${selectedPackage.priceUSDT} USDT to the wallet below
              </li>
              <li>Copy the transaction ID from your wallet</li>
              <li>Paste it below along with your wallet address</li>
              <li>Wait for admin approval (usually within 24 hours)</li>
            </ol>
            <div className="mt-3 text-sm break-all bg-gray-100 p-3 rounded-lg text-center">
              <div className="mb-1 text-center font-semibold">
                Send USDT to this address:
              </div>
              <button
                className="text-blue-600 underline break-all"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      "TK2TMn99SBCrdbZpSef7rFE3vTccvR6dCz",
                    );
                    if (
                      typeof window !== "undefined" &&
                      (window as any).Telegram?.WebApp
                    ) {
                      (window as any).Telegram.WebApp.showAlert(
                        "Wallet address copied!",
                      );
                    } else {
                      alert("Wallet address copied!");
                    }
                  } catch (e) {
                    if (
                      typeof window !== "undefined" &&
                      (window as any).Telegram?.WebApp
                    ) {
                      (window as any).Telegram.WebApp.showAlert(
                        "Failed to copy address",
                      );
                    } else {
                      alert("Failed to copy address");
                    }
                  }
                }}
              >
                TK2TMn99SBCrdbZpSef7rFE3vTccvR6dCz
              </button>
            </div>
          </div>

          <label className="block mb-2 text-sm font-bold text-gray-700">
            Transaction ID *
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            placeholder="Enter transaction ID"
            disabled={loading}
          />

          <label className="block mb-2 text-sm font-bold text-gray-700">
            Your Wallet Address *
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
            value={walletAddress}
            onChange={(e) => onWalletAddressChange(e.target.value)}
            placeholder="Your wallet address (e.g., 0x...)"
            disabled={loading}
          />

          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={loading || !transactionId || !walletAddress}
            className="w-full bg-[#007cb6] text-white py-3 rounded-lg font-bold hover:bg-[#005f8e] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Payment Details"}
          </button>
        </div>
      </div>
    </div>
  );
};
