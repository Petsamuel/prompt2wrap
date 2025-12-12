import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Expiry duration: 48 hours in milliseconds
const EXPIRY_HOURS = 48;
const EXPIRY_MS = EXPIRY_HOURS * 60 * 60 * 1000;

/**
 * Silently authenticates the user anonymously.
 * Required for writing to Firestore.
 */
async function ensureAuth() {
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
            console.log('Signed in anonymously:', auth.currentUser.uid);
        } catch (error) {
            console.error('Anonymous auth failed:', error);
            throw error;
        }
    }
    return auth.currentUser;
}

/**
 * Saves the wrapped result to Firestore with 48hr expiry.
 * @param {Object} data - The JSON result from the analysis
 * @returns {Promise<string>} - The document ID
 */
export async function saveWrapped(data) {
    try {
        const user = await ensureAuth();
        const now = Date.now();
        const expiresAt = Timestamp.fromDate(new Date(now + EXPIRY_MS));
        
        const docRef = await addDoc(collection(db, "wrapped_results"), {
            content: data,
            uid: user.uid,
            createdAt: serverTimestamp(),
            expiresAt: expiresAt, // 48 hours from now
            expired: false // Will be true after 48hrs (checked on read)
        });
        return docRef.id;
    } catch (e) {
        console.error("Error saving wrapped data: ", e);
        throw e;
    }
}

/**
 * Fetches the wrapped result from Firestore by ID.
 * No auth required for reads (public access).
 * Checks if the link has expired.
 * @param {string} id - The document ID
 * @returns {Promise<Object|null>} - The wrapped data or null if not found/expired
 */
export async function getWrapped(id) {
    try {
        // No auth needed for reads (public access via Firestore rules)
        const docRef = doc(db, "wrapped_results", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Check if expired
            if (data.expiresAt) {
                const expiryDate = data.expiresAt.toDate();
                if (new Date() > expiryDate) {
                    console.log("This wrapped link has expired.");
                    return null; // Treat as not found
                }
            }
            
            return data.content;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting wrapped document:", e);
        throw e;
    }
}
