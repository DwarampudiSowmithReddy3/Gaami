// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAotbNcVVBpoGsbAOFi4PhvfO5nEHzRAvM",
    authDomain: "gaami-a0415.firebaseapp.com",
    projectId: "gaami-a0415",
    storageBucket: "gaami-a0415.appspot.com",
    messagingSenderId: "169708035371",
    appId: "1:169708035371:web:7ce6f9ca90c5a37992796e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded"); // Debug log

    // Get all required elements
    const authForm = document.getElementById("auth-form");
    const formTitle = document.getElementById("form-title");
    const toggleForm = document.getElementById("toggle-form");
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eye-icon");
    const loader = document.getElementById("loader");
    
    if (!authForm || !formTitle || !toggleForm || !passwordInput || !eyeIcon || !loader) {
        console.error("Some elements are missing!");
        return;
    }

    let isLogin = true;

    // Password visibility toggle
    eyeIcon.addEventListener("click", function() {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            eyeIcon.textContent = "👁️";
        }
    });

    // Toggle between login and signup
    toggleForm.querySelector("a").addEventListener("click", function(e) {
        e.preventDefault();
        isLogin = !isLogin;
        formTitle.textContent = isLogin ? "Login" : "Sign Up";
        toggleForm.innerHTML = isLogin 
            ? "Don't have an account? <a href='#'>Sign Up</a>"
            : "Already have an account? <a href='#'>Login</a>";
        
        // Clear form
        authForm.reset();
    });

    // Handle form submission
    authForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        console.log("Form submitted"); // Debug log
        
        const email = document.getElementById("username").value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        // Show loader
        loader.style.display = "block";
        authForm.style.opacity = "0.5";

        try {
            if (isLogin) {
                // Login
                console.log("Attempting login..."); // Debug log
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                console.log("Login successful");
                window.location.href = "gaami.html";
            } else {
                // Sign Up
                console.log("Attempting signup..."); // Debug log
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                console.log("Signup successful");
                alert("Account created successfully! Please login.");
                isLogin = true;
                formTitle.textContent = "Login";
                toggleForm.innerHTML = "Don't have an account? <a href='#'>Sign Up</a>";
                authForm.reset();
            }
        } catch (error) {
            console.error("Error:", error);
            let message = "An error occurred. Please try again.";
            
            switch (error.code) {
                case 'auth/user-not-found':
                    message = "No account found with this email.";
                    break;
                case 'auth/wrong-password':
                    message = "Incorrect password.";
                    break;
                case 'auth/email-already-in-use':
                    message = "An account already exists with this email.";
                    break;
                case 'auth/weak-password':
                    message = "Password should be at least 6 characters.";
                    break;
                case 'auth/invalid-email':
                    message = "Please enter a valid email address.";
                    break;
            }
            alert(message);
        } finally {
            // Hide loader
            loader.style.display = "none";
            authForm.style.opacity = "1";
        }
    });

    // Handle forgot password
    document.getElementById("forgot-password").addEventListener("click", async function(e) {
        e.preventDefault();
        const email = document.getElementById("username").value;
        
        if (!email) {
            const inputEmail = prompt("Please enter your email address:");
            if (!inputEmail) return;
            
            try {
                await auth.sendPasswordResetEmail(inputEmail);
                alert("Password reset email sent! Check your inbox.");
            } catch (error) {
                console.error("Error:", error);
                alert("Error: " + error.message);
            }
        } else {
            try {
                await auth.sendPasswordResetEmail(email);
                alert("Password reset email sent! Check your inbox.");
            } catch (error) {
                console.error("Error:", error);
                alert("Error: " + error.message);
            }
        }
    });

    // Initial loader
    setTimeout(() => {
        loader.style.display = "none";
        document.querySelector(".container").style.display = "block";
    }, 1000);
});
