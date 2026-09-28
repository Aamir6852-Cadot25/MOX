import re
with open('D:/MOX/web/src/pages/NewScan.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('<Icon name="archive"', '<Icon name="folder"')
text = text.replace('<Icon name="git-branch"', '<Icon name="folder"')
text = text.replace('<Icon name="folder-search"', '<Icon name="search"')

with open('D:/MOX/web/src/pages/NewScan.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
