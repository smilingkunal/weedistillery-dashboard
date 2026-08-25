// WeeDistillery Dashboard - Google OAuth wrapper
// Uses Google Identity Services (GIS) for "Sign in with Google"
//
// SETUP REQUIRED:
// 1. Create OAuth Client ID in Google Cloud Console:
//    - API & Services → Credentials → Create OAuth Client ID
//    - Application type: Web application
//    - Authorized JavaScript origins:
//      * http://localhost (for local testing)
//      * https://smilingkunal.github.io (for production)
//    - Note the Client ID
// 2. Replace the GOOGLE_CLIENT_ID below with your Client ID
// 3. Replace the ALLOWED_EMAIL with primebridgemarketing@gmail.com
//
// For now, this file runs in DEMO MODE (any sign-in succeeds) so you can
// preview the dashboard without setting up OAuth. Replace the constants
// below + flip DEMO_MODE to false to enable real auth.

const GOOGLE_CLIENT_ID = 'REPLACE_ME.apps.googleusercontent.com';
const ALLOWED_EMAIL = 'primebridgemarketing@gmail.com';
const DEMO_MODE = true;  // Set to false when real OAuth is configured

const ALLOWED_EMAILS = [
  'primebridgemarketing@gmail.com',
  'weeddistillery@gmail.com',
  'kunal@primebridgemedia.com'
];

function showDashboard(user) {
  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('user-info').textContent = user.email;
}

function showAuthError(msg) {
  const errEl = document.getElementById('auth-error');
  if (errEl) errEl.textContent = msg;
}

function isAllowed(email) {
  return ALLOWED_EMAILS.some(allowed => allowed.toLowerCase() === (email || '').toLowerCase());
}

// Demo mode: simulate successful auth so you can preview the UI
function demoSignIn() {
  const fakeUser = {
    email: ALLOWED_EMAILS[0],
    name: 'Kunal (demo mode)'
  };
  showDashboard(fakeUser);
}

// Real Google Sign-In via GIS
function initGoogleSignIn() {
  if (typeof google === 'undefined' || !google.accounts) {
    console.warn('Google Identity Services not loaded');
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  google.accounts.id.renderButton(
    document.getElementById('sign-in-btn'),
    { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular' }
  );
}

function handleCredentialResponse(response) {
  if (!response.credential) {
    showAuthError('Sign-in failed. Please try again.');
    return;
  }
  // Decode the JWT to get user info (no server-side verification in this simple flow)
  const payload = parseJwt(response.credential);
  if (!payload || !payload.email) {
    showAuthError('Could not verify your Google account.');
    return;
  }
  if (!isAllowed(payload.email)) {
    showAuthError(`Access denied. ${payload.email} is not authorized to view this dashboard.`);
    return;
  }
  showDashboard({ email: payload.email, name: payload.name });
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function signOut() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  document.getElementById('auth-gate').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

// Wire up on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const signInBtn = document.getElementById('sign-in-btn');
  const signOutBtn = document.getElementById('sign-out-btn');

  if (DEMO_MODE) {
    // In demo mode, the button bypasses real OAuth and shows the dashboard
    if (signInBtn) {
      signInBtn.addEventListener('click', demoSignIn);
    }
  } else {
    if (signInBtn) {
      signInBtn.addEventListener('click', () => {
        if (typeof google !== 'undefined' && google.accounts) {
          google.accounts.id.prompt();
        } else {
          showAuthError('Google Sign-In not loaded. Please refresh.');
        }
      });
    }
    initGoogleSignIn();
  }

  if (signOutBtn) signOutBtn.addEventListener('click', signOut);
});