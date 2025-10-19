import { ReactNode } from "react";
import Header from "./Header";

interface PublicLayoutProps {
  children: ReactNode;
  backgroundColor?: string;
  fontColor?: string;
}

export default function PublicLayout({
  children,
  backgroundColor,
  fontColor,
}: PublicLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: backgroundColor || "#ffffff",
        color: fontColor || "#000000",
        ...(backgroundColor &&
          ({
            "--app-background-color": backgroundColor,
          } as any)),
        ...(fontColor &&
          ({
            "--app-font-color": fontColor,
          } as any)),
      }}
    >
      <Header />
      <main className="flex-grow">{children}</main>
      {/* No Footer for public pages */}
    </div>
  );
}
