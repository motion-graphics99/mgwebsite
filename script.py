import re

def update_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to find the price section in wedding cards. The wedding cards are grouped by `data-category="wedding"`
    # But it's easier to just find the Rs. NN span and add the envelope text below it if it's not already there.
    # We'll specifically target products.html and index.html
    
    # To be safe, let's insert the Envelope span inside the price div of items categorized as "wedding"
    pattern = r'(data-category="wedding"[\s\S]*?<span class="text-brand-accent font-black text-(?:xl|lg) leading-none[^>]*>Rs\. \d+</span>)'
    
    def replacer(match):
        text = match.group(0)
        # Check if envelope text is already there
        if "Envelope" not in text:
            # We add it right after the span we matched
            size_class = "text-[9px]" if 'text-lg' in text else "text-[10px]"
            env_html = f'\n                                        <span class="{size_class} font-bold text-brand-accent mt-0.5 inline-block">+Rs. 45 for Envelope</span>'
            return text + env_html
        return text

    new_content = re.sub(pattern, replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filepath}")

update_html("index.html")
update_html("products.html")
