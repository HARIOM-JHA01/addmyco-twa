import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import backgroundImg from "../assets/background.jpg";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      className="bg-cover bg-center min-h-screen w-full overflow-x-hidden"
      style={{ backgroundImage: `var(--app-background-image, url(${backgroundImg}))` }}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
