document.addEventListener('DOMContentLoaded', () => {
    // Page Transition Fade In
    requestAnimationFrame(() => {
        document.body.classList.add('loaded');
    });

    // Handle internal link fade out
    const links = document.querySelectorAll('a[href]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only apply transition if internal link and not an external anchor or generic hash tag
            if (href && !href.startsWith('http') && !href.startsWith('wa.me') && !href.startsWith('mailto:') && !href.startsWith('#')) {
                e.preventDefault();
                document.body.classList.remove('loaded');
                setTimeout(() => {
                    window.location.href = href;
                }, 400); // Wait for CSS transition
            }
        });
    });

    // Navbar Scroll Effect
    const nav = document.getElementById('main-nav');
    if (nav) {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                nav.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-md', 'py-2');
                nav.classList.remove('bg-transparent', 'py-4');
            } else {
                nav.classList.remove('bg-white/95', 'backdrop-blur-md', 'shadow-md', 'py-2');
                nav.classList.add('bg-transparent', 'py-4');
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Init on load
    }

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function () {
            var menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        });
    }

    // Set Copyright Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Check if query params for filters exist on products load
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');

    if (document.getElementById('portfolio-filters')) {
        setupProductsFilter(filterParam);
    }

    // Global Event Delegation for Lightbox & Slider
    document.addEventListener('click', function (e) {
        // Lightbox Open
        const container = e.target.closest('.product-image-container');
        if (container) {
            if (container.hasAttribute('onclick')) return;
            e.preventDefault();
            e.stopPropagation();

            const lbModal = document.getElementById('image-lightbox');
            const lbImg = document.getElementById('lightbox-img');

            if (lbModal && lbImg) {
                const img = container.querySelector('img');
                if (img) {
                    lbImg.src = img.src;
                    lbModal.style.display = 'flex';
                    lbModal.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        lbModal.classList.add('show');
                    });
                    document.body.style.overflow = 'hidden';
                }
            }
        }

        // Lightbox Close
        const lbClose = e.target.closest('#lightbox-close');
        if (lbClose || e.target.id === 'image-lightbox' || e.target.classList.contains('modal-content')) {
            const lbModal = document.getElementById('image-lightbox');
            if (lbModal) {
                lbModal.classList.remove('show');
                setTimeout(() => {
                    lbModal.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        }

        // Next/Prev Slider Buttons
        const nextBtn = e.target.closest('.slide-next');
        const prevBtn = e.target.closest('.slide-prev');

        if (nextBtn) {
            const wrapper = nextBtn.closest('.group\\/slider');
            if (wrapper) {
                const slider = wrapper.querySelector('.custom-scrollbar');
                if (slider) slider.scrollBy({ left: 250, behavior: 'smooth' });
            }
        }

        if (prevBtn) {
            const wrapper = prevBtn.closest('.group\\/slider');
            if (wrapper) {
                const slider = wrapper.querySelector('.custom-scrollbar');
                if (slider) slider.scrollBy({ left: -250, behavior: 'smooth' });
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lbModal = document.getElementById('image-lightbox');
            if (lbModal && lbModal.style.display === 'flex') {
                lbModal.classList.remove('show');
                setTimeout(() => {
                    lbModal.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        }
    });

    // Dynamic WhatsApp Ordering Message Generation
    document.querySelectorAll('a[title="Buy Now"], a[title="Add Order"]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const item = this.closest('.portfolio-item, .card-hover');
            let code = "Unknown", title = "Unknown", price = "Unknown";

            if (item) {
                const idEl = item.querySelector('.text-slate-400.mb-1, .text-slate-400.mb-2, .text-\\[10px\\]');
                if (idEl) code = idEl.innerText.trim();

                const titleEl = item.querySelector('h4');
                if (titleEl) title = titleEl.innerText.trim();

                const priceEl = item.querySelector('.text-brand-accent.font-black, .text-brand-accent.font-bold');
                if (priceEl) price = priceEl.innerText.trim();
            }

            const message = `Hello Motion Graphic Studio! 👋%0AI would like to place an order:%0A%0A*Product:* ${title}%0A*Code:* ${code}%0A*Price:* ${price}%0A%0APlease let me know the next steps.`;
            const phone = "94787354843"; // Main WA number
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        });
    });


});

function setupProductsFilter(initialFilter) {
    const mainButtons = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('empty-state');
    const subFiltersContainer = document.getElementById('dynamic-sub-filters') || document.getElementById('wedding-sub-filters');

    let currentMainFilter = 'all';
    let currentSubFilter = 'all';

    function renderSubFilters(catId) {
        if (!subFiltersContainer || !window.appCategories) return;
        
        const category = window.appCategories.find(c => c.id === catId);
        if (!category || !category.subcategories || category.subcategories.length === 0) {
            subFiltersContainer.innerHTML = '';
            subFiltersContainer.classList.add('hidden');
            subFiltersContainer.classList.remove('flex');
            return;
        }

        subFiltersContainer.classList.remove('hidden');
        subFiltersContainer.classList.add('flex');
        
        let html = `<button data-sub-filter="all" class="sub-filter-btn px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-slate-200 text-slate-600 hover:border-brand-accent hover:text-brand-accent active">All Items</button>`;
        
        category.subcategories.forEach(sub => {
            const slug = sub.toLowerCase().replace(/\s+/g, '-');
            html += `<button data-sub-filter="${slug}" class="sub-filter-btn px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-slate-200 text-slate-600 hover:border-brand-accent hover:text-brand-accent">${sub}</button>`;
        });
        
        subFiltersContainer.innerHTML = html;

        // Reattach sub-listeners
        const subButtons = document.querySelectorAll('.sub-filter-btn');
        subButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                currentSubFilter = btn.getAttribute('data-sub-filter');
                updateSubBtnStyles();
                applyFilters();
            });
        });
    }

    function applyFilters() {
        let foundAny = false;
        const currentItems = document.querySelectorAll('.portfolio-item');

        currentItems.forEach(item => {
            if (!item.style.transition) {
                item.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }

            const itemCat = item.getAttribute('data-category');
            const itemSize = item.getAttribute('data-size');

            let mainMatch = (currentMainFilter === 'all' || itemCat === currentMainFilter);
            let subMatch = true;

            if (currentMainFilter !== 'all' && currentSubFilter !== 'all') {
                subMatch = (itemSize === currentSubFilter);
            }

            if (mainMatch && subMatch) {
                item.style.display = 'flex';
                void item.offsetWidth;
                item.style.opacity = '1';
                item.style.transform = 'scale(1) translateY(0)';
                foundAny = true;
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9) translateY(10px)';
                setTimeout(() => {
                    if (item.style.opacity === '0') {
                        item.style.display = 'none';
                    }
                }, 400); 
            }
        });

        if (foundAny) emptyState.classList.add('hidden');
        else emptyState.classList.remove('hidden');
    }

    function updateMainBtnStyles() {
        mainButtons.forEach(b => b.classList.remove('active'));
        const activeBtn = Array.from(mainButtons).find(b => b.getAttribute('data-filter') === currentMainFilter);
        if (activeBtn) activeBtn.classList.add('active');
    }

    function updateSubBtnStyles() {
        const subButtons = document.querySelectorAll('.sub-filter-btn');
        subButtons.forEach(b => b.classList.remove('active', 'bg-brand-accent', 'text-white', 'border-brand-accent'));
        subButtons.forEach(b => b.classList.add('text-slate-600', 'border-slate-200'));
        
        const activeBtn = Array.from(subButtons).find(b => b.getAttribute('data-sub-filter') === currentSubFilter);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-600', 'border-slate-200');
            activeBtn.classList.add('active', 'bg-brand-accent', 'text-white', 'border-brand-accent');
        }
    }

    mainButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentMainFilter = btn.getAttribute('data-filter');
            currentSubFilter = 'all';
            updateMainBtnStyles();
            renderSubFilters(currentMainFilter);
            applyFilters();
        });
    });

    if (initialFilter) {
        currentMainFilter = initialFilter;
    }
    
    updateMainBtnStyles();
    renderSubFilters(currentMainFilter);
    applyFilters();
}