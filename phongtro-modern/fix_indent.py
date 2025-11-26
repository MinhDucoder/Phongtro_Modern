with open('src/app/api/rooms-search/route.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix the indentation issue
# Lines 224-249 need to be unindented by 2 spaces (one level)
for i in range(223, 249):  # 0-indexed, so line 224 is index 223
    if lines[i].startswith('      '):  # If indented with 6 spaces
        lines[i] = lines[i][2:]  # Remove 2 spaces

# Write back
with open('src/app/api/rooms-search/route.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed indentation for fallback search code")
