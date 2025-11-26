with open('src/app/api/rooms-search/route.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We need to insert a closing brace '    }\n' before the return statement at line 248 (index 247)
# Current line 248 (index 247) is: "    return NextResponse.json({ items: [], note: `Không thấy kết quả cho: “${q}”` }, { status: 404 });\n"
# We want to insert before it.

lines.insert(247, "    }\n")

# Write back
with open('src/app/api/rooms-search/route.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed: Added missing closing brace for if(r1.ok)")
