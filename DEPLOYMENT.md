# Deployment Guide for Investisizer

## Firebase Hosting Setup

### Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Create a Firebase project at https://console.firebase.google.com/
3. Enable Firebase Hosting for your project

### Initial Setup

1. **Login to Firebase:**
   ```bash
   firebase login
   ```

2. **Initialize Firebase (if not already done):**
   ```bash
   firebase init hosting
   ```
   - Choose "Use an existing project" and select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

3. **Update `.firebaserc`:**
   Replace `"investisizer"` with your actual Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

3. **View your site:**
   Your app will be available at: `https://your-project-id.web.app`

### Automated Deployment with GitHub Actions

1. **Generate Firebase Service Account:**
   ```bash
   firebase init hosting:github
   ```
   This will:
   - Create a service account
   - Add the service account key as a GitHub secret
   - Set up the workflow file

2. **Configure GitHub Secrets:**
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   
   Add the following secret:
   - `FIREBASE_SERVICE_ACCOUNT`: The service account JSON key

3. **Deploy:**
   - Push to `main` branch for production deployment
   - Create pull requests for preview deployments

### Custom Domain (Optional)

1. In Firebase Console, go to Hosting → Add custom domain
2. Follow the instructions to verify domain ownership
3. Update your DNS settings as instructed

## Environment Variables

Currently, the app doesn't use environment variables. If you need to add them:

1. Create `.env.production` file:
   ```
   VITE_API_KEY=your-api-key
   ```

2. Access in code:
   ```typescript
   const apiKey = import.meta.env.VITE_API_KEY;
   ```

3. Add to `.gitignore`:
   ```
   .env.production
   ```

## Monitoring

- View hosting metrics in Firebase Console → Hosting
- Check deployment history and rollback if needed
- Monitor usage and performance

## Troubleshooting

1. **Build fails:** Check Node.js version (should be 18+)
2. **Deploy fails:** Ensure you're logged in with `firebase login`
3. **404 errors:** Verify `firebase.json` has the rewrite rule for SPA
4. **Permission errors:** Check Firebase project permissions