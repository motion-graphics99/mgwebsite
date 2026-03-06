// IMGBB Settings
const IMGBB_API_KEY = "eacdeaac5b786a6e996856ee1b4a5df5";

// Auth elements
const loadingOverlay = document.getElementById('loading-overlay');
const loginSection = document.getElementById('login-section');
const adminApp = document.getElementById('admin-app');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

// View Switching
const sidebarNav = document.getElementById('sidebar-nav');
const views = document.querySelectorAll('.view-section');

// State
let globalCategories = [];
let globalProducts = [];

// ===================================
// UTILS & UI
// ===================================

function openModal(id) {
    const modal = document.getElementById(id);
    const content = modal.querySelector('div:first-child');
    modal.classList.remove('hidden');
    // small delay to allow reflow for animation
    setTimeout(() => {
        modal.classList.add('opacity-100');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    const content = modal.querySelector('div:first-child');
    modal.classList.remove('opacity-100');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');

    // reset forms attached if any
    const form = modal.querySelector('form');
    if (form) form.reset();

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function switchView(viewName) {
    // Topbar update
    const titles = {
        'dashboard': 'Overview',
        'products': 'Manage Products',
        'categories': 'Categories Setup'
    };
    document.getElementById('topbar-title').innerText = titles[viewName] || 'Overview';

    // Hide all
    views.forEach(v => {
        v.classList.remove('block');
        v.classList.add('hidden');
    });

    // Sidebar active class
    const links = sidebarNav.querySelectorAll('a');
    links.forEach(l => l.classList.remove('active'));
    const targetLink = sidebarNav.querySelector(`[data-view="${viewName}"]`);
    if (targetLink) targetLink.classList.add('active');

    // Show target
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('block');
    }
}

// Attach View switcher
sidebarNav.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.dataset.view) {
        e.preventDefault();
        switchView(link.dataset.view);
    }
});

// Update file name display
const imageInput = document.getElementById('p-image');
if (imageInput) {
    imageInput.addEventListener('change', function (e) {
        const fileName = document.getElementById('file-name');
        if (this.files[0]) {
            fileName.textContent = this.files[0].name;
            fileName.classList.remove('hidden');
        } else {
            fileName.classList.add('hidden');
        }
    });
}

// ===================================
// AUTHENTICATION
// ===================================

auth.onAuthStateChanged((user) => {
    loadingOverlay.classList.add('hidden');
    if (user) {
        // Logged In
        loginSection.classList.add('hidden');
        adminApp.classList.remove('hidden');
        switchView('dashboard');

        // Initial Fetch
        fetchData();
    } else {
        // Logged Out
        loginSection.classList.remove('hidden');
        adminApp.classList.add('hidden');
    }
});

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
    } catch (error) {
        errorMsg.textContent = `Login failed: ${error.message}`;
        errorMsg.classList.remove('hidden');
    } finally {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// ===================================
// DATA FETCHING & RENDERING
// ===================================

async function fetchData() {
    try {
        const [catSnap, prodSnap] = await Promise.all([
            db.collection("categories").get(),
            db.collection("products").orderBy("createdAt", "desc").get()
        ]);

        globalCategories = [];
        catSnap.forEach(doc => globalCategories.push({ docId: doc.id, ...doc.data() }));
        // Sort
        globalCategories.sort((a, b) => (parseInt(a.order) || 999) - (parseInt(b.order) || 999));

        globalProducts = [];
        prodSnap.forEach(doc => globalProducts.push({ docId: doc.id, ...doc.data() }));

        renderDashboardStats();
        renderCategories();
        renderProducts();
        populateCategoryDropdown();
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to sync database. Check console for details.");
    }
}

function renderDashboardStats() {
    document.getElementById('stat-products').innerText = globalProducts.length;
    document.getElementById('stat-categories').innerText = globalCategories.length;
}

function getCategoryName(id) {
    const cat = globalCategories.find(c => c.docId === id);
    return cat ? cat.name : `<span class="italic text-slate-400">Unknown</span>`;
}

function populateCategoryDropdown() {
    const dropdown = document.getElementById('p-category');
    dropdown.innerHTML = '';
    globalCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.docId;
        opt.textContent = cat.name;
        dropdown.appendChild(opt);
    });
}

// Add manually missing products from the website
window.seedMissingProducts = async function () {
    if (!confirm("This will import all missing default products from the website to the database. Proceed?")) return;

    const defaultProducts = [
        { title: "Soft Pattern Invite", code: "WCA602", oldPrice: "60", newPrice: "40", envPrice: "45", category: "wedding", subcategory: "A6", tag: "A6 Size", isFeatured: true, imageUrl: "assets/img/wca601.jpg" },
        { title: "Dark Floral Invite", code: "WCA601", oldPrice: "60", newPrice: "40", envPrice: "45", category: "wedding", subcategory: "A6", tag: "A6 Size", isFeatured: true, imageUrl: "assets/img/wca602_new.jpg" },
        { title: "Green Botanical Invite", code: "WCA501", oldPrice: "75", newPrice: "55", envPrice: "45", category: "wedding", subcategory: "A5", tag: "A5 Size", isFeatured: true, imageUrl: "assets/img/wca501.jpg" },
        { title: "Blue Floral Invite", code: "WCA502", oldPrice: "75", newPrice: "55", envPrice: "45", category: "wedding", subcategory: "A5", tag: "A5 Size", isFeatured: true, imageUrl: "assets/img/wca502.jpg" },
        { title: "Gold Mandala Invite", code: "WCA503", oldPrice: "75", newPrice: "55", envPrice: "45", category: "wedding", subcategory: "A5", tag: "A5 Size", isFeatured: true, imageUrl: "assets/img/wca503.jpg" },
        { title: "Soft Blue Pattern Invite", code: "WCA504", oldPrice: "75", newPrice: "55", envPrice: "45", category: "wedding", subcategory: "A5", tag: "A5 Size", isFeatured: true, imageUrl: "assets/img/wca504.jpg" },

        { title: "Educational Diploma Poster", code: "SM-P01", oldPrice: "1500", newPrice: "1000", envPrice: "", category: "social", subcategory: "Promo", tag: "Promo", isFeatured: true, imageUrl: "assets/img/sm1.jpg" },
        { title: "Tournament Flier", code: "SM-P02", oldPrice: "1500", newPrice: "1000", envPrice: "", category: "social", subcategory: "Promo", tag: "Promo", isFeatured: true, imageUrl: "assets/img/sm2.png" },
        { title: "Poson Banner Horizontal", code: "SM-P03", oldPrice: "1500", newPrice: "1000", envPrice: "", category: "social", subcategory: "Promo", tag: "Promo", isFeatured: true, imageUrl: "assets/img/sm3.jpg" },
        { title: "Dansala Banner Horizontal", code: "SM-P04", oldPrice: "1500", newPrice: "1000", envPrice: "", category: "social", subcategory: "Promo", tag: "Promo", isFeatured: true, imageUrl: "assets/img/sm4.jpg" },
        { title: "Educational Post Vertical", code: "SM-P05", oldPrice: "1500", newPrice: "1000", envPrice: "", category: "social", subcategory: "Promo", tag: "Promo", isFeatured: true, imageUrl: "assets/img/sm5.jpg" }
    ];

    try {
        let addedCount = 0;
        for (let prod of defaultProducts) {
            // check if product code exists to avoid duplicates
            if (!globalProducts.some(p => p.code === prod.code)) {
                await db.collection("products").add({
                    ...prod,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                addedCount++;
            }
        }
        if (addedCount > 0) {
            alert(`Successfully imported ${addedCount} new products!`);
            fetchData(); // Reload UI
        } else {
            alert("No missing website products found. Database is already up to date.");
        }
    } catch (e) {
        alert("Error importing products: " + e.message);
    }
}

function renderProducts() {
    const tbody = document.getElementById('products-table-body');
    if (globalProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-slate-400 font-medium">No products found. Add one above!</td></tr>`;
        return;
    }

    let html = '';
    globalProducts.forEach((p) => {
        const dateStr = p.createdAt ? p.createdAt.toDate().toLocaleDateString() : 'N/A';
        const envCode = p.envPrice ? `<br><span class="text-[10px] text-brand-accent">+Rs.${p.envPrice} Env</span>` : '';

        html += `
        <tr class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                    <img src="${p.imageUrl}" class="w-12 h-12 rounded-lg object-cover border border-slate-200">
                    <div>
                        <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">${p.code}</div>
                        <div class="font-bold text-slate-800 line-clamp-1">${p.title}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-xs text-slate-400 line-through">Rs. ${p.oldPrice}</div>
                <div class="font-black text-slate-800">Rs. ${p.newPrice}</div>
                ${envCode}
            </td>
            <td class="px-6 py-4">
                <div class="font-bold text-slate-700">${getCategoryName(p.category)}</div>
            </td>
            <td class="px-6 py-4">
                <div class="font-bold text-sm text-slate-700">${p.subcategory || '<span class="italic text-slate-400 text-xs font-normal">None</span>'}</div>
                <div class="inline-block mt-1 bg-slate-100 border border-slate-200 shadow-sm text-[10px] font-bold px-2 py-0.5 rounded text-slate-500">${p.tag}</div>
            </td>
            <td class="px-6 py-4 text-center text-slate-500 text-sm font-medium">
                ${dateStr}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onclick="openProductModal('edit', '${p.docId}')" class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                        <i class='bx bx-edit text-xl'></i>
                    </button>
                    <button onclick="deleteProduct('${p.docId}')" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                        <i class='bx bx-trash text-xl'></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function renderCategories() {
    const tbody = document.getElementById('categories-table-body');
    if (globalCategories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-12 text-center text-slate-400 font-medium">No categories found.</td></tr>`;
        return;
    }

    let html = '';
    globalCategories.forEach((c) => {
        let subsList = Array.isArray(c.subcategories) ? c.subcategories.join(', ') : '';
        html += `
        <tr class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                    ${c.order || '-'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-[10px] text-slate-400 font-bold tracking-wider">${c.docId}</div>
                <div class="font-bold text-slate-800">${c.name}</div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-500">
                ${subsList ? subsList : '<span class="italic text-slate-300">None</span>'}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onclick="openCategoryModal('edit', '${c.docId}')" class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                        <i class='bx bx-edit text-xl'></i>
                    </button>
                    <button onclick="deleteCategory('${c.docId}')" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                        <i class='bx bx-trash text-xl'></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

// ===================================
// PRODUCT CRUD LOGIC
// ===================================

function openProductModal(action, docId = null) {
    const form = document.getElementById('form-product');
    const title = document.getElementById('modal-product-title');
    const actionInput = document.getElementById('p-action');
    const idInput = document.getElementById('p-id');
    const imgWrapper = document.getElementById('image-upload-wrapper');
    const previewWrapper = document.getElementById('image-preview-wrapper');

    // Reset
    form.reset();
    document.getElementById('file-name').classList.add('hidden');
    document.getElementById('product-progress-wrapper').classList.add('hidden');
    document.getElementById('product-msg').textContent = '';

    actionInput.value = action;

    let currentProd = null;

    if (action === 'add') {
        title.innerText = "Add New Product";
        idInput.value = "";
        imgWrapper.classList.remove('hidden');
        previewWrapper.classList.add('hidden');
        document.getElementById('p-image').required = true;
        document.getElementById('p-featured').checked = false;
    } else {
        title.innerText = "Edit Product";
        currentProd = globalProducts.find(p => p.docId === docId);
        if (!currentProd) return;

        idInput.value = docId;
        document.getElementById('p-title').value = currentProd.title;
        document.getElementById('p-code').value = currentProd.code;
        document.getElementById('p-old-price').value = currentProd.oldPrice;
        document.getElementById('p-new-price').value = currentProd.newPrice;
        document.getElementById('p-env-price').value = currentProd.envPrice || '';
        document.getElementById('p-category').value = currentProd.category;
        document.getElementById('p-tag').value = currentProd.tag;
        document.getElementById('p-featured').checked = currentProd.isFeatured || false;

        // Handle images
        document.getElementById('p-image').required = false;
        imgWrapper.classList.add('hidden'); // Simplified: editing keeps old image.
        previewWrapper.classList.remove('hidden');
        document.getElementById('p-image-preview').src = currentProd.imageUrl;
    }

    openModal('modal-product');

    // Trigger category change to populate subcategories
    document.getElementById('p-category').dispatchEvent(new Event('change'));
    if (action === 'edit' && currentProd) {
        document.getElementById('p-subcategory').value = currentProd.subcategory || '';
    }
}

// Category change listener for updating subcategories
document.getElementById('p-category').addEventListener('change', (e) => {
    const catId = e.target.value;
    const subcatSelect = document.getElementById('p-subcategory');
    const subcatContainer = document.getElementById('subcat-container');

    subcatSelect.innerHTML = '<option value="">-- None --</option>';

    const cat = globalCategories.find(c => c.docId === catId);
    if (cat && Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
        cat.subcategories.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            subcatSelect.appendChild(opt);
        });
        subcatContainer.classList.remove('opacity-50', 'pointer-events-none');
    } else {
        subcatContainer.classList.add('opacity-50', 'pointer-events-none');
    }
});

document.getElementById('form-product').addEventListener('submit', async (e) => {
    e.preventDefault();

    const action = document.getElementById('p-action').value;
    const docId = document.getElementById('p-id').value;

    const title = document.getElementById('p-title').value;
    const code = document.getElementById('p-code').value.toUpperCase();
    const oldPrice = document.getElementById('p-old-price').value;
    const newPrice = document.getElementById('p-new-price').value;
    const envPrice = document.getElementById('p-env-price').value;
    const category = document.getElementById('p-category').value;
    const subcategory = document.getElementById('p-subcategory').value;
    const tag = document.getElementById('p-tag').value;
    const isFeatured = document.getElementById('p-featured').checked;

    const btnBase = document.getElementById('btn-save-product');
    const btnText = document.getElementById('text-save-product');
    const spinner = document.getElementById('spinner-save-product');
    const progWrap = document.getElementById('product-progress-wrapper');
    const progBar = document.getElementById('product-progress-bar');
    const msg = document.getElementById('product-msg');

    // UI State
    btnBase.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    progWrap.classList.remove('hidden');
    progBar.style.width = '10%';
    msg.textContent = 'Processing...';

    try {
        let imageUrl = "";

        if (action === 'add') {
            const fileInput = document.getElementById('p-image');
            const file = fileInput.files[0];
            if (!file) throw new Error("Please select an image.");

            // Upload Image
            progBar.style.width = '30%';
            msg.textContent = "Uploading image to secure host...";

            const formData = new FormData();
            formData.append('image', file);

            const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
            const imgbbData = await imgbbResponse.json();

            if (!imgbbData.success) {
                throw new Error("Image Upload Failed: " + (imgbbData.error ? imgbbData.error.message : "Unknown error"));
            }

            imageUrl = imgbbData.data.url;
            progBar.style.width = '70%';
            msg.textContent = "Saving to database...";

            // Create
            await db.collection("products").add({
                title, code, oldPrice, newPrice,
                envPrice: envPrice || "", category, subcategory, tag, isFeatured: Boolean(isFeatured), imageUrl,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        } else if (action === 'edit') {
            progBar.style.width = '50%';
            msg.textContent = "Updating database...";

            await db.collection("products").doc(docId).update({
                title, code, oldPrice, newPrice,
                envPrice: envPrice || "", category, subcategory, tag, isFeatured: Boolean(isFeatured),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        progBar.style.width = '100%';
        msg.textContent = "Successfully saved!";

        setTimeout(() => {
            closeModal('modal-product');
            fetchData(); // Reload UI
        }, 1000);

    } catch (e) {
        msg.textContent = e.message;
        console.error(e);
    } finally {
        btnBase.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
        await db.collection("products").doc(id).delete();
        fetchData();
    } catch (e) {
        alert("Failed to delete product: " + e.message);
    }
}

// ===================================
// CATEGORY CRUD LOGIC
// ===================================

function openCategoryModal(action, docId = null) {
    const form = document.getElementById('form-category');
    const title = document.getElementById('modal-category-title');
    const actionInput = document.getElementById('c-action');
    const idInput = document.getElementById('c-id');
    const origId = document.getElementById('c-original-id');
    const msg = document.getElementById('cat-msg');

    form.reset();
    msg.classList.add('hidden');
    actionInput.value = action;

    if (action === 'add') {
        title.innerText = "Add New Category";
        idInput.value = "";
        origId.value = "";
        idInput.readOnly = false;
        idInput.classList.remove('bg-slate-100', 'text-slate-500');
    } else {
        title.innerText = "Edit Category";
        const cat = globalCategories.find(c => c.docId === docId);
        if (!cat) return;

        idInput.value = docId;
        origId.value = docId;
        // Do not allow changing ID easily to prevent orphan products
        idInput.readOnly = true;
        idInput.classList.add('bg-slate-100', 'text-slate-500');

        document.getElementById('c-name').value = cat.name;
        document.getElementById('c-order').value = cat.order || "1";
        document.getElementById('c-subs').value = Array.isArray(cat.subcategories) ? cat.subcategories.join(', ') : "";
    }

    openModal('modal-category');
}

document.getElementById('form-category').addEventListener('submit', async (e) => {
    e.preventDefault();

    const action = document.getElementById('c-action').value;
    const docId = document.getElementById('c-id').value.trim();
    const origId = document.getElementById('c-original-id').value;
    const name = document.getElementById('c-name').value.trim();
    const order = parseInt(document.getElementById('c-order').value) || 1;
    const subsRaw = document.getElementById('c-subs').value;

    const subcategories = subsRaw ? subsRaw.split(',').map(s => s.trim()).filter(s => s !== "") : [];

    const btnBase = document.getElementById('btn-save-category');
    const btnText = document.getElementById('text-save-category');
    const spinner = document.getElementById('spinner-save-category');
    const msg = document.getElementById('cat-msg');

    btnBase.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    msg.classList.add('hidden');

    try {
        if (action === 'add') {
            // Check if ID exists
            const existing = await db.collection("categories").doc(docId).get();
            if (existing.exists) throw new Error("Category ID already exists!");

            await db.collection("categories").doc(docId).set({
                name, subcategories, order,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update
            await db.collection("categories").doc(docId).update({
                name, subcategories, order,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        closeModal('modal-category');
        fetchData(); // Reload UI

    } catch (e) {
        msg.textContent = e.message;
        msg.classList.remove('hidden');
        console.error(e);
    } finally {
        btnBase.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});

async function deleteCategory(id) {
    if (!confirm(`WARNING: Deleting category '${id}' might leave orphan products. Are you absolutely sure?`)) return;
    try {
        await db.collection("categories").doc(id).delete();
        fetchData();
    } catch (e) {
        alert("Failed to delete category: " + e.message);
    }
}
