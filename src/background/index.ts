function oauthSignIn() {
  return new Promise((resolve, reject) => {
    var manifest = chrome.runtime.getManifest();
    // Google's OAuth 2.0 endpoint for requesting an access token
    if (!manifest.oauth2 || !manifest.oauth2.scopes) return;
    var clientId = encodeURIComponent(manifest.oauth2.client_id);
    var scopes = encodeURIComponent(manifest.oauth2.scopes.join(' '));
    var redirectUri = encodeURIComponent('https://' + chrome.runtime.id + '.chromiumapp.org');

    var url = 'https://accounts.google.com/o/oauth2/v2/auth' +
      '?client_id=' + clientId +
      '&redirect_uri=' + redirectUri +
      '&response_type=token' +
      '&scope=' + scopes
    
    // Launch the OAuth flow to get an access token
    console.log('Launching OAuth flow for', url);
    chrome.identity.launchWebAuthFlow({
      'url': url,
      'interactive': true
    }, (redirectedTo) => {
      console.log('Redirected to:', redirectedTo);
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (redirectedTo) {
        const params = new URLSearchParams(redirectedTo.split('#')[1]);
        const accessToken = params.get('access_token');
        if (accessToken) {
          resolve(accessToken);
        } else {
          reject(new Error('Access token not found in the URL'));
        }
      }
    });
  });
}

async function SignIn(sendResponse: (response?: any) => void) {
  try {
    const token = await oauthSignIn();
    if (token) {
      sendResponse({ success: true, token: token });
    }
  } catch (error) {
    console.error('Error during sign-in:', error);
    sendResponse({ success: false, error: error });
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'signInGoogle') {
    console.log('Attempting sign in');
    SignIn(sendResponse);
    return true;
  }
});