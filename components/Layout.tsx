import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white text-swiss-black flex flex-col">
      {/* Swiss Header: Sticky, Bold, Simple */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {!isHome && (
              <Link to="/" className="p-2 hover:bg-swiss-red hover:text-white transition-colors">
                <ArrowLeft size={24} strokeWidth={3} />
              </Link>
            )}
            <Link to="/" className="group">
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none select-none">
                Swiss<span className="text-swiss-red">Manga</span>
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-bold text-sm tracking-widest uppercase">
            <Link to="/" className="hover:underline decoration-4 underline-offset-4 decoration-swiss-red">Library</Link>
            <span className="opacity-30">/</span>
            <a href="#" className="hover:underline decoration-4 underline-offset-4 decoration-swiss-red">Updates</a>
            <span className="opacity-30">/</span>
            <a href="#" className="hover:underline decoration-4 underline-offset-4 decoration-swiss-red">Lists</a>
          </nav>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white border-b-4 border-black p-6 flex flex-col gap-4 font-bold text-xl uppercase tracking-tight">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Library</Link>
            <a href="#" onClick={() => setIsMenuOpen(false)}>Updates</a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>Settings</a>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t-4 border-black py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4 text-swiss-red">
              Read More.
            </h2>
            <p className="font-bold text-sm uppercase tracking-widest opacity-60">
              International Typographic Manga Style
            </p>
          </div>
          <div>
            <h3 className="font-black uppercase mb-4 text-lg">Platform</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li><a href="#" className="hover:text-swiss-red">API Docs</a></li>
              <li><a href="#" className="hover:text-swiss-red">Status</a></li>
              <li><a href="#" className="hover:text-swiss-red">About</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-black uppercase mb-4 text-lg">Community</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li><a href="#" className="hover:text-swiss-red">Discord</a></li>
              <li><a href="#" className="hover:text-swiss-red">Twitter</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
