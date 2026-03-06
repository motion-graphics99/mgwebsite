// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_hdEdRCdFSni3YQiLAEBrbimG3pIPw9c",
    authDomain: "motion-graphics-lk.firebaseapp.com",
    projectId: "motion-graphics-lk",
    storageBucket: "motion-graphics-lk.firebasestorage.app",
    messagingSenderId: "1012677105608",
    appId: "1:1012677105608:web:ef7875ae7a859978c612fd",
    measurementId: "G-2K7KJ5FVFN"
};

// Initialize Firebase (Compat mode)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = typeof firebase.auth === 'function' ? firebase.auth() : null;
const db = typeof firebase.firestore === 'function' ? firebase.firestore() : null;
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;

// Enable Offline Persistence for Speed
if (db) {
    db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Persistence failed: Multiple tabs open');
            } else if (err.code == 'unimplemented') {
                console.warn('Persistence is not supported by this browser');
            }
        });
}
