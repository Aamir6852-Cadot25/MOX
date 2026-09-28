import re
with open("web/src/pages/NewScan.jsx", "r", encoding="utf-8") as f:
    text = f.read()

text = re.sub(r'<Icon name="archive" size="20" />', '<Icon name="folder" size="20" />', text)
text = re.sub(r'<Icon name="git-branch" size="20" />', '<Icon name="folder" size="20" />', text)
text = re.sub(r'<Icon name="folder-search" />', '<Icon name="search" />', text)

with open("web/src/pages/NewScan.jsx", "w", encoding="utf-8") as f:
    f.write(text)

