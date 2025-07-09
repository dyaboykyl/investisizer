import { useRootStore } from '@/features/core/stores/hooks';
import { ResetPortfolioButton } from '@/features/portfolio/components/ResetPortfolioButton';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { AuthModal } from './AuthModal';
import { Footer } from './Footer';
import { SaveStatus } from './SaveStatus';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = observer(({ children }) => {
  const { authStore, portfolioStore } = useRootStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg md:sticky md:top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3-3 3 3 4-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3v3h-3" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Investisizer
              </h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <div className="hidden sm:block">
                <SaveStatus />
              </div>
              {authStore.isSignedIn ? (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="hidden md:block text-sm text-gray-600 dark:text-gray-300 truncate max-w-32">
                    {authStore.displayName || authStore.email}
                  </span>
                  <button
                    onClick={() => authStore.signOut()}
                    className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 hover:underline"
                >
                  Sign In
                </button>
              )}
              {/* Save and Undo buttons */}
              {portfolioStore.hasUnsavedChanges && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => portfolioStore.undoChanges()}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Undo changes"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => portfolioStore.save()}
                    className="p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    title="Save changes"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                    </svg>
                  </button>
                </div>
              )}
              <div className=" sm:block">
                <ResetPortfolioButton />
              </div>
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