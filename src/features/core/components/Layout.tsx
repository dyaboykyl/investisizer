import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';
import { ResetPortfolioButton } from '@/features/portfolio/components/ResetPortfolioButton';
import { AuthModal } from './AuthModal';
import { SaveStatus } from './SaveStatus';
import { useRootStore } from '@/features/core/stores/hooks';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = observer(({ children }) => {
  const { authStore } = useRootStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3-3 3 3 4-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3v3h-3" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Investisizer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <SaveStatus />
              {authStore.isSignedIn ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {authStore.displayName || authStore.email}
                  </span>
                  <button
                    onClick={() => authStore.signOut()}
                    className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
                >
                  Sign In
                </button>
              )}
              <ResetPortfolioButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 py-8 pb-8">
        {children}
      </main>

      <Footer />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
});