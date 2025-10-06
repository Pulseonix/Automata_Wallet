// Background service worker for Chrome Extension MV3
// This runs in the background and handles wallet operations

console.log('Automata Wallet background service worker initialized');

// Listen for extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Automata Wallet installed for the first time');
    // Initialize default settings
    chrome.storage.local.set({
      version: '0.1.0-alpha',
      initialized: false,
    });
  } else if (details.reason === 'update') {
    console.log('Automata Wallet updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  // Handle different message types
  switch (message.type) {
    case 'PING':
      sendResponse({ status: 'pong' });
      break;
    
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async responses
});

// Keep service worker alive
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // Perform periodic tasks
    console.log('Service worker heartbeat');
  }
});

export {};
