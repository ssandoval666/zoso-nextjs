import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoso Design — Joyería artesanal",
  description: "Joyería artesanal hecha a mano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}