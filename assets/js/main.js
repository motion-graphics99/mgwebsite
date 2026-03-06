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
        let lastScrollTime = 0;
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime < 100) return; // Throttle 100ms
            lastScrollTime = now;

            if (window.scrollY > 20) {
                if (!nav.classList.contains('bg-white/95')) {
                    nav.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-slate-100', 'py-2');
                    nav.classList.remove('bg-transparent', 'py-4', 'border-transparent');
                }
            } else {
                if (nav.classList.contains('bg-white/95')) {
                    nav.classList.remove('bg-white/95', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-slate-100', 'py-2');
                    nav.classList.add('bg-transparent', 'py-4', 'border-transparent');
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Init on load
    }

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function () {
            var menu = document.getElementById('mobile-menu');
            if (menu) menu.classList.toggle('hidden');
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
    document.addEventListener('click', function (e) {
        const buyBtn = e.target.closest('a[title="Buy Now"], a[title="Add Order"]');
        if (buyBtn) {
            e.preventDefault();
            const item = buyBtn.closest('.portfolio-item, .card-hover, .snap-start');
            let code = "Unknown", title = "Unknown", price = "Unknown";

            if (item) {
                const idEl = item.querySelector('.text-slate-400');
                if (idEl) code = idEl.innerText.trim();

                const titleEl = item.querySelector('h4');
                if (titleEl) title = titleEl.innerText.trim();

                const priceEl = item.querySelector('.text-emerald-500.font-black');
                if (priceEl) price = priceEl.innerText.trim();
            }

            const message = `Hello Motion Graphic Studio! 👋%0AI would like to place an order:%0A%0A*Product:* ${title}%0A*Code:* ${code}%0A*Price:* ${price}%0A%0APlease let me know the next steps.`;
            const phone = window.globalWANumber || "94787354843";
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }
    });
});

// Filtering and Search System
function setupProductsFilter(initialFilter) {
    const emptyState = document.getElementById('empty-state');
    const pillFilters = document.getElementById('pill-filters');
    const productCountEl = document.getElementById('product-count');
    const searchInput = document.getElementById('sidebar-search');
    const portfolioGrid = document.getElementById('portfolio-grid');

    let currentMainFilter = initialFilter || 'all';
    let currentSubFilter = 'all';

    function filterProducts() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const items = document.querySelectorAll('.portfolio-item');
        let visibleCount = 0;

        items.forEach(item => {
            const itemCat = item.getAttribute('data-category');
            const itemSize = (item.getAttribute('data-size') || '').toLowerCase(); // Matches tag slugs like 'a4'
            const itemTitle = item.querySelector('h4').textContent.toLowerCase();
            const itemCode = item.querySelector('.text-slate-400').textContent.toLowerCase();

            const matchesCategory = currentMainFilter === 'all' || itemCat === currentMainFilter;
            const matchesSub = currentSubFilter === 'all' || itemSize === currentSubFilter;
            const matchesSearch = query === '' || itemTitle.includes(query) || itemCode.includes(query);

            if (matchesCategory && matchesSub && matchesSearch) {
                item.style.display = 'flex';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
                visibleCount++;
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (item.style.opacity === '0') item.style.display = 'none';
                }, 300);
            }
        });

        if (productCountEl) productCountEl.innerText = visibleCount;
        if (emptyState) {
            if (visibleCount > 0) emptyState.classList.add('hidden');
            else emptyState.classList.remove('hidden');
        }
    }

    function updatePills(categoryId) {
        if (!pillFilters) return;

        // Reset subfilter when category changes
        currentSubFilter = 'all';

        // Find the category object to get its subcategories
        const category = (window.appCategories || []).find(c => c.id === categoryId);

        let pillsHtml = `<button data-filter="all" class="filter-pill active">All Designs</button>`;

        if (category && category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(sub => {
                const slug = sub.toLowerCase().replace(/\s+/g, '-');
                pillsHtml += `<button data-filter="${slug}" class="filter-pill">${sub}</button>`;
            });
        }

        pillFilters.innerHTML = pillsHtml;
    }

    // Sidebar Category Clicks
    const sidebar = document.getElementById('sidebar-categories');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                currentMainFilter = btn.getAttribute('data-filter');

                // Style updates
                document.querySelectorAll('.sidebar-cat-btn').forEach(b => b.classList.remove('active-cat'));
                btn.classList.add('active-cat');

                updatePills(currentMainFilter);
                filterProducts();
            }
        });
    }

    // Pill Filter Clicks
    if (pillFilters) {
        pillFilters.addEventListener('click', (e) => {
            const pill = e.target.closest('.filter-pill');
            if (pill) {
                currentSubFilter = pill.getAttribute('data-filter');

                document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                filterProducts();
            }
        });
    }

    // View Toggle Clicks
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-toggle-btn').forEach(b => {
                b.classList.remove('active', 'bg-emerald-500', 'text-white');
                b.classList.add('text-slate-400');
            });
            btn.classList.add('active', 'bg-emerald-500', 'text-white');
            btn.classList.remove('text-slate-400');

            if (portfolioGrid) {
                if (btn.getAttribute('data-view') === 'list') {
                    portfolioGrid.classList.remove('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
                    portfolioGrid.classList.add('grid-cols-1', 'gap-4');
                    portfolioGrid.classList.add('list-view');
                } else {
                    portfolioGrid.classList.remove('grid-cols-1', 'gap-4', 'list-view');
                    portfolioGrid.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-6');
                }
            }
        });
    });

    // Sidebar Search input
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    // Initialization
    if (currentMainFilter !== 'all') {
        const targetBtn = Array.from(document.querySelectorAll('.sidebar-cat-btn')).find(b => b.getAttribute('data-filter') === currentMainFilter);
        if (targetBtn) {
            document.querySelectorAll('.sidebar-cat-btn').forEach(b => b.classList.remove('active-cat'));
            targetBtn.classList.add('active-cat');
        }
        updatePills(currentMainFilter);
    }

    setTimeout(filterProducts, 600);
}
