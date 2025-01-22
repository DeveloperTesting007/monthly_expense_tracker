import React, { useState } from 'react';
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

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { title: 'Overview', path: '/dashboard', icon: <MdDashboard size={24} /> },
    { title: 'Expenses', path: '/expenses', icon: <MdAttachMoney size={24} /> },
    { title: 'Reports', path: '/reports', icon: <MdInsertChart size={24} /> },
    { title: 'Settings', path: '/settings', icon: <MdSettings size={24} /> },
  ];

  return (
    <div 
      className={`bg-gray-900 text-gray-100 fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-24' : 'w-64'} shadow-xl`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 bg-indigo-600 rounded-full p-1.5 cursor-pointer
          hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
      >
        {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
      </button>

      <div className="p-4 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className={`font-bold ${isCollapsed ? 'text-2xl' : 'text-2xl'}`}>
            {isCollapsed ? '💰' : 'ExpenseTracker'}
          </h1>
        </div>

        {/* User Profile with divider */}
        <div className="relative">
          <div className="mb-8 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
                flex items-center justify-center text-xl font-bold shadow-lg ring-2 ring-indigo-400/50">
                {currentUser?.email?.[0].toUpperCase()}
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 
                border-2 border-gray-900"></div>
            </div>
            {!isCollapsed && (
              <div className="mt-3 space-y-1 text-center">
                <p className="font-medium text-sm break-words px-2" style={{ wordBreak: 'break-all' }}>
                  {currentUser?.email}
                </p>
              </div>
            )}
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-700/50"></div>
            </div>
            {!isCollapsed && (
              <div className="relative flex justify-center">
                <span className="bg-gray-900 px-2 text-xs text-gray-500">MENU</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-lg mb-2 transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}
                  ${isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
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
          onClick={logout}
          className={`mt-auto flex items-center rounded-lg transition-all duration-200
            hover:bg-red-500/10 text-red-500
            ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}`}
        >
          <MdLogout size={24} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
