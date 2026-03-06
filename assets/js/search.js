document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('.inline-search-input');

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.querySelectorAll('.inline-search-dropdown').forEach(d => {
                d.classList.add('hidden');
                d.classList.remove('flex');
            });
        }
    });

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
                    <i class='bx bx-loader-alt bx-spin text-2xl text-brand-accent'></i>
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
            resultsContainer.innerHTML = `<div class="text-center py-6 text-slate-500 font-bold text-sm">Loading products...</div>`;
            return;
        }

        // Filter functionality
        const matched = cachedSearchProducts.filter(p => {
            const titleMatch = (p.title || "").toLowerCase().includes(query);
            const codeMatch = (p.code || "").toLowerCase().includes(query);
            const catMatch = (p.category || "").toLowerCase().includes(query);
            const tagMatch = (p.tag || "").toLowerCase().includes(query);
            const subcatMatch = (p.subcategory || "").toLowerCase().includes(query);

            return titleMatch || codeMatch || catMatch || tagMatch || subcatMatch;
        });

        countLabel.innerText = `${matched.length} Results`;

        if (matched.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-6 text-slate-500 flex flex-col items-center">
                    <i class='bx bx-info-circle text-4xl mb-2 text-slate-300'></i>
                    <p class="font-bold text-sm">No match for "${query}"</p>
                </div>`;
            return;
        }

        // Render matched products
        let html = '<div class="flex flex-col gap-2">';
        matched.forEach(data => {
            html += `
            <a href="products.html?highlight=${data.code}" class="bg-white rounded-lg p-2 flex gap-3 items-center hover:bg-slate-50 border border-transparent hover:border-brand-accent/30 transition-all group">
                <img src="${data.imageUrl}" class="w-12 h-12 object-cover rounded bg-slate-50 border border-slate-100">
                <div class="flex-grow flex flex-col justify-center">
                    <div class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">${data.code}</div>
                    <h4 class="font-bold text-slate-900 group-hover:text-brand-accent transition-colors text-xs line-clamp-1">${data.title}</h4>
                    <span class="text-brand-accent font-black text-sm leading-none mt-1">Rs. ${data.newPrice}</span>
                </div>
                <i class='bx bx-chevron-right text-slate-300 group-hover:text-brand-accent'></i>
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
