import { ReactNode } from "react";
import Header from "./Header";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: "var(--app-background-image)" }}
    >
      <Header />
      <main className="flex-grow">{children}</main>
      {/* No Footer for public pages */}
    </div>
  );
}
