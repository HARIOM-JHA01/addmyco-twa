import profileIcon from "../assets/profileIcon.png";
import subCompanyIcon from "../assets/subCompany.png";
import chamberIcon from "../assets/chamberPage.png";
import TGDIcon from "../assets/tgdlogo.png";
import heartIcon from "../assets/heart.png";
import qrIcone from "../assets/scanner-sidebar.png";
import settingIcon from "../assets/settingIcon.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const router = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [workModalText, setWorkModalText] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.close();
  };

  return (
    <>
      {/* Settings Popup */}
      {showSettings && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="bg-black bg-opacity-90 rounded-lg shadow-lg flex flex-col min-w-[160px]">
            <button
              className="text-white font-semibold px-4 py-2 text-left hover:bg-gray-800"
              onClick={() => {
                setWorkModalText("Membership");
                setShowWorkModal(true);
                setShowSettings(false);
              }}
            >
              Membership
            </button>
            <button
              className="text-white font-semibold px-4 py-2 text-left hover:bg-gray-800"
              onClick={() => {
                setWorkModalText("Background");
                setShowWorkModal(true);
                setShowSettings(false);
              }}
            >
              Background
            </button>
            <button
              className="text-white font-semibold px-4 py-2 text-left hover:bg-gray-800"
              onClick={() => {
                setShowSettings(false);
                router("/theme");
              }}
            >
              Theme
            </button>
            <button
              className="text-white font-semibold px-4 py-2 text-left hover:bg-gray-800"
              onClick={() => {
                setShowLanguageModal(true);
                setShowSettings(false);
              }}
            >
              Language
            </button>
            <button
              className="text-white font-semibold px-4 py-2 text-left hover:bg-gray-800"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Work in Progress Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-72 flex flex-col items-center">
            <div className="text-lg font-bold mb-4">{workModalText}</div>
            <div className="text-gray-600 mb-6">Work in progress</div>
            <button
              className="bg-[#007cb6] text-white rounded-full px-6 py-2 font-bold"
              onClick={() => setShowWorkModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-80 flex flex-col items-center animate-fadeIn">
            <div className="text-2xl font-extrabold mb-2 text-[#007cb6] tracking-wide">
              Language
            </div>
            <div className="text-gray-500 mb-6 text-center text-sm">
              Choose your preferred language for the app interface.
            </div>
            <div className="flex flex-row gap-4 mb-8 w-full justify-center">
              <button
                className={`flex-1 px-4 py-3 rounded-xl font-bold border-2 transition-all duration-150 ${
                  selectedLanguage === "English"
                    ? "bg-[#007cb6] text-white border-[#007cb6] scale-105 shadow-md"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedLanguage("English")}
              >
                English
              </button>
              <button
                className={`flex-1 px-4 py-3 rounded-xl font-bold border-2 transition-all duration-150 ${
                  selectedLanguage === "Chinese"
                    ? "bg-[#007cb6] text-white border-[#007cb6] scale-105 shadow-md"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedLanguage("Chinese")}
              >
                Chinese (Traditional)
              </button>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                className="flex-1 bg-gray-200 text-gray-700 rounded-md py-1 px-1 font-bold border border-gray-300 hover:bg-gray-300 transition-all"
                onClick={() => setShowLanguageModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-[#007cb6] text-white rounded-md py-1 px-1 font-bold hover:bg-[#005f8e] transition-all"
                onClick={() => setShowLanguageModal(false)}
              >
                Save Language
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full flex justify-center z-50">
        <div className="flex items-center justify-between bg-[#007cb6] w-full max-w-3xl shadow-lg px-2 py-2">
          <div className="flex gap-2">
            <img
              src={profileIcon}
              alt="Profile"
              className="w-10 h-10 rounded-full"
              onClick={() => router("/profile")}
            />
            <img
              src={subCompanyIcon}
              alt="SubCompany"
              className="w-10 h-10 rounded-full"
              onClick={() => router("/sub-company")}
            />
            <img
              src={chamberIcon}
              alt="Chamber"
              className="w-10 h-10 rounded-full"
              onClick={() => router("/chamber")}
            />
          </div>
          <img
            src={TGDIcon}
            alt="TGD"
            className="w-16 h-16 rounded-full bg-white  border-[#007cb6] z-10"
          />
          <div className="flex gap-2">
            <img
              src={heartIcon}
              alt="Heart"
              className="w-10 h-10 rounded-full"
              onClick={() => router("/search")}
            />
            <img
              src={qrIcone}
              alt="QR"
              className="w-10 h-10 rounded-full"
              onClick={() => router("/my-qr")}
            />
            <img
              src={settingIcon}
              alt="Setting"
              className="w-10 h-10 rounded-full"
              onClick={() => setShowSettings((v) => !v)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
