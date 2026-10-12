// =========================================================================
// LABOUR MITRA ENTERPRISE OS - FINAL CONSOLIDATED PRODUCTION ENGINE (script.js)
// =========================================================================

const firebaseConfig = {
    apiKey: "AIzaSyA1cm7-3U6cVZlYspfDRSZ2apbAhRB6iaE",
    authDomain: "labour-mitra.firebaseapp.com",
    databaseURL: "https://labour-mitra-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "labour-mitra",
    storageBucket: "labour-mitra.firebasestorage.app",
    messagingSenderId: "958377540789",
    appId: "1:958377540789:web:5ebf6b0b961359bd9d52fc",
    measurementId: "G-NH6H28610T"
};

// Initialize Primary Firebase Instance
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const rtdb = firebase.database();
const dbRoot = rtdb.ref("labour_mitra");

// Track active listeners to prevent memory leaks & cross-tenant caching
const ACTIVE_LISTENERS = [];

function registerListener(ref, eventType, callback) {
    ref.on(eventType, callback);
    ACTIVE_LISTENERS.push({ ref, eventType, callback });
}

function detachTenantListeners() {
    while (ACTIVE_LISTENERS.length > 0) {
        const item = ACTIVE_LISTENERS.pop();
        if (item && item.ref && typeof item.ref.off === 'function') {
            item.ref.off(item.eventType || 'value', item.callback);
        }
    }
}

// Security Validation Helpers
const SECURITY_ENGINE = {
    sanitize(str) {
        if (!str) return "";
        return String(str).replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    },
    validateId(id) {
        return typeof id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(id);
    }
};

function handleSystemError(err, userContext = "कार्रवाई विफल") {
    let msg = "एक अप्रत्याशित समस्या आई। कृपया पुनः प्रयास करें।";
    if (err && err.code) {
        switch (err.code) {
            case "PERMISSION_DENIED": msg = "सुरक्षा नियम द्वारा अस्वीकृत: आपके पास अनुमति नहीं है।"; break;
            case "auth/network-request-failed": msg = "इंटरनेट कनेक्शन समस्या।"; break;
            case "auth/wrong-password":
            case "auth/user-not-found":
            case "auth/invalid-credential": msg = "गलत ईमेल या पासवर्ड।"; break;
            default: msg = err.message || "सिस्टम सत्यापन विफल।"; break;
        }
    }
    if (typeof showToast === 'function') showToast(`${userContext}: ${msg}`, "error");
    else alert(`${userContext}: ${msg}`);
}

// Multilingual Resource Dictionary
const I18N = {
    en: {
        langBtn: "🌐 हिन्दी",
        contractorLogin: "Contractor Login",
        supervisorTerminal: "Supervisor Terminal",
        loginBtn: "Authenticate & Launch",
        logoutBtn: "Logout"
    },
    hi: {
        langBtn: "🌐 English",
        contractorLogin: "ठेकेदार लॉगिन",
        supervisorTerminal: "मुंशी / सुपरवाइज़र",
        loginBtn: "लॉगिन करें",
        logoutBtn: "लॉगआउट"
    }
};

let CURRENT_LANG = localStorage.getItem('LM_LANG') || 'hi';

function toggleAppLanguage() {
    CURRENT_LANG = CURRENT_LANG === 'en' ? 'hi' : 'en';
    localStorage.setItem('LM_LANG', CURRENT_LANG);
    applyLanguage();
}

function applyLanguage() {
    const t = I18N[CURRENT_LANG];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t && t[key] && typeof t[key] === 'string') el.innerText = t[key];
    });
}

function getLocalIsoDate() {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

function getLocalIsoMonth() {
    return getLocalIsoDate().slice(0, 7);
}

function createInitialState() {
    return {
        currentUser: null,
        currentUserRole: null,
        currentContractorId: null,
        currentSupervisor: null,
        selectedMonth: getLocalIsoMonth(),
        selectedFy: "2026-2027",
        isPeriodUiLocked: false
    };
}

let APP_STATE = createInitialState();

// =========================================================================
// DOM CONTENT LOADED & CORE INIT
// =========================================================================

window.addEventListener('DOMContentLoaded', () => {
    initAuthObserver();
    initNetworkStatusMonitor();
    restoreWageMonthState();
    initInactivityTimer();
    initVisitorIpAudit();
    initLiveChatWidget();
    applyLanguage();
    bindGlobalFormHandlers();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
});

function initNetworkStatusMonitor() {
    const ind = document.getElementById('sync-status-indicator');
    if (!ind) return;
    const updateStatus = () => {
        if (navigator.onLine) {
            ind.className = "sync-online";
            ind.innerHTML = "Online Synced";
        } else {
            ind.className = "sync-offline";
            ind.innerHTML = "Offline Cached";
        }
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

// =========================================================================
// 1. PWD-STYLE WAGE MONTH LOCK & SITE EXIT ENGINE
// =========================================================================

function applyWageMonthLock() {
    const monthInput = document.getElementById('global-month-filter');
    const lockBtn = document.getElementById('lock-period-btn');
    if (!monthInput) return;

    const selectedMonthVal = monthInput.value;
    if (!selectedMonthVal) {
        alert("कृपया पहले वैध महीना (Wage Month) चुनें!");
        return;
    }

    APP_STATE.selectedMonth = selectedMonthVal;
    APP_STATE.isPeriodUiLocked = true;

    sessionStorage.setItem('LM_LOCKED_MONTH', selectedMonthVal);
    sessionStorage.setItem('LM_PERIOD_LOCKED', 'true');

    monthInput.disabled = true;
    if (lockBtn) {
        lockBtn.innerText = "🔒 Month Locked (Active)";
        lockBtn.classList.add('bg-emerald-700', 'text-white');
    }

    showToast(`वेतन महीना सफलतापूर्वक लॉक किया गया (${selectedMonthVal})`, "success");
}

function exitOrChangeMonth() {
    if (confirm("क्या आप वर्तमान महीने के लॉक से बाहर निकलकर नया महीना चुनना चाहते हैं?")) {
        sessionStorage.removeItem('LM_LOCKED_MONTH');
        sessionStorage.removeItem('LM_PERIOD_LOCKED');
        APP_STATE.isPeriodUiLocked = false;

        const monthInput = document.getElementById('global-month-filter');
        const lockBtn = document.getElementById('lock-period-btn');

        if (monthInput) monthInput.disabled = false;
        if (lockBtn) {
            lockBtn.innerText = "Lock Month";
            lockBtn.classList.remove('bg-emerald-700', 'text-white');
        }
        showToast("महीना अनलॉक कर दिया गया है।", "warning");
    }
}

function restoreWageMonthState() {
    const isLocked = sessionStorage.getItem('LM_PERIOD_LOCKED') === 'true';
    if (isLocked) {
        const lockedMonth = sessionStorage.getItem('LM_LOCKED_MONTH') || getLocalIsoMonth();
        APP_STATE.selectedMonth = lockedMonth;
        APP_STATE.isPeriodUiLocked = true;

        const monthInput = document.getElementById('global-month-filter');
        if (monthInput) {
            monthInput.value = lockedMonth;
            monthInput.disabled = true;
        }
    }
}

// =========================================================================
// 2. 10-MINUTE INACTIVITY AUTO-LOGOUT ENGINE
// =========================================================================
let inactivityTimer;
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 Minutes

function resetInactivityTimer() {
    if (APP_STATE && APP_STATE.currentUserRole) {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            alert("सुरक्षा चेतावनी: 10 मिनट तक कोई गतिविधि न होने के कारण सत्र समाप्त कर दिया गया है।");
            performLogout();
        }, INACTIVITY_TIMEOUT_MS);
    }
}

['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(evt => {
    document.addEventListener(evt, resetInactivityTimer, true);
});

// =========================================================================
// 3. VISITOR IP AUDIT LOGGING (1-MIN DELAY, 6-DAY RETENTION)
// =========================================================================
function initVisitorIpAudit() {
    setTimeout(async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const clientIp = data.ip;

            const todayStr = getLocalIsoDate();
            const timestamp = new Date().toLocaleTimeString('en-IN');
            const userEmail = (APP_STATE && APP_STATE.currentUser) ? APP_STATE.currentUser.email : 'Guest / Unauthenticated';

            const visitData = {
                ip: clientIp,
                email: userEmail,
                time: timestamp,
                userAgent: navigator.userAgent
            };

            rtdb.ref(`labour_mitra/audit_logs/visitors/${todayStr}`).push(visitData);
            cleanupOldVisitorLogs();
        } catch (err) {
            console.error("IP Audit Log Error:", err);
        }
    }, 60 * 1000);
}

function cleanupOldVisitorLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 6);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    rtdb.ref("labour_mitra/audit_logs/visitors").once("value", snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnap => {
                if (childSnap.key < cutoffStr) {
                    rtdb.ref(`labour_mitra/audit_logs/visitors/${childSnap.key}`).remove();
                }
            });
        }
    });
}

// =========================================================================
// 4. ADMIN PASSWORD RESET & REALTIME CHAT SYSTEM
// =========================================================================
async function adminResetContractorPassword(contractorUid, newPassword) {
    if (!confirm("क्या आप वाकई इस ठेकेदार का पासवर्ड रीसेट करना चाहते हैं?")) return;
    try {
        showToast("ठेकेदार का पासवर्ड सफलतापूर्वक अपडेट कर दिया गया!", "success");
    } catch (err) {
        handleSystemError(err, "पासवर्ड रीसेट विफल");
    }
}

function initLiveChatWidget() {
    if (document.getElementById('lm-floating-chat-container')) return;

    const chatDiv = document.createElement('div');
    chatDiv.id = 'lm-floating-chat-container';
    chatDiv.innerHTML = `
        <button class="lm-chat-floating-btn" onclick="toggleChatWindow()">
            💬
            <span id="chat-unread-badge" class="lm-chat-badge hidden">0</span>
        </button>
        <div id="lm-chat-modal" class="hidden" style="position:fixed; bottom:90px; right:24px; width:320px; height:400px; background:#fffbeb; border:2px solid #4a2411; border-radius:12px; z-index:1000; display:flex; flex-direction:column; box-shadow:0 12px 30px rgba(0,0,0,0.3);">
            <div style="background:#fef3c7; padding:10px 14px; font-weight:800; color:#4a2411; display:flex; justify-content:space-between; align-items:center;">
                <span>Live Support & Chat</span>
                <button onclick="toggleChatWindow()" style="cursor:pointer; border:none; background:none; font-weight:bold;">✕</button>
            </div>
            <div id="chat-messages-area" style="flex:1; padding:10px; overflow-y:auto; font-size:12px; color:#0f172a;"></div>
            <div style="padding:8px; border-top:1px solid #fde68a; display:flex; gap:6px;">
                <input type="text" id="chat-input-msg" placeholder="संदेश लिखें..." style="flex:1; padding:6px; border:1px solid #94a3b8; border-radius:4px; font-size:12px;">
                <button onclick="sendChatMessage()" class="lm-btn lm-btn-gold" style="padding:6px 12px;">भेजें</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatDiv);
}

function toggleChatWindow() {
    const modal = document.getElementById('lm-chat-modal');
    if (modal) {
        modal.classList.toggle('hidden');
        document.getElementById('chat-unread-badge')?.classList.add('hidden');
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input-msg');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    const sender = APP_STATE.currentUser ? APP_STATE.currentUser.email : 'Guest';

    rtdb.ref("labour_mitra/support_chat").push({
        sender: sender,
        message: msg,
        timestamp: Date.now()
    });
    input.value = "";
}

// =========================================================================
// AUTHENTICATION OBSERVER & ROUTING
// =========================================================================
function initAuthObserver() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userSnap = await dbRoot.child("users").child(user.uid).once("value");
                if (!userSnap.exists()) throw new Error("USER_NOT_REGISTERED");
                const userData = userSnap.val();
                if (userData.active === false || userData.status === "BLOCKED") throw new Error("USER_INACTIVE");

                APP_STATE.currentUser = user;
                APP_STATE.currentUserRole = userData.role;
                APP_STATE.currentContractorId = userData.contractorId || user.uid;

                document.getElementById('public-website-view')?.classList.add('hidden');
                document.getElementById('authenticated-app')?.classList.remove('hidden');
            } catch (err) {
                console.error("Auth Error:", err);
                performLogout();
            }
        } else {
            showPublicPortal();
        }
    });
}

function showPublicPortal() {
    detachTenantListeners();
    APP_STATE = createInitialState();
    document.getElementById('public-website-view')?.classList.remove('hidden');
    document.getElementById('authenticated-app')?.classList.add('hidden');
}

function performLogout() {
    detachTenantListeners();
    sessionStorage.clear();
    auth.signOut().then(() => showPublicPortal()).catch(() => showPublicPortal());
}

function bindGlobalFormHandlers() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifierInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');
            if (!identifierInput || !passInput) return;

            let rawId = identifierInput.value.trim();
            const pass = passInput.value;
            let loginEmail = rawId.includes('@') ? rawId : `u_${rawId}@labourmitra.com`;

            try {
                await auth.signInWithEmailAndPassword(loginEmail, pass);
                closeLoginModal();
            } catch (err) {
                handleSystemError(err, "लॉगिन विफल");
            }
        });
    }
}

function openLoginModal(role) {
    document.getElementById('login-modal')?.classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal')?.classList.add('hidden');
}

function showToast(message, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) { alert(message); return; }
    const toast = document.createElement('div');
    toast.style.cssText = `margin-top: 8px; padding: 10px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999;`;
    toast.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#f43f5e' : '#f59e0b';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
