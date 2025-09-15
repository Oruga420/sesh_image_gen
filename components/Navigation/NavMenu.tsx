'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Generate', href: '/image-gen', icon: '✨' },
  { name: 'Edit', href: '/edit', icon: '🎨' },
];

export default function NavMenu() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sesh border-b border-sesh-teal/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/sesh-logo.svg" 
                  alt="Sesh Logo" 
                  className="w-8 h-8"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-poppins font-bold text-sesh-purple">
                  Sesh
                </span>
                <span className="text-xs text-sesh-teal font-medium -mt-1">Image Gen</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-sesh-teal/10 text-sesh-teal border border-sesh-teal/30 shadow-sm'
                        : 'text-gray-600 hover:text-sesh-purple hover:bg-sesh-teal/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`p-2 rounded-md text-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-sesh-teal/10 text-sesh-teal'
                        : 'text-gray-600 hover:text-sesh-purple hover:bg-sesh-teal/5'
                    }`}
                    title={item.name}
                  >
                    {item.icon}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}