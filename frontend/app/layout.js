import "./globals.css";
import Navbar from "./components/Navbar";
import VoiceBot from "./components/VoiceBot";

export const metadata = {
  title: "AI Productivity Tools",
  description: "Resume Scanner and Email Writer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        <main>{children}</main>
        <VoiceBot />
      </body>
    </html>
  );
}