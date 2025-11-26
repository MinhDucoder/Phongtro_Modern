# Read file
with open('src/app/api/rooms-search/route.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove line 248 (index 247) which contains the extra '}'
del lines[247]

# Write back
with open('src/app/api/rooms-search/route.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed: Removed extra closing brace on line 248")
