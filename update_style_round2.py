import re
import os

files_to_update = ['index.html', 'products.html', 'contact.html', 'admin.html', 'assets/js/fetch-products.js', 'assets/js/main.js', 'assets/css/style.css']

replacements = [
    # Accent Color
    (r'#7dd329', '#3b82f6'), # Blue-500
    (r'#6bc020', '#2563eb'), # Blue-600 (hover)
    (r'rgba\(125, 211, 41', 'rgba(59, 130, 246'), # Shadow hover
    
    # "Theme Color godak kalu karanne nathuwa laa patak"
    # Change slate-950 to slate-800, slate-900 to slate-800 or slate-700
    (r'bg-slate-950', 'bg-slate-800'),
    (r'bg-slate-900', 'bg-slate-800'),
    (r'from-slate-900', 'from-slate-800'),
    (r'via-slate-800', 'via-slate-700'),
    (r'to-slate-950', 'to-slate-800'),
    (r'border-slate-800', 'border-slate-700'),
    (r'border-slate-900', 'border-slate-700'),

    # Navbar Scroll Color in main.js
    (r"bg-white/95', 'backdrop-blur-md', 'shadow-md', 'py-2", "bg-slate-800/95', 'backdrop-blur-md', 'shadow-md', 'border-b', 'border-slate-700', 'py-3"),

    # Typography & Buttons - making things smaller & "smart"
    (r'text-lg', 'text-sm'),
    (r'text-xl', 'text-base'),
    (r'text-5xl md:text-6xl lg:text-7xl', 'text-4xl md:text-5xl lg:text-6xl'),
    (r'px-8 py-4', 'px-6 py-2.5'),
    (r'px-6 py-3', 'px-4 py-2'),
    (r'text-sm font-medium', 'text-xs font-medium'),
    
    # Logo Enlarge
    (r'class="h-12 object-contain"', 'class="h-16 object-contain"'),
    
    # Logo text change (Playfair_Display -> Outfit or similar)
    (r"font-\['Playfair_Display'\] font-black italic", "font-sans font-black tracking-tight"),
    (r"text-\[22px\]", "text-[24px]")
]

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for p, r_val in replacements:
            content = re.sub(p, r_val, content)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
