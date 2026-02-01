import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function UserMenu() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleSignOut = async () => {
        await signOut();
        navigate('/sign-in');
    };

    const getInitials = () => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        if (user.primaryEmailAddress?.emailAddress) {
            return user.primaryEmailAddress.emailAddress[0].toUpperCase();
        }
        return 'U';
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
                {user.hasImage && user.imageUrl ? (
                    <img
                        src={user.imageUrl}
                        alt={user.fullName || 'User'}
                        className="w-8 h-8 rounded-full border-2 border-blue-500"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-blue-400">
                        {getInitials()}
                    </div>
                )}
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">
                        {user.fullName || user.primaryEmailAddress?.emailAddress}
                    </p>
                    <p className="text-xs text-gray-400">Trader</p>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white truncate">
                            {user.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            navigate('/profile');
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                    >
                        <User className="w-4 h-4" />
                        Profile Settings
                    </button>

                    <button
                        onClick={() => {
                            // Future: Add settings page
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Preferences
                    </button>

                    <div className="border-t border-gray-700 my-2"></div>

                    <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-3 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
