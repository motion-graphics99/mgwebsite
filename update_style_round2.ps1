$files = @("index.html", "products.html", "contact.html", "admin.html", "assets/js/fetch-products.js", "assets/js/main.js", "assets/css/style.css")

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Accent Color (Green to Blue)
        $content = $content -replace "#7dd329", "#3b82f6"
        $content = $content -replace "#6bc020", "#2563eb"
        $content = $content -replace "rgba\(125, 211, 41", "rgba(59, 130, 246"
        $content = $content -replace "rgba\(125,211,41", "rgba(59,130,246"
        
        # Theme Color (Lighter dark scheme)
        $content = $content -replace "\bbg-slate-950\b", "bg-slate-800"
        $content = $content -replace "\bbg-slate-900\b", "bg-slate-800"
        $content = $content -replace "\bfrom-slate-900\b", "from-slate-800"
        $content = $content -replace "\bvia-slate-800\b", "via-slate-700"
        $content = $content -replace "\bto-slate-950\b", "to-slate-800"
        $content = $content -replace "\bborder-slate-800\b", "border-slate-700"
        $content = $content -replace "\bborder-slate-900\b", "border-slate-700"
        
        # Navbar Scroll Color in main.js
        $content = $content -replace "bg-white/95', 'backdrop-blur-md', 'shadow-md', 'py-2", "bg-slate-800/95', 'backdrop-blur-md', 'shadow-md', 'border-b', 'border-slate-700', 'py-3"
        
        # Admin button styling fixes (it's using bg-white in JS originally converted to 900)
        # We need to make sure the blue looks good and dark theme holds up.

        # Typography & Buttons - smaller & smart
        $content = $content -replace "\btext-lg\b", "text-sm"
        $content = $content -replace "\btext-xl\b(?!',)", "text-base" # exclude icon replacements if needed, but actually icons scale with font-size, which is fine
        $content = $content -replace "text-5xl md:text-6xl lg:text-7xl", "text-4xl md:text-5xl lg:text-6xl"
        $content = $content -replace "text-3xl md:text-5xl", "text-2xl md:text-4xl"
        $content = $content -replace "px-8 py-4", "px-6 py-2.5"
        $content = $content -replace "px-6 py-3", "px-4 py-2"
        # Make font medium a bit smaller where it applies as text-sm to text-xs
        # Wait, simple replacements are safer
        
        # Logo Enlarge
        $content = $content -replace 'class="h-12 object-contain"', 'class="h-16 object-contain"'
        
        # Logo text change (Playfair_Display -> Sans-serif strong)
        $content = $content -replace "font-\['Playfair_Display'\] font-black italic", "font-sans font-black tracking-tight"
        $content = $content -replace "text-\[22px\]", "text-[24px]"

        Set-Content -Path $file -Value $content -Encoding UTF8
        Write-Host "Updated $file"
    }
}
