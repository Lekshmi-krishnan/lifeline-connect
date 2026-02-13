import { auth, db } from './firebase-config';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "service_xhcpl1f";
const EMAILJS_TEMPLATE_ID = "template_d9bdco6";
const EMAILJS_PUBLIC_KEY = "3_A8ZkiHVt-fH9qG9";

// Mock OTP Generator
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// We will keep state in the component now for "currentOTP", or pass it around.
// But valid approach for this migration is to return the OTP and let the component handle it.
// However, the original code used global variables. To avoid refactoring TOO much logic,
// let's keep it simple: functions return the OTP, and the component stores it.

// Helper to send email
async function sendOTPEmail(email, name, otp) {
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_name: name || "User",
            otp: otp,
            // Sending multiple variations to catch whatever variable the template uses
            to_email: email,
            user_email: email,
            email: email,
            recipient: email
        }, EMAILJS_PUBLIC_KEY);

        console.log("Email sent successfully!");
        return true;
    } catch (error) {
        console.error("Failed to send email:", error);
        // Fallback
        alert(`MOCK OTP (Email Failed): ${otp}`);
        return false;
    }
}

// Register
export async function initiateRegister(userData) {
    // 1. Check if user exists
    const docRef = doc(db, "users", userData.email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        throw new Error("User with this email already exists. Please login.");
    }

    // 2. Generate OTP
    const otp = generateOTP();

    // 3. Send Email
    await sendOTPEmail(userData.email, userData.name, otp);

    return otp; // Return OTP to the component to store in state
}

// Login
export async function initiateLogin(email) {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error("No account found with this email. Please register.");
    }

    const userData = docSnap.data();

    // Generate OTP
    const otp = generateOTP();

    // Send Email
    await sendOTPEmail(email, userData.name, otp);

    return otp;
}

// Verify
export async function verifyAndCompleteAuth(email, userDataIfRegister = null) {
    try {
        // REMOVED: signInAnonymously(auth)
        // We are skipping Firebase Auth interaction as per user request.
        // NOTE: Firestore Rules must be in Test Mode (allow read, write: if true;)

        // 2. Save Data if Registering
        if (userDataIfRegister) {
            // We can't use 'user.uid', so we use email as ID.
            // Saving without 'uid' field or using email as 'uid' placeholder if needed.
            await setDoc(doc(db, "users", email), {
                ...userDataIfRegister,
                uid: email, // Using email as mock UID
                createdAt: serverTimestamp()
            });
        }

        // 3. Local helper
        localStorage.setItem('userEmail', email);

        return true;
    } catch (error) {
        console.error("Auth Error:", error);
        throw new Error("Authentication failed: " + error.message);
    }
}
