// auth.js
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Check Login Status
function checkAuth(requiredRole) {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "index.html";
        } else {
            // Check database for role
            db.collection('users').doc(user.uid).get().then(doc => {
                const role = doc.data() ? doc.data().role : 'user';
                if (requiredRole && role !== requiredRole) {
                    alert("Unauthorized access");
                    window.location.href = "index.html";
                }
            });
        }
    });
}

function logout() {
    auth.signOut().then(() => window.location.href = "index.html");
}
