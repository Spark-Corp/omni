import re

files = {
    'src/app/api/vendors/nearby/route.js': [
        ('Failed to fetch nearby vendors', 'Internal server error')
    ],
    'src/app/api/vendors/search/route.js': [
        ('Failed to search vendors', 'Internal server error')
    ],
    'src/app/api/availability/request/route.js': [
        ('Failed to create availability request', 'Internal server error')
    ]
}

for fpath, replacements in files.items():
    with open(fpath, 'r') as fi:
        content = fi.read()
    for old, newTxt in replacements:
        content = content.replace(old, newTxt)
    with open(fpath, 'w') as fi:
        fi.write(content)

print('Done')
