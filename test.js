document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Query products ordered by newest first
        const querySnapshot = await db.collection("products").orderBy("createdAt", "desc").get();

        const onIndex = document.getElementById('dynamic-index-categories') !== null;
        const onProducts = document.getElementById('portfolio-grid') !== null;

        // --- Fetch Categories for Dynamic UI ---
        const catSnapshot = await db.collection("categories").get();
        window.appCategories = [];

        if (catSnapshot.empty) {
            // Seed default categories so the website doesn't break initially
            const defaultCats = [
                { id: "wedding", name: "Wedding Cards", subcategories: ["A4", "A5", "A6"], order: 1 },
                { id: "social", name: "Social Media", subcategories: [], order: 2 },
                { id: "packaging", name: "Cake Boxes", subcategories: [], order: 3 },
                { id: "business", name: "Business Cards", subcategories: [], order: 4 }
            ];

            for (let cat of defaultCats) {
                await db.collection("categories").doc(cat.id).set({
                    name: cat.name,
                    subcategories: cat.subcategories,
                    order: cat.order,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                window.appCategories.push(cat);
            }
        } else {
            catSnapshot.forEach(doc => window.appCategories.push({ id: doc.id, ...doc.data() }));            // Sort categories by order correctly
            window.appCategories.sort((a,b) => {
                let oA = a.order !== undefined ? parseInt(a.order) : 999;
                let oB = b.order !== undefined ? parseInt(b.order) : 999;
                if(oA !== oB) return oA - oB;
                return (a.name || "").localeCompare(b.name || "");
            });
        }

        // Dynamically build Index Sliders
        if (onIndex) {
            const indexContainer = document.getElementById('dynamic-index-categories');
            if (indexContainer) {
                let indexHtml = '';
                window.appCategories.forEach(cat => {
                    indexHtml += `
                    <section class="py-6 bg-transparent relative z-10 border-b border-transparent mb-8" id="dynamic-category-${cat.id}">
                        <div class="max-w-[100rem] mx-auto">
                            <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                                <h3 class="text-lg md:text-xl font-bold text-slate-800 uppercase tracking-widest">
                                    <i class='bx bx-category text-brand-accent'></i> ${cat.name}
                                </h3>
                                <a href="products.html?filter=${cat.id}" class="text-sm font-bold text-brand-accent hover:text-slate-900 transition-colors">See All</a>
                            </div>
                            <div class="relative group/slider">
                                <div class="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory custom-scrollbar" id="slider-${cat.id}">
                                    <!-- Dynamic items fetch below -->
                                </div>
                                <button class="slide-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100">
                                    <i class='bx bx-chevron-left text-3xl'></i>
                                </button>
                                <button class="slide-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100">
                                    <i class='bx bx-chevron-right text-3xl'></i>
                                </button>
                            </div>
                        </div>
                    </section>`;
                });
                indexContainer.innerHTML = indexHtml;

                // Re-bind slider controls for newly added
                setTimeout(() => {
                    const nextBtns = document.querySelectorAll('.slide-next');
                    const prevBtns = document.querySelectorAll('.slide-prev');

                    nextBtns.forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const wrapper = this.closest('.group\\/slider');
                            if (wrapper) {
                                const slider = wrapper.querySelector('.custom-scrollbar');
                                if (slider) slider.scrollBy({ left: 250, behavior: 'smooth' });
                            }
                        });
                    });

                    prevBtns.forEach(btn => {
                        btn.addEventListener('click', function(e) {
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
            html += `
                        <button data-filter="${cat.id}" class="filter-btn filter-sidebar-item w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex justify-between items-center group whitespace-nowrap">
                            ${cat.name}
                            <i class='bx bx-chevron-right opacity-0 group-hover:opacity-100 transition-opacity'></i>
                        </button>
                    `;
        });
        sidebar.innerHTML = html;
    }
}

querySnapshot.forEach((doc) => {
    const data = doc.data();

    if (onProducts) {
        // --- Products Page Logic ---
        let sizeAttr = '';
        // Dynamic sizing attribute logic if it's subcategory match
        if (data.tag) {
            sizeAttr = `data-size="${data.tag.toLowerCase().replace(/\s+/g, '-')}"`;
        }

        const envHtml = data.envPrice ? `<span class="text-[10px] font-bold text-brand-accent mt-0.5 inline-block">+Rs. ${data.envPrice} for Envelope</span>` : '';

        const productHTML = `
                <div class="portfolio-item bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden card-hover border border-white flex flex-col group shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative"
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
    }

    if (onIndex) {
        // --- Index Page Logic ---
        const sliderId = `slider-${data.category}`;
        const slider = document.getElementById(sliderId);

        if (slider) {
            const envHtml = data.envPrice ? `<span class="text-[9px] font-bold text-brand-accent mt-0.5 inline-block">+Rs. ${data.envPrice} Envelope</span>` : '';

            const indexHTML = `
                     <div class="min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] md:min-w-[220px] md:w-[220px] snap-start bg-white rounded-xl overflow-hidden card-hover border border-slate-100 flex flex-col group shadow-[0_4px_20px_rgb(0,0,0,0.04)] relative">
                        <div class="relative aspect-[4/5] overflow-hidden product-image-container bg-slate-50/50">
                            <div class="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-zoom-in">
                                <div class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 shadow-lg transform scale-50 group-hover:scale-100 transition-all pointer-events-none">
                                    <i class='bx bx-search-alt-2 text-xl'></i>
                                </div>
                            </div>
                            <img src="${data.imageUrl}" alt="${data.title}" class="w-full h-full object-contain p-2 relative z-0">
                            <div class="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm text-slate-700 z-20 pointer-events-none">${data.tag}</div>
                        </div>
                        <div class="p-4 flex flex-col flex-grow">
                            <div class="text-[9px] text-slate-400 mb-1 font-bold tracking-wider uppercase">${data.code}</div>
                            <h4 class="text-sm font-bold text-slate-900 mb-1 group-hover:text-brand-accent transition-colors leading-tight line-clamp-2">${data.title}</h4>
                            <div class="mt-auto pt-3 border-t border-slate-50 relative">
                                <div class="flex flex-col gap-0 w-4/5">
                                    <span class="text-slate-400 font-bold text-[10px] line-through decoration-slate-300">Rs. ${data.oldPrice}</span>
                                    <span class="text-brand-accent font-black text-lg leading-none mt-1">Rs. ${data.newPrice}</span>
                                    ${envHtml}
                                </div>
                                <a href="https://wa.me/94787354843" target="_blank" class="absolute right-0 bottom-0 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all shadow-sm group/btn" title="Buy Now">
                                    <i class='bx bx-shopping-bag text-lg group-hover/btn:scale-110 transition-transform'></i>
                                </a>
                            </div>
                        </div>
                    </div>`;

            slider.insertAdjacentHTML('afterbegin', indexHTML);
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
    }, 100);
}

    } catch (error) {
    console.log("Firebase not configured yet or error fetching products. Error:", error.message);
}
});
