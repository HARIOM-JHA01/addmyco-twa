import { ReactNode } from "react";
import Header from "./Header";
import backgroundImg from "../assets/background.jpg";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `var(--app-background-image, url(${backgroundImg}))` }}
    >
      <Header />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
