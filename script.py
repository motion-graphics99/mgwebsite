import re

html_template = """    <!-- Categories Header -->
    <section class="pt-24 pb-8 bg-white/70 backdrop-blur-md border-t border-slate-100 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 font-['Playfair_Display'] italic text-slate-900">Featured Categories</h2>
            <div class="w-16 h-1 bg-brand-accent mx-auto mb-6 rounded-full"></div>
            <p class="text-slate-500 max-w-2xl mx-auto text-sm">Discover our handcrafted premium templates sorted by category.</p>
        </div>
    </section>

    <!-- Category 1: Wedding Cards -->
    <section class="py-8 bg-white/70 relative z-10">
        <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                <h3 class="text-xl font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <i class='bx bx-envelope text-brand-accent'></i> Wedding Cards
                </h3>
                <a href="products.html?filter=wedding" class="text-sm font-bold text-brand-accent hover:text-slate-900 transition-colors">See All</a>
            </div>
            
            <div class="product-slider-wrapper relative group/slider">
                <div class="product-slider flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory custom-scrollbar">
                    {WEDDING_PRODUCTS}
                </div>
                <!-- Controls -->
                <button class="slide-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-left text-2xl'></i>
                </button>
                <button class="slide-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-right text-2xl'></i>
                </button>
            </div>
        </div>
    </section>

    <!-- Category 2: Social Media -->
    <section class="py-8 bg-slate-50 relative z-10 border-y border-slate-100">
        <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
                <h3 class="text-xl font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <i class='bx bx-share-alt text-brand-accent'></i> Social Media
                </h3>
                <a href="products.html?filter=social" class="text-sm font-bold text-brand-accent hover:text-slate-900 transition-colors">See All</a>
            </div>
            
            <div class="product-slider-wrapper relative group/slider">
                <div class="product-slider flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory custom-scrollbar">
                    {SOCIAL_PRODUCTS}
                </div>
                <!-- Controls -->
                <button class="slide-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-left text-2xl'></i>
                </button>
                <button class="slide-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-right text-2xl'></i>
                </button>
            </div>
        </div>
    </section>

    <!-- Category 3: Packaging -->
    <section class="py-8 bg-white/70 relative z-10">
        <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                <h3 class="text-xl font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <i class='bx bx-package text-brand-accent'></i> Packaging
                </h3>
                <a href="products.html?filter=packaging" class="text-sm font-bold text-brand-accent hover:text-slate-900 transition-colors">See All</a>
            </div>
            
            <div class="product-slider-wrapper relative group/slider">
                <div class="product-slider flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory custom-scrollbar">
                    {PACKAGING_PRODUCTS}
                </div>
                <!-- Controls -->
                <button class="slide-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-left text-2xl'></i>
                </button>
                <button class="slide-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-right text-2xl'></i>
                </button>
            </div>
        </div>
    </section>

    <!-- Category 4: Business Cards -->
    <section class="py-8 bg-slate-50 relative z-10 border-t border-slate-100 mb-8">
        <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
                <h3 class="text-xl font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <i class='bx bx-id-card text-brand-accent'></i> Business Cards
                </h3>
                <a href="products.html?filter=business" class="text-sm font-bold text-brand-accent hover:text-slate-900 transition-colors">See All</a>
            </div>
            
            <div class="product-slider-wrapper relative group/slider">
                <div class="product-slider flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory custom-scrollbar">
                    {BUSINESS_PRODUCTS}
                </div>
                <!-- Controls -->
                <button class="slide-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-left text-2xl'></i>
                </button>
                <button class="slide-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:bg-brand-accent hover:text-white transition-all z-20 opacity-0 group-hover/slider:opacity-100 hidden sm:flex border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <i class='bx bx-chevron-right text-2xl'></i>
                </button>
            </div>
        </div>
    </section>"""

def p_img(img, code, title, old, new, tag="A6 Size"):
    return f"""
                    <div class="min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] md:min-w-[220px] md:w-[220px] snap-start bg-white rounded-xl overflow-hidden card-hover border border-slate-100 flex flex-col group shadow-[0_4px_20px_rgb(0,0,0,0.04)] relative">
                        <div class="relative aspect-[4/5] overflow-hidden product-image-container bg-slate-50/50">
                            <div class="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-zoom-in">
                                <div class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 shadow-lg transform scale-50 group-hover:scale-100 transition-all pointer-events-none">
                                    <i class='bx bx-search-alt-2 text-xl'></i>
                                </div>
                            </div>
                            <img src="assets/img/{img}" alt="{title}" class="w-full h-full object-contain p-2 relative z-0">
                            <div class="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm text-slate-700 z-20 pointer-events-none">{tag}</div>
                        </div>
                        <div class="p-4 flex flex-col flex-grow">
                            <div class="text-[9px] text-slate-400 mb-1 font-bold tracking-wider uppercase">{code}</div>
                            <h4 class="text-sm font-bold text-slate-900 mb-1 group-hover:text-brand-accent transition-colors leading-tight line-clamp-2">{title}</h4>
                            <div class="mt-auto pt-3 border-t border-slate-50 relative">
                                <div class="flex flex-col gap-0">
                                    <span class="text-slate-400 font-bold text-[10px] line-through decoration-slate-300">Rs. {old}</span>
                                    <span class="text-brand-accent font-black text-lg leading-none">Rs. {new}</span>
                                </div>
                                <a href="#" class="absolute right-0 bottom-0 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all shadow-sm group/btn" title="Buy Now">
                                    <i class='bx bx-shopping-bag text-lg group-hover/btn:scale-110 transition-transform'></i>
                                </a>
                            </div>
                        </div>
                    </div>"""

def p_icon(icon, code, title, old, new, tag="Packaging"):
    return f"""
                    <div class="min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] md:min-w-[220px] md:w-[220px] snap-start bg-white rounded-xl overflow-hidden card-hover border border-slate-100 flex flex-col group shadow-[0_4px_20px_rgb(0,0,0,0.04)] relative">
                        <div class="relative aspect-[4/5] overflow-hidden product-image-container bg-slate-50/50 flex flex-col items-center justify-center text-slate-300 group-hover:text-brand-accent transition-colors bg-gradient-to-b from-slate-50 to-slate-100/50">
                            <i class='bx {icon} text-5xl drop-shadow-sm'></i>
                            <span class="font-bold text-xs text-slate-400 mt-3">{title}</span>
                            <div class="absolute top-2 left-2 bg-white/95 text-slate-700 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20 pointer-events-none">{tag}</div>
                        </div>
                        <div class="p-4 flex flex-col flex-grow">
                            <div class="text-[9px] text-slate-400 mb-1 font-bold tracking-wider uppercase">{code}</div>
                            <h4 class="text-sm font-bold text-slate-900 mb-1 group-hover:text-brand-accent transition-colors leading-tight line-clamp-2">{title}</h4>
                            <div class="mt-auto pt-3 border-t border-slate-50 relative">
                                <div class="flex flex-col gap-0">
                                    <span class="text-slate-400 font-bold text-[10px] line-through decoration-slate-300">Rs. {old}</span>
                                    <span class="text-brand-accent font-black text-lg leading-none">Rs. {new}</span>
                                </div>
                                <a href="#" class="absolute right-0 bottom-0 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all shadow-sm group/btn" title="Buy Now">
                                    <i class='bx bx-shopping-bag text-lg group-hover/btn:scale-110 transition-transform'></i>
                                </a>
                            </div>
                        </div>
                    </div>"""

w_prods = [
    p_img("wca601.jpg", "WCA602", "Soft Pattern Invite", "60", "40", "A6"),
    p_img("wca602_new.jpg", "WCA601", "Dark Floral Invite", "60", "40", "A6"),
    p_img("wca501.jpg", "WCA501", "Botanical Invite", "75", "55", "A5"),
    p_img("wca502.jpg", "WCA502", "Blue Floral Invite", "75", "55", "A5"),
    p_img("wca503.jpg", "WCA503", "Gold Mandala Invite", "75", "55", "A5")
]

s_prods = [
    p_img("sm1.jpg", "SM-P01", "Edu Diploma Poster", "1500", "1000", "Promo"),
    p_img("sm2.png", "SM-P02", "Tournament Flier", "1500", "1000", "Promo"),
    p_img("sm3.jpg", "SM-P03", "Poson Banner Hori", "1500", "1000", "Promo"),
    p_img("sm4.jpg", "SM-P04", "Dansala Banner Hori", "1500", "1000", "Promo"),
    p_img("sm5.jpg", "SM-P05", "Edu Post Vertical", "1500", "1000", "Promo")
]

p_prods = [
    p_icon("bx-package", "MG-P001", "Cake Box", "80", "60", "Box"),
    p_icon("bx-package", "MG-P002", "Macaron Box", "100", "75", "Box"),
    p_icon("bx-package", "MG-P003", "Cupcake Box", "70", "50", "Box"),
    p_icon("bx-package", "MG-P004", "Premium Gift Box", "150", "120", "Box"),
    p_icon("bx-package", "MG-P005", "Shipping Box", "60", "45", "Box"),
]

b_prods = [
    p_icon("bx-id-card", "MG-B001", "Typographic Card", "30", "20", "Card"),
    p_icon("bx-id-card", "MG-B002", "Minimal Card", "30", "20", "Card"),
    p_icon("bx-id-card", "MG-B003", "Gold Foil Card", "50", "40", "Card"),
    p_icon("bx-id-card", "MG-B004", "Modern Card", "30", "20", "Card"),
    p_icon("bx-id-card", "MG-B005", "Classic Card", "30", "20", "Card"),
]

final = html_template.replace("{WEDDING_PRODUCTS}", "".join(w_prods))
final = final.replace("{SOCIAL_PRODUCTS}", "".join(s_prods))
final = final.replace("{PACKAGING_PRODUCTS}", "".join(p_prods))
final = final.replace("{BUSINESS_PRODUCTS}", "".join(b_prods))

with open("f:\\Motion Graphic Studio\\Website\\Motion Graphics LK\\index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re
# replace everything from <!-- Featured Products --> to <!-- Simple CTA -->
new_text = re.sub(r'<!-- Featured Products -->.*?<!-- Simple CTA -->', final + '\n    <!-- Simple CTA -->', text, flags=re.DOTALL)

with open("f:\\Motion Graphic Studio\\Website\\Motion Graphics LK\\index.html", "w", encoding="utf-8") as f:
    f.write(new_text)

print("Done")
