import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MdDashboard, 
  MdAttachMoney, 
  MdInsertChart, 
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
  MdLogout
} from 'react-icons/md';

export default function Sidebar({ onClose, isMobileOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { title: 'Overview', path: '/dashboard', icon: <MdDashboard size={24} /> },
    { title: 'Expenses', path: '/expenses', icon: <MdAttachMoney size={24} /> },
    { title: 'Reports', path: '/reports', icon: <MdInsertChart size={24} /> },
    { title: 'Settings', path: '/settings', icon: <MdSettings size={24} /> },
  ];

  // Handle escape key for mobile
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Mobile Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden
          ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className={`bg-gray-900 text-gray-100 fixed left-0 top-0 h-screen
          transition-all duration-300 ease-in-out z-30
          ${isCollapsed ? 'w-20' : 'w-72'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-800">
          <h1 className="text-xl font-bold">Menu</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desktop collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-indigo-600 rounded-full p-1.5
            cursor-pointer hover:bg-indigo-700 transition-colors duration-200
            shadow-lg hidden lg:block"
        >
          {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
        </button>

        <div className="p-4 flex flex-col h-[calc(100vh-64px)] lg:h-full overflow-y-auto">
          {/* Logo - Hidden on mobile when menu header is shown */}
          <div className="mb-8 text-center hidden lg:block">
            <h1 className={`font-bold text-2xl`}>
              {isCollapsed ? '💰' : 'ExpenseTracker'}
            </h1>
          </div>

          {/* User Profile - Updated */}
          <div className="relative mb-8">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
                  flex items-center justify-center text-xl font-bold shadow-lg ring-2 ring-indigo-400/30">
                  {currentUser?.email?.[0].toUpperCase()}
                </div>
                <div className="w-3.5 h-3.5 bg-green-500 rounded-full absolute -bottom-1 -right-1 
                  border-2 border-gray-900 ring-2 ring-green-400/30"></div>
              </div>

              {/* User Info */}
              {!isCollapsed && (
                <div className="text-center space-y-1">
                  <p className="font-medium text-sm">
                    {currentUser?.email}
                  </p>
                  <p className="text-xs text-green-400">Active Now</p>
                </div>
              )}
            </div>

            {/* Divider - Updated */}
            {!isCollapsed && (
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-800/50"></div>
                <span className="text-xs font-medium text-gray-500 px-2 rounded-full bg-gray-800/30">MENU</span>
                <div className="h-px flex-1 bg-gray-800/50"></div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center rounded-lg transition-all duration-200
                    ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.title}</span>
                  )}
                  {!isCollapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className={`mt-6 flex items-center rounded-lg transition-all duration-200
              hover:bg-red-500/10 text-red-500 w-full
              ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}`}
          >
            <MdLogout size={24} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
