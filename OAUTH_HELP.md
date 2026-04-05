# 🆘 Google OAuth Setup Guide

### 1. Credentials File (.env.local)
Ensure these two lines in your `.env.local` are filled with the **Client ID** and **Client Secret** (NOT the Project ID).

GOOGLE_CLIENT_ID=XXXXX-XXXXX.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-XXXXX

### 2. Google Cloud Console Settings
Go to: https://console.cloud.google.com/apis/credentials

**Create OAuth 2.0 Client ID**
- **Application Type**: Web Application
- **Name**: Lana Cleaning
- **Authorized JavaScript Origins**: `http://localhost:3000`
- **Authorized Redirect URIs**: `http://localhost:3000/api/auth/callback/google` (CRITICAL!)

### 3. OAuth Consent Screen
Go to: https://console.cloud.google.com/apis/credentials/consent
- **User Type**: External
- **App Status**: Testing (This is fine for localhost)
- **Test Users**: Add your email (`benarshy@gmail.com`) to the "Test Users" list. (CRITICAL!)

### 4. Restart Dev Server
Sometimes environment variables need a fresh start. Close the terminal and run:
`npm run dev`
