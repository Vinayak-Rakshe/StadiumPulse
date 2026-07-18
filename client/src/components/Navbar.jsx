import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, MapPin, Users, HelpCircle, LogIn, LogOut, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleQuickSwitch = async (role) => {
    if (role === 'Fan') {
      logout();
      navigate('/');
    } else {
      let email = '';
      if (role === 'Organizer') email = 'organizer@stadiumpulse.com';
      else if (role === 'Staff') email = 'staff@stadiumpulse.com';
      else if (role === 'Volunteer') email = 'volunteer@stadiumpulse.com';

      const res = await login(email, 'password123');
      if (res.success) {
        if (role === 'Organizer') navigate('/organizer');
        else if (role === 'Staff') navigate('/organizer'); // uses organizer view for staff capacity modifications
        else if (role === 'Volunteer') navigate('/volunteer');
      } else {
        alert('Quick switch failed. Please verify the database is seeded.');
      }
    }
  };

  const navItems = [
    { path: '/', label: 'Fan Concierge', icon: Sparkles },
    { path: '/accessibility', label: 'Accessibility Concierge', icon: MapPin },
  ];

  if (user?.role === 'Organizer' || user?.role === 'Staff') {
    navItems.push({ path: '/organizer', label: 'Operations Command', icon: Users });
  }
  if (user?.role === 'Volunteer' || user?.role === 'Staff' || user?.role === 'Organizer') {
    navItems.push({ path: '/volunteer', label: 'Volunteer Copilot', icon: HelpCircle });
  }

  return (
    <nav className="bg-stadium-slate border-b border-stadium-border sticky top-0 z-40 px-4 lg:px-8 py-3" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-white font-bold text-xl hover:text-fifa-green focus:outline-none focus:ring-2 focus:ring-fifa-gold rounded px-1 transition-colors"
          aria-label="StadiumPulse Home"
        >
          <div className="bg-fifa-green text-stadium-dark p-1.5 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <span>Stadium<span className="text-fifa-green">Pulse</span></span>
          <span className="text-xs uppercase tracking-wider bg-fifa-gold/20 text-fifa-gold border border-fifa-gold/30 px-2 py-0.5 rounded font-mono">FIFA 2026</span>
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center gap-2 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-fifa-gold ${
                    isActive 
                      ? 'bg-fifa-green text-stadium-dark shadow' 
                      : 'text-slate-300 hover:bg-stadium-card hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Role Demo switcher & login states */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stadium-dark/60 p-1 rounded-lg border border-stadium-border" role="group" aria-label="Demo Role Switcher">
            <span className="text-xs text-slate-400 font-mono px-2 hidden lg:inline">View As:</span>
            
            <button
              onClick={() => handleRoleQuickSwitch('Fan')}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                !user ? 'bg-fifa-green text-stadium-dark shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Switch view to Fan role"
            >
              Fan
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('Volunteer')}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                user?.role === 'Volunteer' ? 'bg-fifa-green text-stadium-dark shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Switch view to Volunteer role"
            >
              Volunteer
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('Organizer')}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                user?.role === 'Organizer' ? 'bg-fifa-green text-stadium-dark shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Switch view to Organizer role"
            >
              Organizer
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('Staff')}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                user?.role === 'Staff' ? 'bg-fifa-green text-stadium-dark shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Switch view to Venue Staff role"
            >
              Staff
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium hidden sm:inline" aria-label={`Logged in as ${user.name}`}>
                {user.name}
              </span>
              <button
                onClick={logout}
                className="bg-stadium-card hover:bg-fifa-red/20 hover:text-fifa-red text-slate-300 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-fifa-gold"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-stadium-card hover:bg-stadium-border text-slate-100 p-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fifa-gold"
              aria-label="Admin Login Page"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Login</span>
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
