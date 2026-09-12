// ═══════════════════════════════════════════════════════════
//  CJF FIREBASE CONFIGURATION
//  Replace the values below with your own Firebase project
//  details after completing the setup steps in setup.html
// ═══════════════════════════════════════════════════════════

const CJF_FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBOnKVYCPK4ZWo9D7tPyKl-TrKpPrqnjgY",
  authDomain:        "cjf-zambia.firebaseapp.com",
  projectId:         "cjf-zambia",
  storageBucket:     "cjf-zambia.firebasestorage.app",
  messagingSenderId: "172484529107",
  appId:             "1:172484529107:web:4e8953afc529a4656a3d26"
};

// ── Detect whether Firebase has been configured ──────────
window.CJF_FIREBASE_READY = !CJF_FIREBASE_CONFIG.apiKey.startsWith("PASTE");
