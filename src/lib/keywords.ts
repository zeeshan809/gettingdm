export type MatchRule = "contains" | "exact" | "starts_with";

// Case-insensitive keyword matching (PRD 6.2). Pure so the backend can reuse it.
export function matchKeyword(comment: string, keywords: string[], rule: MatchRule): string | null {
  const text = comment.trim().toLowerCase();
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  for (const raw of keywords) {
    const kw = raw.trim().toLowerCase();
    if (!kw) continue;
    if (rule === "exact" && text.replace(/[^\p{L}\p{N}\s]/gu, "").trim() === kw) return raw;
    if (rule === "contains" && words.includes(kw)) return raw;
    if (rule === "starts_with" && words[0] === kw) return raw;
  }
  return null;
}

export const MATCH_RULES: { id: MatchRule; label: string; help: string }[] = [
  { id: "contains", label: "Contains keyword", help: "“send PYTHON pls” matches PYTHON" },
  { id: "exact", label: "Exact match", help: "Only “python” (emoji and punctuation ignored)" },
  { id: "starts_with", label: "Starts with keyword", help: "“python please” matches, “pls python” doesn't" },
];
