document.addEventListener('DOMContentLoaded', async () => {
    try {
        const onIndex = document.getElementById('dynamic-index-categories') !== null;
        const onProducts = document.getElementById('portfolio-grid') !== null;

        // Fetch products, categories, and site settings concurrently for speed
        let [querySnapshot, catSnapshot, settingsSnapshot] = await Promise.all([
            db.collection("products").orderBy("createdAt", "desc").get(),
            db.collection("categories").get(),
            db.collection("siteSettings").doc("main").get()
        ]);

        if (settingsSnapshot.exists) {
            const settings = settingsSnapshot.data();

            // Apply Hero Settings if on Index
            if (onIndex) {
                if (settings.heroTitle) document.getElementById('dynamic-hero-title').innerHTML = settings.heroTitle;
                if (settings.heroSubtitle) document.getElementById('dynamic-hero-subtitle').innerHTML = settings.heroSubtitle;
            }

            // Save WA Number globally for main.js to use
            if (settings.waNumber) {
                window.globalWANumber = settings.waNumber;
                const contactWaEl = document.getElementById('dynamic-contact-wa');
                if (contactWaEl) {
                    contactWaEl.href = `https://wa.me/${settings.waNumber}`;
                    contactWaEl.innerText = "+" + settings.waNumber;
                }
            }
            if (settings.contactEmail) {
                const contactEmailEl = document.getElementById('dynamic-contact-email');
                if (contactEmailEl) {
                    contactEmailEl.href = `mailto:${settings.contactEmail}`;
                    contactEmailEl.innerText = settings.contactEmail;
                }
            }
        }

        window.appCategories = [];

        if (catSnapshot.empty) {
            // Seed default categories so the website doesn't break initially
            const defaultCats = [
                { id: "wedding", name: "Wedding Cards", subcategories: ["A4", "A5", "A6"], order: 1 },
                { id: "social", name: "Social Media", subcategories: [], order: 2 },
                { id: "packaging", name: "Cake Boxes", subcategories: [], order: 3 },
                { id: "business", name: "Business Cards", subcategories: [], order: 4 }
            ];

            const batch = db.batch();
            for (let cat of defaultCats) {
                const docRef = db.collection("categories").doc(cat.id);
                batch.set(docRef, {
                    name: cat.name,
                    subcategories: cat.subcategories,
                    order: cat.order,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                window.appCategories.push(cat);
            }
            await batch.commit();
        } else {
            catSnapshot.forEach(doc => window.appCategories.push({ id: doc.id, ...doc.data() }));            // Sort categories by order correctly
            window.appCategories.sort((a, b) => {
                let oA = a.order !== undefined ? parseInt(a.order) : 999;
                let oB = b.order !== undefined ? parseInt(b.order) : 999;
                if (oA !== oB) return oA - oB;
                return (a.name || "").localeCompare(b.name || "");
            });
        }

        // --- Categories UI Building ---

        // Dynamically build UI elements on all pages
        updateDynamicCategoryUI();

        // Dynamically build Index Sliders
        if (onIndex) {

            const indexContainer = document.getElementById('dynamic-index-categories');
            if (indexContainer) {
                let indexHtml = '';

                const getIcon = (id) => {
                    const icons = {
                        'wedding': 'bx-envelope',
                        'social': 'bx-share-nodes',
                        'packaging': 'bx-package',
                        'business': 'bx-briefcase'
                    };
                    return icons[id] || 'bx-category';
                };

                window.appCategories.forEach(cat => {
                    if (cat.isActive === false) return; // Skip inactive categories
                    if (cat.isFeatured === false) return; // Skip unfeatured categories from showing on Home screen

                    indexHtml += `
                    <section class="py-6 bg-transparent relative z-10 mb-8" id="dynamic-category-${cat.id}">
                        <div class="max-w-[100rem] mx-auto px-6">
                            <div class="flex items-center justify-between mb-4 pb-0">
                                <h3 class="text-[13px] md:text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <i class='bx ${getIcon(cat.id)} text-emerald-500 text-xl font-normal'></i> ${cat.name}
                                </h3>
                                <a href="products.html?filter=${cat.id}" class="text-[10px] font-black text-emerald-500 hover:text-slate-900 transition-colors uppercase tracking-widest border-b border-emerald-500/30">See All</a>
                            </div>
                            <div class="relative group/slider">
                                <div class="flex overflow-x-auto gap-4 md:gap-5 pb-6 pt-2 snap-x snap-mandatory custom-scrollbar" id="slider-${cat.id}">
                                    <!-- Dynamic items fetch below -->
                                </div>
                                <button class="slide-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-emerald-500 hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100">
                                    <i class='bx bx-chevron-left text-xl'></i>
                                </button>
                                <button class="slide-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-emerald-500 hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100">
                                    <i class='bx bx-chevron-right text-xl'></i>
                                </button>
                            </div>
                            <div class="h-[1px] bg-slate-100 w-full mt-2"></div>
                        </div>
                    </section>`;
                });
                indexContainer.innerHTML = indexHtml;

                // Re-bind slider controls
                setTimeout(() => {
                    const nextBtns = document.querySelectorAll('.slide-next');
                    const prevBtns = document.querySelectorAll('.slide-prev');

                    nextBtns.forEach(btn => {
                        btn.addEventListener('click', function (e) {
                            e.preventDefault();
                            const wrapper = this.closest('.group\\/slider');
                            if (wrapper) {
                                const slider = wrapper.querySelector('.custom-scrollbar');
                                if (slider) slider.scrollBy({ left: 250, behavior: 'smooth' });
                            }
                        });
                    });

                    prevBtns.forEach(btn => {
                        btn.addEventListener('click', function (e) {
                            e.preventDefault();
                            const wrapper = this.closest('.group\\/slider');
                            if (wrapper) {
                                const slider = wrapper.querySelector('.custom-scrollbar');
                                if (slider) slider.scrollBy({ left: -250, behavior: 'smooth' });
                            }
                        });
                    });
                }, 100);
            }
        }

        // Dynamically build Sidebar Filters if on products page
        if (onProducts) {
            const sidebarCategories = document.getElementById('sidebar-categories');
            if (sidebarCategories) {
                let html = `
                    <button data-filter="all" class="filter-btn sidebar-cat-btn group active-cat">
                        <span class="text-[11px] font-black uppercase tracking-widest pl-2">All Highlights</span>
                        <i class='bx bx-star text-sm'></i>
                    </button>
                    <div class="h-4"></div>
                `;
                window.appCategories.forEach(cat => {
                    if (cat.isActive === false) return;
                    html += `
                        <button data-filter="${cat.id}" class="filter-btn sidebar-cat-btn group">
                            <span class="text-[11px] font-black uppercase tracking-widest pl-2">${cat.name}</span>
                            <i class='bx bx-chevron-right text-lg opacity-0 group-hover:opacity-100 transition-all'></i>
                        </button>
                    `;
                    // If this category has subcategories, we could show them here too (as in mockup)
                    // But for now, let's keep it simple and dynamic based on the active category
                });
                sidebarCategories.innerHTML = html;
            }

            // Sync product count
            updateProductCount();

            // Setup Search
            const sidebarSearch = document.getElementById('sidebar-search');
            if (sidebarSearch) {
                sidebarSearch.addEventListener('input', (e) => {
                    filterProducts();
                });
            }
        }

        // --- Helper: Dynamic Categories UI Injection ---
        function updateDynamicCategoryUI() {
            const navDropdown = document.querySelector('.dropdown-menu');
            const checkboxContainer = document.getElementById('category-checkboxes');

            if (window.appCategories) {
                const activeCats = window.appCategories.filter(c => c.isActive !== false);

                // 1. Navbar Dropdown (Standard Nav)
                if (navDropdown) {
                    let navHtml = '';
                    activeCats.forEach(cat => {
                        navHtml += `
                        <a href="products.html?filter=${cat.id}"
                            class="px-4 py-2 text-[11px] text-slate-600 hover:bg-emerald-50 hover:text-emerald-500 rounded-lg transition-colors font-bold flex items-center gap-2">
                            <i class='bx bx-chevron-right text-base opacity-50'></i> ${cat.name}
                        </a>`;
                    });
                    navDropdown.innerHTML = navHtml;
                }

                // 2. Home Search Checkboxes
                if (checkboxContainer) {
                    let checkboxHtml = '';
                    activeCats.forEach(cat => {
                        checkboxHtml += `
                        <label class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group/item">
                            <div class="relative flex items-center">
                                <input type="checkbox" value="${cat.id}" class="category-checkbox peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:border-emerald-500 checked:bg-emerald-500 transition-all cursor-pointer">
                                <i class='bx bx-check absolute text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs transition-opacity'></i>
                            </div>
                            <span class="text-[11px] font-bold text-slate-500 group-hover/item:text-slate-800 transition-colors uppercase tracking-widest">${cat.name}</span>
                        </label>`;
                    });
                    checkboxContainer.innerHTML = checkboxHtml;

                    // Bind events for the newly added checkboxes
                    if (window.bindSearchCheckboxEvents) {
                        window.bindSearchCheckboxEvents();
                    }
                }
            }
        }

        function updateProductCount() {
            const visibleProducts = document.querySelectorAll('.portfolio-item:not(.hidden)');
            const countEl = document.getElementById('product-count');
            if (countEl) countEl.innerText = visibleProducts.length;
        }

        // --- Product Injection Logic ---
        let indexProductCounts = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Skip inactive products completely
            if (data.isActive === false) return;

            if (onProducts) {
                // --- Products Page Logic ---
                let sizeAttr = '';
                if (data.tag) {
                    sizeAttr = `data-size="${data.tag.toLowerCase().replace(/\s+/g, '-')}"`;
                }

                const envHtml = data.envPrice ? `<span class="text-[9px] font-bold text-emerald-500 mt-0.5 inline-block">+Rs. ${data.envPrice} for Envelope</span>` : '';

                const productHTML = `
                <div id="product-${data.code}" class="portfolio-item bg-white rounded-2xl overflow-hidden card-hover border border-stone-100 flex flex-col group shadow-sm hover:shadow-lg transition-all relative"
                    data-category="${data.category}" ${sizeAttr}>
                    <div class="relative aspect-[4/5] overflow-hidden product-image-container bg-stone-50/50 cursor-zoom-in">
                        <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                            <div class="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-emerald-500 transform scale-50 group-hover:scale-100 transition-all">
                                <i class='bx bx-plus text-xl'></i>
                            </div>
                        </div>
                        <img src="${data.imageUrl}" alt="${data.title}" class="w-full h-full object-contain p-2 relative z-0" loading="lazy" decoding="async">
                        <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm text-slate-500 z-20 pointer-events-none uppercase tracking-widest">
                            ${data.tag}</div>
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <div class="text-[9px] text-slate-400 mb-1 font-bold tracking-[0.2em] uppercase">${data.code}</div>
                        <h4 class="text-xs font-bold text-slate-800 mb-2 group-hover:text-emerald-500 transition-colors leading-tight line-clamp-2">
                            ${data.title}</h4>
                        <div class="mt-auto flex justify-between items-end pt-3 border-t border-slate-50">
                            <div class="flex flex-col">
                                <span class="text-slate-400 text-xs font-bold decoration-slate-200 line-through">Rs. ${data.oldPrice}</span>
                                <span class="text-emerald-500 font-black text-base leading-none mt-1">Rs. ${data.newPrice}</span>
                                ${envHtml}
                            </div>
                            <a href="https://wa.me/${window.globalWANumber || '94787354843'}" target="_blank"
                                class="bg-emerald-500 text-white font-black py-2 px-4 rounded-full hover:bg-slate-900 transition-all shadow-md text-[10px] uppercase tracking-widest relative z-30 whitespace-nowrap"
                                title="Buy Now">
                                Buy Now
                            </a>
                        </div>
                    </div>
                </div>`;

                document.getElementById('portfolio-grid').insertAdjacentHTML('afterbegin', productHTML);
            }

            if (onIndex) {
                // --- Index Page Logic ---
                if (data.isFeatured !== false) {
                    indexProductCounts[data.category] = (indexProductCounts[data.category] || 0) + 1;

                    if (indexProductCounts[data.category] <= 8) {
                        const sliderId = `slider-${data.category}`;
                        const slider = document.getElementById(sliderId);

                        if (slider) {
                            const envHtml = data.envPrice ? `<span class="text-[8px] font-bold text-emerald-500 mt-0.5 inline-block">+Rs. ${data.envPrice} for Env</span>` : '';

                            const indexHTML = `
                            <div class="min-w-[180px] w-[180px] sm:min-w-[220px] sm:w-[220px] md:min-w-[240px] md:w-[240px] snap-start bg-white rounded-2xl card-hover border border-stone-50 flex flex-col group shadow-sm hover:shadow-md transition-all relative p-4">
                                <div class="text-[9px] text-emerald-500 font-black mb-2 uppercase tracking-widest">${data.tag}</div>
                                <div class="relative aspect-[4/5] overflow-hidden product-image-container bg-stone-50/50 rounded-xl mb-4 shadow-inner">
                                    <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-zoom-in">
                                        <div class="w-9 h-9 bg-white shadow-xl rounded-full flex items-center justify-center text-emerald-500 transform scale-50 group-hover:scale-100 transition-all pointer-events-none">
                                            <i class='bx bx-expand-alt text-base'></i>
                                        </div>
                                    </div>
                                    <img src="${data.imageUrl}" alt="${data.title}" class="w-full h-full object-contain p-2 relative z-0" loading="lazy" decoding="async">
                                </div>
                                <div class="flex flex-col flex-grow">
                                    <div class="text-[9px] text-slate-400 mb-1 font-bold uppercase tracking-widest">${data.code}</div>
                                    <h4 class="text-[12px] font-bold text-slate-800 mb-2 group-hover:text-emerald-500 transition-colors leading-tight line-clamp-1">${data.title}</h4>
                                    <div class="mt-auto relative flex justify-between items-end">
                                        <div class="flex flex-col gap-0 w-4/5 pt-1">
                                            <span class="text-slate-400 font-bold text-xs line-through decoration-slate-200">Rs. ${data.oldPrice}</span>
                                            <span class="text-emerald-500 font-black text-base leading-none mt-1">Rs. ${data.newPrice}</span>
                                            ${envHtml}
                                        </div>
                                        <a href="https://wa.me/${window.globalWANumber || '94787354843'}" target="_blank" class="bg-emerald-500 text-white font-black py-1.5 px-3 rounded-full hover:bg-slate-900 transition-all shadow-md text-[9px] uppercase tracking-widest mb-1 relative z-30 whitespace-nowrap" title="Buy Now">
                                            Buy Now
                                        </a>
                                    </div>
                                </div>
                            </div>`;

                            slider.insertAdjacentHTML('afterbegin', indexHTML);
                        }
                    }
                }
            }
        });

        // Final UI Refinements
        if (onProducts && typeof setupProductsFilter !== 'undefined') {
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const filterParam = urlParams.get('filter') || 'all';
                setupProductsFilter(filterParam);

                const highlightCode = urlParams.get('highlight');
                if (highlightCode) {
                    setTimeout(() => {
                        const targetProduct = document.getElementById(`product-${highlightCode}`);
                        if (targetProduct) {
                            targetProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetProduct.classList.add('ring-2', 'ring-emerald-500', 'ring-opacity-50', 'transform', 'scale-[1.02]', 'transition-all');
                            setTimeout(() => {
                                targetProduct.classList.remove('ring-2', 'ring-emerald-500', 'ring-opacity-50', 'transform', 'scale-[1.02]');
                            }, 3000);
                        }
                    }, 500);
                }
            }, 100);
        }

    } catch (error) {
        console.log("Error loading content:", error.message);
    }
});
