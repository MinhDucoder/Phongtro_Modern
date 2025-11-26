with open('src/app/api/rooms-search/route.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Remove extra closing brace at line 248 (index 247)
# Check if it is "    }\n" or similar
if lines[247].strip() == "}":
    del lines[247]
    print("Removed extra brace at line 248")

# 2. Implement logic fix
# Find where `const { priceMinVnd ... } = parseQuery(q);` is.
# It's around line 177.
insert_index = -1
for i, line in enumerate(lines):
    if "const { priceMinVnd" in line:
        insert_index = i + 1
        break

if insert_index != -1:
    lines.insert(insert_index, '    // Fix: Nếu keyword trùng với district, bỏ keyword để tránh search Title quá chặt\n')
    lines.insert(insert_index + 1, '    if (district && keyword.toLowerCase() === district.toLowerCase()) {\n')
    lines.insert(insert_index + 2, '      // keyword = ""; // Cannot assign to const\n')
    lines.insert(insert_index + 3, '      // We need to use a new variable or modify how url is constructed\n')
    lines.insert(insert_index + 4, '    }\n')
    # Wait, `keyword` is const. I cannot reassign it.
    # I should change `const keyword` to `let keyword` at line 156.
    
    # Let's do it differently.
    pass

# Re-read lines to be safe
with open('src/app/api/rooms-search/route.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Remove extra brace
if len(lines) > 247 and lines[247].strip() == "}":
    del lines[247]
    print("Removed extra brace")

# 2. Change `const keyword` to `let keyword`
for i, line in enumerate(lines):
    if "const keyword = extractKeyword(q);" in line:
        lines[i] = line.replace("const keyword", "let keyword")
        print("Changed const keyword to let keyword")
        break

# 3. Add logic to clear keyword
for i, line in enumerate(lines):
    if "const { priceMinVnd" in line:
        # Insert after this line
        code_to_insert = [
            '\n',
            '    // Fix: Nếu keyword trùng với district, bỏ keyword để tránh search Title quá chặt (backend fallback)\n',
            '    if (district && keyword.toLowerCase() === district.toLowerCase()) {\n',
            '      keyword = "";\n',
            '    }\n'
        ]
        for j, code in enumerate(code_to_insert):
            lines.insert(i + 1 + j, code)
        print("Inserted keyword clearing logic")
        break

with open('src/app/api/rooms-search/route.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)
