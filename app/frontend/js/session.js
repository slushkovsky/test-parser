/* Utils for set/get/rest parsing session */

var SESSION_STORAGE_KEY = 'session';

function setSession(key) {
    localStorage.setItem(SESSION_STORAGE_KEY, key);
}

function getSession() {
    return localStorage.getItem(SESSION_STORAGE_KEY);
}

function resetSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}