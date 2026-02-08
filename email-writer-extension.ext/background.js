// background.js - MV3 service worker

console.log('Background worker starting');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  if (!message || message.type !== 'generate') return;

  const body = JSON.stringify({
    emailContent: message.emailContent,
    tone: message.tone || 'professional'
  });

  const tryFetch = (url) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });
  };

  // Try primary path; if 404, try lowercase /api/generate as a fallback (common server mapping difference)
  const primary = 'http://localhost:8085/Api/generate';
  const fallback = 'http://localhost:8085/api/generate';

  tryFetch(primary)
    .then(async (res) => {
      console.log('Fetch to', primary, 'status:', res.status);
      if (res.ok) return res.text();

      const bodyText = await res.text().catch(() => '');
      if (res.status === 404) {
        console.warn(primary, 'returned 404, trying fallback', fallback);
        // try fallback
        return tryFetch(fallback).then(async (r2) => {
          console.log('Fetch to', fallback, 'status:', r2.status);
          const t2 = await r2.text().catch(() => '');
          if (!r2.ok) throw new Error('Fallback server returned ' + r2.status + (t2 ? (': ' + t2) : ''));
          return t2;
        });
      }

      throw new Error('Server returned ' + res.status + (bodyText ? (': ' + bodyText) : ''));
    })
    .then((text) => {
      console.log('Fetch succeeded, length:', text && text.length);
      sendResponse({ ok: true, text });
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      sendResponse({ ok: false, message: err.message || String(err) });
    });

  // Indicate we'll call sendResponse asynchronously
  return true;
});
