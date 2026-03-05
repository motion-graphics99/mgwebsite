// IMGBB Settings - We use this since Firebase Storage asked for pricing plan
const IMGBB_API_KEY = "eacdeaac5b786a6e996856ee1b4a5df5";

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const addProductForm = document.getElementById('add-product-form');

// Auth State Listener
auth.onAuthStateChanged((user) => {
    loadingOverlay.classList.add('hidden');
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        adminSection.classList.add('flex');
    } else {
        // No user is signed in
        loginSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
        adminSection.classList.remove('flex');
    }
});

// Login Logic
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const btnText = document.getElementById('login-btn-text');
    const spinner = document.getElementById('login-spinner');

    errorMsg.classList.add('hidden');
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the UI switch
    } catch (error) {
        const errorCode = error.code ? error.code : 'unknown';
        errorMsg.textContent = `Login failed: ${error.message || 'Please check your credentials.'}`;
        errorMsg.classList.remove('hidden');
    } finally {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});

// Logout Logic
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Add Product Logic
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('p-title').value;
    const code = document.getElementById('p-code').value.toUpperCase();
    const oldPrice = document.getElementById('p-old-price').value;
    const newPrice = document.getElementById('p-new-price').value;
    const category = document.getElementById('p-category').value;
    const tag = document.getElementById('p-tag').value;
    const fileInput = document.getElementById('p-image');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image");
        return;
    }

    const submitBtnBase = document.getElementById('submit-btn');
    const btnText = document.getElementById('submit-btn-text');
    const spinner = document.getElementById('submit-spinner');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress');
    const msg = document.getElementById('form-message');

    // UI Reset
    submitBtnBase.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    msg.classList.add('hidden');
    msg.classList.remove('text-red-500', 'text-brand-accent');

    try {
        // 1. Upload Image to ImgBB (Free, No Credit Card needed)
        progressBar.style.width = '30%';
        msg.textContent = "Uploading image...";
        msg.classList.remove('hidden');

        const formData = new FormData();
        formData.append('image', file);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const imgbbData = await imgbbResponse.json();

        if (!imgbbData.success) {
            throw new Error("ImgBB Upload Failed: " + (imgbbData.error ? imgbbData.error.message : "Unknown error"));
        }

        const downloadURL = imgbbData.data.url;
        progressBar.style.width = '70%';
        msg.textContent = "Saving product data...";

        // 2. Save Data to Firestore (Database is still free)
        await db.collection("products").add({
            title: title,
            code: code,
            oldPrice: oldPrice,
            newPrice: newPrice,
            category: category,
            tag: tag,
            imageUrl: downloadURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        progressBar.style.width = '100%';

        // Success UI
        msg.textContent = "Product added successfully!";
        msg.classList.add('text-brand-accent');
        msg.classList.remove('hidden');
        addProductForm.reset();
        document.getElementById('file-name').classList.add('hidden');

        // Reset states
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            msg.classList.add('hidden');
        }, 3000);

        submitBtnBase.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');

    } catch (error) {
        console.error("Error adding product: ", error);
        msg.textContent = "Failed to add product: " + error.message;
        msg.classList.add('text-red-500');
        msg.classList.remove('hidden');
        progressContainer.classList.add('hidden');

        submitBtnBase.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});
