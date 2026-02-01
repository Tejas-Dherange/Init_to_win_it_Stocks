import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">RiskMind</h1>
                    <p className="text-gray-300">AI Trading Assistant</p>
                </div>

                <ClerkSignUp
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto',
                            card: 'bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-2xl',
                            headerTitle: 'text-white',
                            headerSubtitle: 'text-gray-300',
                            socialButtonsBlockButton: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600',
                            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                            formFieldLabel: 'text-gray-300',
                            formFieldInput: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
                            footerActionLink: 'text-blue-400 hover:text-blue-300',
                            identityPreviewText: 'text-white',
                            identityPreviewEditButton: 'text-blue-400',
                            formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-300',
                            dividerLine: 'bg-gray-600',
                            dividerText: 'text-gray-400',
                            otpCodeFieldInput: 'bg-gray-700 border-gray-600 text-white',
                        },
                    }}
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    afterSignUpUrl="/"
                    redirectUrl="/"
                />
            </div>
            <div>
                <h1 className="text-white text-center mt-4">
                    <span className="font-bold">

                        Login Credentials
                    </span>
                    <br />
                    Email: tejasdivekar9057@gmail.com
                    <br />
                    Password: Shubhangi@9057
                </h1>
            </div>
        </div>
    );
}
