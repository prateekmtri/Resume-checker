import "./globals.css";
import Navbar from "./components/Navbar";

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
      </body>
    </html>
  );
}