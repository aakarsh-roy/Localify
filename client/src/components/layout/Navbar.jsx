import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Calendar,
  MapPin,
  ChevronDown,
  Search,
  Briefcase
} from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'provider') return '/provider-dashboard';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200 transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img 
                src="/images/logo.png" 
                alt="Localify Logo" 
                className="h-20 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/search')
                  ? 'bg-neutral-100 text-neutral-950'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
              }`}
            >
              <Search className="h-4 w-4" />
              Find Services
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register?role=provider"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/become-provider')
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Become a Provider
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all duration-200 border border-transparent ${
                    isDropdownOpen ? 'bg-neutral-50 border-neutral-200' : 'hover:bg-neutral-50 hover:border-neutral-200'
                  }`}
                >
                  <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center shadow-subtle">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-neutral-900 text-sm tracking-tight">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-popover py-2 border border-neutral-200 animate-fade-in-down origin-top-right">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-950 tracking-tight">{user?.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                      {user?.role === 'user' && (
                        <>
                          <Link
                            to="/my-bookings"
                            className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                          >
                            <Calendar className="h-4 w-4 mr-3" />
                            My Bookings
                          </Link>
                          <Link
                            to="/become-provider"
                            className="flex items-center px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                          >
                            <Briefcase className="h-4 w-4 mr-3" />
                            Become Provider
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="border-t border-neutral-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-2">
                <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 px-4 py-2 rounded-xl hover:bg-neutral-50 transition-all duration-200">
                  Log in
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100 animate-fade-in-down">
            <div className="flex flex-col space-y-1">
              <Link
                to="/search"
                className="flex items-center gap-2 text-neutral-700 hover:bg-neutral-50 px-3 py-2.5 rounded-xl text-sm font-medium"
              >
                <Search className="h-4 w-4 text-neutral-400" />
                Find Services
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center gap-2 text-neutral-700 hover:bg-neutral-50 px-3 py-2.5 rounded-xl text-sm font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4 text-neutral-400" />
                    Dashboard
                  </Link>
                  {user?.role === 'user' && (
                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2 text-neutral-700 hover:bg-neutral-50 px-3 py-2.5 rounded-xl text-sm font-medium"
                    >
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      My Bookings
                    </Link>
                  )}
                  <div className="border-t border-neutral-100 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-xl text-sm font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 pt-3 border-t border-neutral-100 mt-2">
                  <Link to="/login" className="block text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50 px-3 py-2.5 rounded-xl border border-neutral-200">
                    Log in
                  </Link>
                  <Link to="/register" className="block">
                    <Button variant="primary" size="md" fullWidth>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
