# Firebase Deployment Guide

## Project Setup

This project is configured with two Firebase environments:

- **Development**: `investisizer-dev` (alias: `dev`)
- **Production**: `investisizer` (alias: `prod`)

## Environment Configuration

### Development (.env.development)
- Project ID: `investisizer-dev`
- Auth Domain: `investisizer-dev.firebaseapp.com`
- Used for: Local development and testing

### Production (.env.production)
- Project ID: `investisizer`
- Auth Domain: `investisizer.firebaseapp.com`
- Used for: Production deployment

## Deployment Commands

### Switch Between Projects
```bash
# Switch to development
firebase use dev

# Switch to production  
firebase use prod

# Check current project
firebase use
```

### Deploy Firestore Rules
```bash
# Deploy to current project
firebase deploy --only firestore:rules

# Deploy to specific environment
firebase use dev && firebase deploy --only firestore:rules
firebase use prod && firebase deploy --only firestore:rules
```

### Deploy Hosting
```bash
# Build and deploy to current project
npm run build
firebase deploy --only hosting

# Deploy to specific environment
npm run build
firebase use prod && firebase deploy --only hosting
```

## Security Rules

The Firestore security rules in `firestore.rules` ensure:
- Users can only access their own data under `/users/{userId}/data/**`
- All other access is denied
- Authenticated users required for all operations

## Document Structure

Portfolio data is stored at:
```
/users/{userId}/data/portfolio
/users/{userId}/data/profile
```

This uses the correct Firestore path structure (even number of segments: collection/document/collection/document).

## Current Status
- ✅ Rules deployed to both dev and prod environments
- ✅ Firestore paths fixed for proper document structure
- ✅ Enhanced error handling and UI implemented
- ✅ Development environment ready for testing