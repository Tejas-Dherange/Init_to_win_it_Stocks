import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageCircle, FileCheck, Activity } from 'lucide-react';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Decisions', href: '/decisions', icon: FileCheck },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Health', href: '/health', icon: Activity },
];

export const Sidebar: React.FC = () => {
    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">RiskMind</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-100'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={clsx(
                                        'w-5 h-5 mr-3',
                                        isActive ? 'text-primary-600' : 'text-gray-500'
                                    )}
                                />
                                {item.name}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">D</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Demo User</p>
                        <p className="text-xs text-gray-500 truncate">demo@riskmind.ai</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
