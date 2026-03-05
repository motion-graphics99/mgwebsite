document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Query products ordered by newest first
        const querySnapshot = await db.collection("products").orderBy("createdAt", "desc").get();

        const onIndex = document.getElementById('slider-wedding') !== null;
        const onProducts = document.getElementById('portfolio-grid') !== null;

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if (onProducts) {
                // --- Products Page Logic ---
                let sizeAttr = '';
                if (data.category === 'wedding') {
                    if (data.tag.toLowerCase().includes('a5')) sizeAttr = 'data-size="a5"';
                    else if (data.tag.toLowerCase().includes('a6')) sizeAttr = 'data-size="a6"';
                    else if (data.tag.toLowerCase().includes('a4')) sizeAttr = 'data-size="a4"';
                }

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
                                <div class="flex flex-col gap-0">
                                    <span class="text-slate-400 font-bold text-[10px] line-through decoration-slate-300">Rs. ${data.oldPrice}</span>
                                    <span class="text-brand-accent font-black text-lg leading-none">Rs. ${data.newPrice}</span>
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

                // Simulate a click on the active filter to refresh grid
                const targetBtn = document.querySelector(`.filter-sidebar-item[data-filter="${filterParam}"]`);
                if (targetBtn) targetBtn.click();
            }, 100);
        }

    } catch (error) {
        console.log("Firebase not configured yet or error fetching products. Error:", error.message);
    }
});
