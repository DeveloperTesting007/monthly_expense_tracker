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
    MdLogout,
    MdCategory,
    MdExpandMore,
    MdExpandLess,
    MdTaskAlt
} from 'react-icons/md';

// Styling constants
const STYLE = {
    menuItem: {
        base: `flex items-center rounded-lg transition-all duration-200 min-h-[42px] touch-none`,
        active: `bg-indigo-600 text-white shadow-md`,
        inactive: `hover:bg-gray-800/50 active:bg-gray-800 text-gray-400 hover:text-white`,
        collapsed: `justify-center p-2 relative group`,
        expanded: `px-4 py-3 gap-3`
    },
    tooltip: `absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-sm 
        rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 
        pointer-events-none z-50 shadow-lg transition-opacity duration-150`,
    subMenuItem: {
        base: `flex items-center pl-12 pr-4 py-2 rounded-lg transition-all duration-200 gap-3`,
        active: `bg-indigo-600/50 text-white`,
        inactive: `text-gray-400 hover:bg-gray-800/30 hover:text-white`
    }
};

// Component for menu items
const MenuItem = ({ item, isCollapsed, isActive, onClose }) => {
    if (item.path) {
        return (
            <Link
                to={item.path}
                onClick={onClose}
                className={`${STYLE.menuItem.base}
                    ${isCollapsed ? STYLE.menuItem.collapsed : STYLE.menuItem.expanded}
                    ${isActive ? STYLE.menuItem.active : STYLE.menuItem.inactive}
                    text-[13px]`}
            >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                {isCollapsed && <span className={STYLE.tooltip}>{item.title}</span>}
            </Link>
        );
    }
    return null;
};

// Component for collapsible menu items
const CollapsibleMenuItem = ({ item, isCollapsed, isActive, expandedMenus, toggleSubmenu, onClose }) => {
    const isExpanded = expandedMenus[item.title];

    return (
        <div className="relative group">
            <div
                onClick={() => !isCollapsed && toggleSubmenu(item.title)}
                className={`${STYLE.menuItem.base} cursor-pointer
                    ${isCollapsed ? STYLE.menuItem.collapsed : STYLE.menuItem.expanded}
                    ${isActive ? STYLE.menuItem.active : STYLE.menuItem.inactive}`}
            >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                    <>
                        <span className="font-medium truncate flex-1">{item.title}</span>
                        {item.collapsible && (
                            <span className="text-gray-400">
                                {isExpanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
                            </span>
                        )}
                    </>
                )}
                {isCollapsed && <span className={STYLE.tooltip}>{item.title}</span>}
            </div>

            {!isCollapsed && item.subItems && (
                <div className={`mt-2 space-y-1 overflow-hidden transition-all duration-200
                    ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {item.subItems.map(subItem => (
                        <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={onClose}
                            className={`${STYLE.subMenuItem.base}
                                ${isActive ? STYLE.subMenuItem.active : STYLE.subMenuItem.inactive}`}
                        >
                            {subItem.icon}
                            <span className="font-medium text-sm">{subItem.title}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Sidebar({ onClose, isMobileOpen }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { title: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={22} /> },
        { title: 'Add Transaction', path: '/expenses', icon: <MdAttachMoney size={22} /> },
        { title: 'Todo Tasks', path: '/todo', icon: <MdTaskAlt size={22} /> },
        { title: 'Reports', path: '/reports', icon: <MdInsertChart size={22} /> },
        {
            title: 'Settings',
            icon: <MdSettings size={22} />,
            collapsible: true,
            subItems: [
                { title: 'Categories', path: '/settings/categories', icon: <MdCategory size={18} /> }
            ]
        }
    ];

    const isPathActive = (path) => {
        if (!path) return false;
        return location.pathname === path || location.pathname.startsWith(path);
    };

    const toggleSubmenu = (path) => {
        setExpandedMenus(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

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
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden
                    ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`bg-gray-900 text-gray-100 fixed left-0 top-0 h-full
                    w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-64
                    transition-all duration-300 ease-in-out z-30
                    ${isCollapsed ? 'lg:w-[52px]' : 'lg:w-64'} 
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    shadow-xl`}
            >
                {/* Mobile Header */}
                <MobileHeader onClose={onClose} />

                {/* Desktop collapse button */}
                <CollapseButton isCollapsed={isCollapsed} onClick={() => setIsCollapsed(!isCollapsed)} />

                <div className={`p-3 sm:p-4 flex flex-col h-[calc(100vh-56px)] lg:h-full overflow-y-auto
                    ${isCollapsed ? 'lg:p-2' : ''}`}>
                    {/* Logo */}
                    <Logo isCollapsed={isCollapsed} />

                    {/* User Profile */}
                    <UserProfile currentUser={currentUser} isCollapsed={isCollapsed} />

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {navItems.map(item => {
                            const isActive = item.path ? isPathActive(item.path) :
                                item.subItems?.some(sub => isPathActive(sub.path));

                            return (
                                <div key={item.title}>
                                    {item.path ? (
                                        <MenuItem
                                            item={item}
                                            isCollapsed={isCollapsed}
                                            isActive={isActive}
                                            onClose={onClose}
                                        />
                                    ) : (
                                        <CollapsibleMenuItem
                                            item={item}
                                            isCollapsed={isCollapsed}
                                            isActive={isActive}
                                            expandedMenus={expandedMenus}
                                            toggleSubmenu={toggleSubmenu}
                                            onClose={onClose}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <LogoutButton
                        isCollapsed={isCollapsed}
                        onLogout={() => {
                            logout();
                            onClose();
                        }}
                    />
                </div>
            </aside>
        </>
    );
}

// Helper components
const MobileHeader = ({ onClose }) => (
    <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h1 className="text-base font-medium">Monthly Expense Tracker</h1>
            <button
                onClick={onClose}
                className="p-2 -mr-2 hover:bg-gray-800 rounded-lg transition-colors active:bg-gray-700 touch-none"
                aria-label="Close menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
);

const CollapseButton = ({ isCollapsed, onClick }) => (
    <button
        onClick={onClick}
        className="absolute -right-3 top-9 bg-indigo-600 rounded-full p-1.5
            cursor-pointer hover:bg-indigo-700 transition-colors duration-200
            shadow-lg hidden lg:block"
    >
        {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
    </button>
);

const Logo = ({ isCollapsed }) => (
    <div className={`mb-6 text-center hidden lg:block overflow-hidden transition-all duration-300
        ${isCollapsed ? 'mb-4' : ''}`}>
        <h1 className="font-bold text-xl whitespace-nowrap">
            {isCollapsed ? '💰' : 'ExpenseTracker'}
        </h1>
    </div>
);

const UserProfile = ({ currentUser, isCollapsed }) => (
    <div className="relative mb-6 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-2">
                <div className={`rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
                    flex items-center justify-center shadow-lg ring-2 ring-indigo-400/30
                    transition-all duration-300
                    ${isCollapsed ? 'w-8 h-8 text-sm' : 'w-14 h-14 text-base lg:text-lg font-bold'}`}>
                    {currentUser?.email?.[0].toUpperCase()}
                </div>
                <div className="w-3.5 h-3.5 bg-green-500 rounded-full absolute -bottom-0.5 -right-0.5 
                    border-2 border-gray-900 ring-2 ring-green-400/30"></div>
            </div>

            {/* User Info */}
            {!isCollapsed && (
                <div className="w-full">
                    <p className="font-medium text-sm truncate">
                        {currentUser?.email}
                    </p>
                    <p className="text-xs text-green-400 mt-0.5">Active Now</p>
                </div>
            )}
        </div>

        {/* Divider */}
        {!isCollapsed && (
            <div className="mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-800/50"></div>
                <span className="text-[11px] font-medium text-gray-500 px-2 rounded-full bg-gray-800/30">MENU</span>
                <div className="h-px flex-1 bg-gray-800/50"></div>
            </div>
        )}
    </div>
);

const LogoutButton = ({ isCollapsed, onLogout }) => (
    <button
        onClick={onLogout}
        className={`mt-6 flex items-center rounded-lg transition-all duration-200
            min-h-[42px] touch-none text-sm
            hover:bg-red-500/10 active:bg-red-500/20 text-red-500 w-full
            ${isCollapsed ? 'justify-center p-2 mt-4' : 'px-4 py-3 gap-3'}`}
    >
        <MdLogout size={isCollapsed ? 20 : 22} />
        {!isCollapsed && <span className="font-medium">Logout</span>}
    </button>
);
