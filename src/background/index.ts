function fetchGoogleCalendar(token: string) {
  fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Google Calendar events:', data);
  })
  .catch((error) => {
    console.error('Error fetching calendar events:', error);
  });
}

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

    chrome.identity.launchWebAuthFlow({
      'url': url,
      'interactive': true
    }, (redirectedTo) => {
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

async function SignIn() {
  const token = await oauthSignIn();
  if (token) {
    console.log('Token:', token.toString());
    fetchGoogleCalendar(token.toString());
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'signInAndFetchCalendar') {
    console.log('Attempting sign in');
    // Attempt to sign in and fetch calendar
    
    SignIn();
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});