import re
with open("web/src/pages/NewScan.jsx", "r", encoding="utf-8") as f:
    text = f.read()

# Remove the search icon completely
text = re.sub(r'<Icon name="search" />', '', text)

with open("web/src/pages/NewScan.jsx", "w", encoding="utf-8") as f:
    f.write(text)

