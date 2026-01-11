// auth.js
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isAdminMode = false;

function toggleAdminMode() {
    isAdminMode = !isAdminMode;
    const title = document.getElementById("form-title");
    const toggleBtn = document.getElementById("admin-toggle");
    
    if (isAdminMode) {
        title.innerText = "Admin Login";
        toggleBtn.innerText = "Switch to User Login";
        document.body.style.borderTop = "5px solid #e53935"; // Visual cue
    } else {
        title.innerText = "User Login";
        toggleBtn.innerText = "Switch to Admin Login";
        document.body.style.borderTop = "none";
    }
}

function handleLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            // Check if user is admin in Firestore
            checkUserRole(userCredential.user.uid);
        })
        .catch((error) => alert(error.message));
}

function handleSignup() {
    if (isAdminMode) {
        alert("Admins must be created manually in the database for security.");
        return;
    }
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, pass)
        .then((cred) => {
            // Create user profile in Firestore
            db.collection('users').doc(cred.user.uid).set({
                email: email,
                role: 'user'
            }).then(() => {
                window.location.href = "dashboard.html";
            });
        })
        .catch((error) => alert(error.message));
}

function checkUserRole(uid) {
    db.collection('users').doc(uid).get().then((doc) => {
        if (doc.exists) {
            const role = doc.data().role;
            if (role === 'admin' && isAdminMode) {
                window.location.href = "admin.html";
            } else if (role === 'user' && !isAdminMode) {
                window.location.href = "dashboard.html";
            } else {
                alert("Invalid role for this login portal.");
                auth.signOut();
            }
        } else {
            // Fallback for new users
            window.location.href = "dashboard.html";
        }
    });
}
