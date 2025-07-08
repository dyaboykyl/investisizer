import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/features/core/stores/hooks';
import { Modal, ModalHeader, ModalBody } from '@/features/shared/components/modals';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = observer(({ isOpen, onClose }) => {
  const { authStore } = useRootStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await authStore.signUpWithEmail(email, password);
    } else {
      await authStore.signInWithEmail(email, password);
    }
    if (authStore.isSignedIn) {
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    await authStore.signInWithGoogle();
    if (authStore.isSignedIn) {
      onClose();
    }
  };

  const handleClose = () => {
    authStore.clearError();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <ModalHeader 
          title={isSignUp ? 'Create Account' : 'Sign In'}
          onClose={handleClose}
        />

        <ModalBody>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Sign in to sync your portfolios across devices
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={authStore.isLoading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg mb-4 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {authStore.isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="text-center text-gray-500 dark:text-gray-400 mb-4">or</div>

          <form onSubmit={handleEmailAuth}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
            <button
              type="submit"
              disabled={authStore.isLoading}
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {authStore.isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-blue-500 dark:text-blue-400 mt-3 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>

          {authStore.error && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{authStore.error}</p>
            </div>
          )}
        </ModalBody>
      </div>
    </Modal>
  );
});