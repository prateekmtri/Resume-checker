import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex gap-6">
        <Link href="/" className="text-blue-600 font-semibold hover:text-blue-800">
          📄 Resume Scanner
        </Link>
        <Link href="/email-writer" className="text-blue-600 font-semibold hover:text-blue-800">
          ✉️ Email Writer
        </Link>
      </div>
    </nav>
  );
}