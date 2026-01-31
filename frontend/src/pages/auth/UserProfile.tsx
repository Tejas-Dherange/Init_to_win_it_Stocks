import { UserProfile as ClerkUserProfile } from '@clerk/clerk-react';

export default function UserProfilePage() {
    return (
        <div className="min-h-screen bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

                <ClerkUserProfile
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-2xl',
                            navbar: 'bg-gray-800/70 border-gray-700',
                            navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700',
                            navbarButtonActive: 'text-white bg-blue-600',
                            headerTitle: 'text-white',
                            headerSubtitle: 'text-gray-300',
                            profileSection: 'text-white',
                            profileSectionTitle: 'text-white',
                            profileSectionContent: 'text-gray-300',
                            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                            formFieldLabel: 'text-gray-300',
                            formFieldInput: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
                            badge: 'bg-blue-600 text-white',
                            avatarBox: 'border-gray-600',
                            formButtonReset: 'text-gray-400 hover:text-gray-300',
                        },
                    }}
                    routing="path"
                    path="/profile"
                />
            </div>
        </div>
    );
}
