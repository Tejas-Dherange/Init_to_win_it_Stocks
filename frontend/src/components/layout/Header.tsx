import React from 'react';
import { Bell, Search } from 'lucide-react';
import UserMenu from './UserMenu';


export const Header: React.FC = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
            <div className="flex items-center justify-between h-full px-8">
                {/* Search */}
                <div className="flex-1 max-w-lg">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Search stocks, decisions..."
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Time */}
                    <div className="text-sm text-gray-600">
                        {new Date().toLocaleTimeString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <span className="text-xs ml-1">IST</span>
                    </div>

                    {/* User Menu */}
                    <UserMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
