import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#f7f0de]/95 backdrop-blur-sm z-50 border-b border-[#e2d4b7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#1f3b2c]">AgriLink</span>
            </Link>
          </div>
          
          <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            <Link href="/marketplace" className="text-[#374151] hover:text-[#166534] px-3 py-2 text-sm font-medium">
              Marketplace
            </Link>
            <Link href="/features" className="text-[#374151] hover:text-[#166534] px-3 py-2 text-sm font-medium">
              Features
            </Link>
            <Link href="/login" className="text-[#374151] hover:text-[#166534] px-3 py-2 text-sm font-medium">
              Log In
            </Link>
            <Link 
              href="/register" 
              className="ml-4 bg-[#166534] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#14532d] transition-colors"
            >
              Register
            </Link>
            <button className="ml-2 p-2 text-[#374151] hover:text-[#166534]">
              <ShoppingCart className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
