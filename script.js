const fs = require('fs');

function updateHtml(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');

    // Replace logic
    // We match the price span inside wedding cards
    const regex = /(data-category="wedding"[\s\S]*?<span class="text-brand-accent font-black text-(?:xl|lg) leading-none[^>]*>Rs\. \d+<\/span>)/g;

    let modified = content.replace(regex, (match) => {
        if (!match.includes('Envelope')) {
            const sizeClass = match.includes('text-lg') ? 'text-[9px]' : 'text-[10px]';
            const extra = `\n                                        <span class="${sizeClass} font-bold text-brand-accent mt-0.5 inline-block">+Rs. 45 for Envelope</span>`;
            return match + extra;
        }
        return match;
    });

    fs.writeFileSync(filepath, modified, 'utf-8');
    console.log("Updated " + filepath);
}

updateHtml('index.html');
updateHtml('products.html');
