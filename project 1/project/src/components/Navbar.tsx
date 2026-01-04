import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="font-bold text-white text-xl hidden sm:inline">Zoom My Way</span>
          </Link>

          <div className="hidden md:flex gap-8">
            <Link to="/" className="text-slate-300 hover:text-white transition">Home</Link>
            <Link to="/vehicles" className="text-slate-300 hover:text-white transition">Vehicles</Link>
            <a href="#about" className="text-slate-300 hover:text-white transition">About</a>
            <a href="#contact" className="text-slate-300 hover:text-white transition">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
                  <User size={20} />
                  <span className="text-sm">{user.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-blue-400 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700 space-y-2 pt-4">
            <Link to="/" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded">
              Home
            </Link>
            <Link to="/vehicles" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded">
              Vehicles
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded">
                  Login
                </Link>
                <Link to="/register" className="block px-4 py-2 bg-blue-600 text-white rounded">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
