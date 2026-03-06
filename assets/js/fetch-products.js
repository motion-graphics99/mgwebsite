document.addEventListener('DOMContentLoaded', async () => {
    try {
        const onIndex = document.getElementById('dynamic-index-categories') !== null;
        const onProducts = document.getElementById('portfolio-grid') !== null;

        // Fetch products and categories concurrently for speed
        let [querySnapshot, catSnapshot] = await Promise.all([
            db.collection("products").orderBy("createdAt", "desc").get(),
            db.collection("categories").get()
        ]);

        if (querySnapshot.empty) {
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

            const batch = db.batch();
            defaultProducts.forEach(prod => {
                const docRef = db.collection("products").doc();
                batch.set(docRef, { ...prod, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            });
            await batch.commit();

            // Refetch after seeding
            querySnapshot = await db.collection("products").orderBy("createdAt", "desc").get();
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
                        'business': 'bxs-business'
                    };
                    return icons[id] || 'bx-category';
                };

                window.appCategories.forEach(cat => {
                    if (cat.isActive === false) return; // Skip inactive categories
                    if (cat.isFeatured === false) return; // Skip unfeatured categories from showing on Home screen

                    indexHtml += `
                    <section class="py-6 bg-transparent relative z-10 mb-8" id="dynamic-category-${cat.id}">
                        <div class="max-w-[100rem] mx-auto">
                            <div class="flex items-center justify-between mb-4 pb-0">
                                <h3 class="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                    <i class='bx ${getIcon(cat.id)} text-brand-accent text-3xl font-normal'></i> ${cat.name}
                                </h3>
                                <a href="products.html?filter=${cat.id}" class="text-sm font-bold text-brand-accent hover:text-slate-900 transition-colors">See All</a>
                            </div>
                            <div class="relative group/slider">
                                <div class="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 snap-x snap-mandatory custom-scrollbar" id="slider-${cat.id}">
                                    <!-- Dynamic items fetch below -->
                                </div>
                                <button class="slide-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100">
                                    <i class='bx bx-chevron-left text-3xl'></i>
                                </button>
                                <button class="slide-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100">
                                    <i class='bx bx-chevron-right text-3xl'></i>
                                </button>
                            </div>
                            <div class="h-[3px] bg-slate-200/60 w-full mt-2 rounded-full"></div>
                        </div>
                    </section>`;
                });
                indexContainer.innerHTML = indexHtml;

                // Re-bind slider controls for newly added
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
            const sidebar = document.querySelector('#portfolio-filters .flex.lg\\:flex-col');
            if (sidebar) {
                let html = `
                    <button data-filter="all" class="filter-btn filter-sidebar-item w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex justify-between items-center group whitespace-nowrap active-filter">
                        All Works
                        <i class='bx bx-chevron-right opacity-0 group-hover:opacity-100 transition-opacity'></i>
                    </button>
                `;
                window.appCategories.forEach(cat => {
                    if (cat.isActive === false) return; // Skip inactive categories
                    html += `
                        <button data-filter="${cat.id}" class="filter-btn filter-sidebar-item w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex justify-between items-center group whitespace-nowrap">
                            ${cat.name}
                            <i class='bx bx-chevron-right opacity-0 group-hover:opacity-100 transition-opacity'></i>
                        </button>
                    `;
                });
                sidebar.innerHTML = html;
            }
        } let indexProductCounts = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Skip inactive products completely
            if (data.isActive === false) return;

            if (onProducts) {
                // --- Products Page Logic ---
                let sizeAttr = '';
                // Dynamic sizing attribute logic if it's subcategory match
                if (data.tag) {
                    sizeAttr = `data-size="${data.tag.toLowerCase().replace(/\s+/g, '-')}"`;
                }

                const envHtml = data.envPrice ? `<span class="text-[10px] font-bold text-brand-accent mt-0.5 inline-block">+Rs. ${data.envPrice} for Envelope</span>` : '';

                const productHTML = `
                <div id="product-${data.code}" class="portfolio-item bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden card-hover border border-white flex flex-col group shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative"
                    data-category="${data.category}" ${sizeAttr}>
                    <div class="relative aspect-[4/5] overflow-hidden product-image-container bg-slate-50/50 cursor-zoom-in">
                        <div class="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                            <div class="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 shadow-lg transform scale-50 group-hover:scale-100 transition-all">
                                <i class='bx bx-search-alt-2 text-2xl'></i>
                            </div>
                        </div>
                        <img src="${data.imageUrl}" alt="${data.title}" class="w-full h-full object-contain p-2 relative z-0">
                        <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full shadow-sm text-slate-700 z-20 pointer-events-none">
                            ${data.tag}</div>
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                        <div class="text-[10px] text-slate-400 mb-1 font-bold tracking-wider uppercase">${data.code}</div>
                        <h4 class="text-base font-bold text-slate-900 mb-2 group-hover:text-brand-accent transition-colors leading-tight line-clamp-2">
                            ${data.title}</h4>
                        <div class="mt-auto flex justify-between items-end pt-3 border-t border-slate-100/50">
                            <div class="flex flex-col">
                                <span class="text-slate-400 text-[10px] font-bold decoration-slate-300 line-through">Rs. ${data.oldPrice}</span>
                                <span class="text-brand-accent font-black text-xl leading-none mt-1">Rs. ${data.newPrice}</span>
                                ${envHtml}
                            </div>
                            <a href="https://wa.me/94787354843" target="_blank"
                                class="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all shadow-sm group/btn relative z-30"
                                title="Buy Now">
                                <i class='bx bx-shopping-bag text-xl group-hover/btn:scale-110 transition-transform'></i>
                            </a>
                        </div>
                    </div>
                </div>`;

                document.getElementById('portfolio-grid').insertAdjacentHTML('afterbegin', productHTML);
            } if (onIndex) {
                // --- Index Page Logic ---
                if (data.isFeatured !== false) {
                    indexProductCounts[data.category] = (indexProductCounts[data.category] || 0) + 1;

                    if (indexProductCounts[data.category] <= 5) {
                        const sliderId = `slider-${data.category}`;
                        const slider = document.getElementById(sliderId);

                        if (slider) {
                            const envHtml = data.envPrice ? `<span class="text-[9px] font-bold text-brand-accent mt-0.5 inline-block">+Rs. ${data.envPrice} for Envelope</span>` : '';

                            const indexHTML = `
                     <div class="min-w-[200px] w-[200px] sm:min-w-[240px] sm:w-[240px] md:min-w-[260px] md:w-[260px] snap-start bg-white rounded-xl card-hover border border-slate-100 flex flex-col group shadow-sm relative p-4">
                        <div class="text-[10px] text-slate-700 font-bold mb-2">${data.tag}</div>
                        <div class="relative aspect-[4/5] overflow-hidden product-image-container bg-slate-50/50 rounded-lg mb-4">
                            <div class="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-zoom-in">
                                <div class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 shadow-lg transform scale-50 group-hover:scale-100 transition-all pointer-events-none">
                                    <i class='bx bx-search-alt-2 text-xl'></i>
                                </div>
                            </div>
                            <img src="${data.imageUrl}" alt="${data.title}" class="w-full h-full object-contain p-2 relative z-0">
                        </div>
                        <div class="flex flex-col flex-grow">
                            <div class="text-[10px] text-slate-400 mb-1 font-bold uppercase">${data.code}</div>
                            <h4 class="text-[15px] font-bold text-slate-900 mb-4 group-hover:text-brand-accent transition-colors leading-tight line-clamp-2">${data.title}</h4>
                            <div class="mt-auto relative flex justify-between items-end">
                                <div class="flex flex-col gap-0 w-4/5 pt-1">
                                    <span class="text-slate-400 font-bold text-[11px] line-through decoration-slate-300">Rs. ${data.oldPrice}</span>
                                    <span class="text-brand-accent font-black text-xl leading-none mt-1">Rs. ${data.newPrice}</span>
                                    ${envHtml}
                                </div>
                                <a href="https://wa.me/94787354843" target="_blank" class="w-10 h-10 rounded-full border border-slate-200 bg-white flex shrink-0 items-center justify-center text-slate-600 hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all shadow-sm group/btn mb-1" title="Buy Now">
                                    <i class='bx bx-shopping-bag text-lg group-hover/btn:scale-110 transition-transform'></i>
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

        // If products page, re-trigger filters to show new dynamically added images
        if (onProducts && typeof setupProductsFilter !== 'undefined') {
            // We delay slightly to allow DOM to paint
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const filterParam = urlParams.get('filter') || 'all';

                // Setup the products filter events and initialize
                setupProductsFilter(filterParam);

                // Highlight product if specified in URL
                const highlightCode = urlParams.get('highlight');
                if (highlightCode) {
                    setTimeout(() => {
                        const targetProduct = document.getElementById(`product-${highlightCode}`);
                        if (targetProduct) {
                            // Scroll to product
                            targetProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Highlight effect
                            targetProduct.classList.add('ring-4', 'ring-brand-accent', 'ring-opacity-50', 'transform', 'scale-[1.02]', 'transition-all', 'duration-500');

                            setTimeout(() => {
                                targetProduct.classList.remove('ring-4', 'ring-brand-accent', 'ring-opacity-50', 'transform', 'scale-[1.02]');
                            }, 3000);
                        }
                    }, 500);
                }
            }, 100);
        }

    } catch (error) {
        console.log("Firebase not configured yet or error fetching products. Error:", error.message);
    }
});
