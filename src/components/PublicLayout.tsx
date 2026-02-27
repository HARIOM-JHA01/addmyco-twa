import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import backgroundImg from "../assets/background.jpg";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const profile =
    typeof window !== "undefined" ? localStorage.getItem("profile") : null;
  const showFooter = !!token && !!profile;

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `var(--app-background-image, url(${backgroundImg}))` }}
    >
      <Header />
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
