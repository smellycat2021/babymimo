/**
 * Baby Mimo Website Analytics
 * Sends page view events to the existing CloudKit AnalyticsEvent table.
 * - No cookies — uses sessionStorage (cleared on tab close, no consent needed)
 * - Respects DNT (Do Not Track) header
 * - Silent fail — never breaks the page
 */
(function () {
  // Respect Do Not Track
  if (navigator.doNotTrack === '1') return;

  const CONTAINER  = 'iCloud.com.tutujia.babememo';
  const API_TOKEN  = 'YOUR_CLOUDKIT_API_TOKEN_HERE'; // replace after generating in CloudKit Dashboard
  const ENDPOINT   = `https://api.apple-cloudkit.com/database/1/${CONTAINER}/production/public/records/modify?ckAPIToken=${API_TOKEN}`;

  // Session tracking via sessionStorage — cleared when tab closes, no persistence
  function getOrCreate(key, factory) {
    let v = sessionStorage.getItem(key);
    if (!v) { v = factory(); sessionStorage.setItem(key, v); }
    return v;
  }

  const sessionId       = getOrCreate('bm_sid', () => crypto.randomUUID());
  const sessionStartMs  = parseInt(getOrCreate('bm_ss',  () => Date.now()), 10);

  function track(name, extra) {
    const fields = {
      eventId:        { value: crypto.randomUUID() },
      category:       { value: 'website' },
      name:           { value: name },
      status:         { value: 'success' },
      timestamp:      { value: Date.now() },
      sessionId:      { value: sessionId },
      sessionStartedAt: { value: sessionStartMs },
      appVersion:     { value: 'website' },
      osVersion:      { value: navigator.userAgent.slice(0, 200) },
      isProd:         { value: 1 },
      metadata:       { value: JSON.stringify({
        page:     window.location.pathname,
        referrer: document.referrer ? (new URL(document.referrer).hostname) : 'direct',
        ...extra
      })}
    };

    navigator.sendBeacon
      ? navigator.sendBeacon(ENDPOINT, new Blob([JSON.stringify({
          operations: [{ operationType: 'create', record: { recordType: 'AnalyticsEvent', fields } }]
        })], { type: 'application/json' }))
      : fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operations: [{ operationType: 'create', record: { recordType: 'AnalyticsEvent', fields } }]
          }),
          keepalive: true
        }).catch(() => {});
  }

  // Fire on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => track('page_view'));
  } else {
    track('page_view');
  }
})();
