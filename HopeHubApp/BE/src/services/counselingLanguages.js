// FormData sends this field as JSON text; JSON clients may send an array.
export function parseCounselingLanguages(value) {
  let list = value;
  if (typeof list === "string") {
    try { list = JSON.parse(list); } catch { throw new Error("Select Sinhala, English, or both"); }
  }
  if (!Array.isArray(list) || list.length < 1 || list.length > 2 ||
      list.some(code => typeof code !== "string" || !["en", "si"].includes(code))) {
    throw new Error("Select Sinhala, English, or both");
  }
  return [...new Set(list)].sort();
}

// Legacy profiles have unknown session languages; never guess them.
export function getCounselingLanguages(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter(code => code === "en" || code === "si"))].sort()
    : [];
}
