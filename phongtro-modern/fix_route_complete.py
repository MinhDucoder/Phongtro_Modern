with open('src/app/api/rooms-search/route.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Change const keyword to let keyword (Line 156, index 155)
if "const keyword" in lines[155]:
    lines[155] = lines[155].replace("const", "let")
    print("Changed const to let at line 156")

# 2. Insert logic (Around line 177)
insert_idx = -1
for i, line in enumerate(lines):
    if "const { priceMinVnd" in line:
        insert_idx = i + 1
        break

if insert_idx != -1:
    lines.insert(insert_idx, '\n    // Fix: Nếu keyword trùng với district, bỏ keyword để tránh search Title quá chặt (backend fallback)\n')
    lines.insert(insert_idx + 1, '    if (district && keyword.toLowerCase() === district.toLowerCase()) {\n')
    lines.insert(insert_idx + 2, '      keyword = "";\n')
    lines.insert(insert_idx + 3, '    }\n')
    print("Inserted logic")

# 3. Insert } at line 223 (index 222 in original, but shifted by +4 lines from logic insert)
fallback_idx = -1
for i, line in enumerate(lines):
    if "// 2) Fallback" in line:
        fallback_idx = i
        break

if fallback_idx != -1:
    lines.insert(fallback_idx, '    }\n')
    print("Inserted } before fallback")

# 4. Remove } at line 248 (index 247 in original, but shifted)
return_404_idx = -1
for i, line in enumerate(lines):
    if "return NextResponse.json({ items: [], note: `Không thấy kết quả" in line:
        return_404_idx = i
        break

if return_404_idx != -1:
    # Check lines before it.
    # We expect `}` at return_404_idx - 2 (empty line is -1).
    if lines[return_404_idx - 2].strip() == "}":
        del lines[return_404_idx - 2]
        print("Removed extra }")
    elif lines[return_404_idx - 1].strip() == "}":
        del lines[return_404_idx - 1]
        print("Removed extra } (no empty line)")

with open('src/app/api/rooms-search/route.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)
