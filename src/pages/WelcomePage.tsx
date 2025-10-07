import React from "react";
import Header from "../components/Header";

interface WelcomePageProps {
  onLogin: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin }) => {
  return (
    <div className="relative flex flex-col min-h-screen bg-[url(/src/assets/background.jpg)] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-lg p-8 shadow-lg flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">Welcome to AddMy</h1>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              onClick={onLogin}
            >
              Get in to the app
            </button>
          </div>
        </main>
        <footer className="bg-gray-100 text-gray-500 text-center py-3 text-sm">
          &copy; {new Date().getFullYear()} AddMy. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
