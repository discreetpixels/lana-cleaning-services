import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lana Cleaning Services | Professional Home Cleaning",
  description: "Experience a spotless home with Lana Cleaning Services. Modern, thorough, and personal cleaning services tailored to your needs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
