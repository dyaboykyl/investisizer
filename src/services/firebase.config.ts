// Helper to safely access environment variables in both runtime and test environments
const getEnvVar = (key: string): string => {
  // In test environment, use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  // In runtime environment, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  return '';
};

const getMode = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    return 'development';
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE) {
    return import.meta.env.MODE;
  }
  return 'development';
};

const firebaseConfig = {
  development: {
    apiKey: getEnvVar('VITE_FIREBASE_DEV_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_DEV_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_DEV_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_DEV_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_DEV_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_DEV_APP_ID')
  },
  production: {
    apiKey: getEnvVar('VITE_FIREBASE_PROD_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_PROD_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROD_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_PROD_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_PROD_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_PROD_APP_ID')
  }
};

const config = firebaseConfig[getMode() as keyof typeof firebaseConfig] || firebaseConfig.development;

// Debug: Log configuration in development (be careful not to log sensitive data in production)
if (typeof window !== 'undefined') {
  console.log('Firebase mode:', getMode());
  console.log('Firebase config keys present:', Object.keys(config));
  console.log('Auth domain:', config.authDomain);
  console.log('Project ID:', config.projectId);

  // Check if any required fields are missing
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);
  if (missingFields.length > 0) {
    console.error('Missing Firebase config fields:', missingFields);
  }
}

export default config;