// IMGBB Settings - We use this since Firebase Storage asked for pricing plan
const IMGBB_API_KEY = "eacdeaac5b786a6e996856ee1b4a5df5";

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const addProductForm = document.getElementById('add-product-form');
const productsTableBody = document.getElementById('products-table-body');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-product-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Auth State Listener
auth.onAuthStateChanged((user) => {
    loadingOverlay.classList.add('hidden');
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        adminSection.classList.add('flex');

        // Load initial products
        loadAdminProducts();
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
    const envPrice = document.getElementById('p-env-price').value;
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
            envPrice: envPrice || "",
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

        // Reload products list
        loadAdminProducts();

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

// Load Products for Admin Table
function loadAdminProducts() {
    productsTableBody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400">Loading products...</td></tr>';

    db.collection("products").orderBy("createdAt", "desc").get().then((querySnapshot) => {
        productsTableBody.innerHTML = '';
        if (querySnapshot.empty) {
            productsTableBody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400">No database products found.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');

            let envText = data.envPrice ? `<br><span class="text-xs text-brand-accent">Envelope: +Rs. ${data.envPrice}</span>` : '';

            tr.innerHTML = `
                <td class="py-3 px-4">
                    <img src="${data.imageUrl}" alt="Product" class="w-10 h-10 object-cover rounded-md border border-slate-200">
                </td>
                <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">${data.code}</div>
                    <div class="text-xs text-slate-500 truncate max-w-[150px]">${data.title}</div>
                </td>
                <td class="py-3 px-4 capitalize tracking-wide text-xs font-semibold">${data.category}</td>
                <td class="py-3 px-4">
                    <span class="text-xs text-slate-400 line-through">Rs. ${data.oldPrice}</span>
                    <span class="font-bold text-slate-900 ml-1">Rs. ${data.newPrice}</span>
                    ${envText}
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                    <button class="edit-btn p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" data-id="${doc.id}" data-price="${data.newPrice}" data-env="${data.envPrice || ''}" data-tag="${data.tag}">
                        <i class='bx bx-edit text-lg'></i>
                    </button>
                    <button class="delete-btn p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1 border border-transparent hover:border-red-100" data-id="${doc.id}">
                        <i class='bx bx-trash text-lg'></i>
                    </button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        // Attach action listeners
        attachTableActions();
    }).catch((error) => {
        console.error("Error loading products: ", error);
        productsTableBody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-red-500">Failed to load products.</td></tr>';
    });
}

// Table Button Actions (Edit / Delete)
function attachTableActions() {
    const editBtns = document.querySelectorAll('.edit-btn');
    const deleteBtns = document.querySelectorAll('.delete-btn');

    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const price = btn.getAttribute('data-price');
            const env = btn.getAttribute('data-env');
            const tag = btn.getAttribute('data-tag');

            document.getElementById('edit-id').value = id;
            document.getElementById('edit-price').value = price;
            document.getElementById('edit-env-price').value = env;
            document.getElementById('edit-tag').value = tag;

            editModal.classList.remove('hidden');
            editModal.classList.add('flex');
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm("Are you sure you want to delete this product from the database? This cannot be undone.")) {
                const id = btn.getAttribute('data-id');
                btn.innerHTML = '<div class="loader" style="width: 14px; height: 14px; border-width: 2px; border-top-color: #ef4444;"></div>';

                try {
                    await db.collection("products").doc(id).delete();
                    loadAdminProducts();
                } catch (error) {
                    console.error("Error removing document: ", error);
                    alert("Failed to delete product.");
                    loadAdminProducts(); /* reload to reset UI */
                }
            }
        });
    });
}

// Edit Modal Logic
cancelEditBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
});

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const newPrice = document.getElementById('edit-price').value;
    const envPrice = document.getElementById('edit-env-price').value;
    const tag = document.getElementById('edit-tag').value;

    const submitBtn = editForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    try {
        await db.collection("products").doc(id).update({
            newPrice: newPrice,
            envPrice: envPrice || "",
            tag: tag
        });

        editModal.classList.add('hidden');
        editModal.classList.remove('flex');
        loadAdminProducts();
    } catch (error) {
        console.error("Error updating product: ", error);
        alert("Failed to update product.");
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
