import React, { useState } from "react";
import i18n from "../../i18n";
import { Package } from "../../types/advertisement";

interface BuyCreditsTabProps {
  packages: Package[];
  loading: boolean;
  onPackageSelect: (pkg: Package) => void;
}

export const BuyCreditsTab: React.FC<BuyCreditsTabProps> = ({
  packages,
  loading,
  onPackageSelect,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [buyTab, setBuyTab] = useState<"start" | "circle">("start");

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    onPackageSelect(pkg);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{i18n.t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-black mb-4">
        Select a package to purchase advertisement credits
      </p>

      {/* Sub-tabs for Start Page / Circle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => {
            setBuyTab("start");
            setSelectedPackage(null);
          }}
          className={`flex-1 py-2 rounded font-semibold ${
            buyTab === "start"
              ? "bg-[#007cb6] text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          SCoupon (Landing Page)
        </button>
        <button
          type="button"
          onClick={() => {
            setBuyTab("circle");
            setSelectedPackage(null);
          }}
          className={`flex-1 py-2 rounded font-semibold ${
            buyTab === "circle"
              ? "bg-[#007cb6] text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          CCoupon (Bottom Bar)
        </button>
      </div>

      {/* Packages list filtered by selected sub-tab */}
      {packages.filter((pkg) =>
        buyTab === "start"
          ? pkg.positions.includes("HOME_BANNER")
          : pkg.positions.includes("BOTTOM_CIRCLE"),
      ).length === 0 ? (
        <div className="text-center py-6 text-gray-600">
          No packages available for this section.
        </div>
      ) : (
        packages
          .filter((pkg) =>
            buyTab === "start"
              ? pkg.positions.includes("HOME_BANNER")
              : pkg.positions.includes("BOTTOM_CIRCLE"),
          )
          .map((pkg) => (
            <div
              key={pkg._id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                selectedPackage?._id === pkg._id
                  ? "bg-[#007cb6] text-black"
                  : "border-gray-200 hover:border-[#007cb6]"
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-black">{pkg.name}</h3>
                <span className="bg-[#007cb6] text-black px-2 py-1 rounded text-base font-bold">
                  ${pkg.priceUSDT}
                </span>
              </div>
              <p className="text-sm text-black mb-2">{pkg.description}</p>
              <div className="text-base text-black space-y-1">
                <p>💳 Credits: {pkg.displayCredits}</p>
                <p>
                  📍 Position:{" "}
                  {pkg.positions
                    .map((pos) =>
                      pos === "HOME_BANNER" ? "Landing Page" : "Bottom Circle",
                    )
                    .join(", ")}
                </p>
              </div>
            </div>
          ))
      )}
    </div>
  );
};
