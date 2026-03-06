document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('.inline-search-input');

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.querySelectorAll('.inline-search-dropdown').forEach(d => {
                d.classList.add('hidden');
                d.classList.remove('flex');
            });
        }
    });

    // Make binding global so it can be re-run after dynamic categories load
    window.bindSearchCheckboxEvents = function () {
        const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
        const labelDisplay = document.getElementById('selected-collections-label');
        const clearBtn = document.getElementById('clear-filters');

        function updateLabel() {
            const checked = Array.from(categoryCheckboxes).filter(cb => cb.checked);
            if (checked.length === 0) {
                if (labelDisplay) labelDisplay.textContent = 'All Designs';
            } else if (checked.length === 1) {
                if (labelDisplay) labelDisplay.textContent = checked[0].parentElement.querySelector('span').textContent;
            } else {
                if (labelDisplay) labelDisplay.textContent = `${checked.length} Selected`;
            }

            // Trigger search update if query exists
            searchInputs.forEach(input => {
                if (input.value.trim().length >= 2) {
                    const container = input.closest('.search-container');
                    const resultsContainer = container.querySelector('.inline-search-results');
                    const countLabel = container.querySelector('.search-result-count');
                    performSearch(input.value.trim().toLowerCase(), resultsContainer, countLabel);
                }
            });
        }

        categoryCheckboxes.forEach(cb => {
            cb.replaceWith(cb.cloneNode(true)); // Remove existing listeners
        });

        // Re-select and add new listeners
        const newCheckboxes = document.querySelectorAll('.category-checkbox');
        newCheckboxes.forEach(cb => {
            cb.addEventListener('change', updateLabel);
        });

        if (clearBtn) {
            clearBtn.replaceWith(clearBtn.cloneNode(true));
            const newClearBtn = document.getElementById('clear-filters');
            newClearBtn.addEventListener('click', () => {
                document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
                updateLabel();
            });
        }
    };

    // Initial bind
    window.bindSearchCheckboxEvents();

    let debounceTimer;
    searchInputs.forEach(input => {
        input.addEventListener('focus', function () {
            const dropdown = this.closest('.search-container').querySelector('.inline-search-dropdown');
            if (this.value.trim().length > 0) {
                dropdown.classList.remove('hidden');
                dropdown.classList.add('flex');
            }
        });

        input.addEventListener('input', function (e) {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim().toLowerCase();
            const container = this.closest('.search-container');
            const dropdown = container.querySelector('.inline-search-dropdown');
            const resultsContainer = container.querySelector('.inline-search-results');
            const countLabel = container.querySelector('.search-result-count');

            if (query.length < 2) {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('flex');
                return;
            }

            dropdown.classList.remove('hidden');
            dropdown.classList.add('flex');

            resultsContainer.innerHTML = `
                <div class="flex justify-center py-6">
                    <i class='bx bx-loader-alt bx-spin text-2xl text-emerald-500'></i>
                </div>`;

            debounceTimer = setTimeout(() => performSearch(query, resultsContainer, countLabel), 400);
        });
    });
});

let cachedSearchProducts = [];
let searchCacheInitialized = false;

// Initialize realtime cache
if (typeof db !== 'undefined') {
    db.collection("products").onSnapshot((snap) => {
        const temp = [];
        snap.forEach(doc => {
            const data = doc.data();
            if (data.isActive !== false) {
                temp.push({ docId: doc.id, ...data });
            }
        });
        cachedSearchProducts = temp;
        searchCacheInitialized = true;
    });
}

async function performSearch(query, resultsContainer, countLabel) {
    try {
        if (!searchCacheInitialized) {
            resultsContainer.innerHTML = `<div class="text-center py-6 text-slate-400 font-bold text-sm">Loading products...</div>`;
            return;
        }

        // Get selected categories
        const checkedCbs = Array.from(document.querySelectorAll('.category-checkbox'))
            .filter(cb => cb.checked)
            .map(cb => cb.value.toLowerCase());

        // Filter functionality
        const matched = cachedSearchProducts.filter(p => {
            const titleMatch = (p.title || "").toLowerCase().includes(query);
            const codeMatch = (p.code || "").toLowerCase().includes(query);
            const tagMatch = (p.tag || "").toLowerCase().includes(query);

            // Category check
            const categoryMatches = checkedCbs.length === 0 || checkedCbs.includes((p.category || "").toLowerCase());

            return (titleMatch || codeMatch || tagMatch) && categoryMatches;
        });

        countLabel.innerText = `${matched.length} Results`;

        if (matched.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-10 text-slate-400 flex flex-col items-center">
                    <i class='bx bx-search-alt text-5xl mb-3 text-slate-200'></i>
                    <p class="font-bold text-sm text-slate-400 uppercase tracking-widest">No match for "${query}"</p>
                    <p class="text-xs text-slate-300 mt-1 font-medium">Try different keywords or filters</p>
                </div>`;
            return;
        }

        // Render matched products (Updated to match white theme)
        let html = '<div class="flex flex-col gap-2 p-1">';
        matched.forEach(data => {
            html += `
            <a href="products.html?highlight=${data.code}" class="bg-white rounded-xl p-3 flex gap-4 items-center hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group shadow-sm">
                <div class="w-14 h-14 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 p-1">
                    <img src="${data.imageUrl}" class="w-full h-full object-contain">
                </div>
                <div class="flex-grow flex flex-col justify-center">
                    <div class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">${data.code}</div>
                    <h4 class="font-bold text-slate-800 group-hover:text-emerald-500 transition-colors text-xs line-clamp-1">${data.title}</h4>
                    <span class="text-emerald-500 font-black text-sm leading-none mt-1">Rs. ${data.newPrice}</span>
                </div>
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <i class='bx bx-chevron-right text-lg'></i>
                </div>
            </a>`;
        });
        html += '</div>';

        resultsContainer.innerHTML = html;

    } catch (e) {
        console.error("Search error:", e);
        resultsContainer.innerHTML = `<div class="text-center py-6 text-red-500 font-bold text-xs">Error while searching.</div>`;
    }
}

// Mobile fallback (since we removed the big modal)
window.openSearchModal = function () {
    alert("Mobile search is in progress. Please use the desktop search input.");
}

