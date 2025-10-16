// Helperi koji sprječavaju dupliranje i /login petlju
export function safeNext(pathname: string, search: string) {
  // 1) Ako smo na /login (ili child), ne vraćaj login kao next
  if (pathname.startsWith("/login")) return "/";

  // 2) Ako URL već ima next, NEMOJ graditi "next od next-a"
  const params = new URLSearchParams(search);
  const existingNext = params.get("next");
  if (existingNext) {
    try {
      const decoded = decodeURIComponent(existingNext);
      if (!decoded || decoded.startsWith("/login")) return "/";
      return decoded;
    } catch {
      return "/";
    }
  }

  // 3) Inače: trenutni path + search (ali bez next parametra)
  const cleaned = stripNextFromSearch(search);
  const combined = pathname + cleaned;
  return combined || "/";
}

export function parseNextFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const raw = params.get("next") || "/";
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded || decoded.startsWith("/login")) return "/";
    return decoded;
  } catch {
    return "/";
  }
}

function stripNextFromSearch(search: string) {
  if (!search) return "";
  const params = new URLSearchParams(search);
  if (params.has("next")) {
    params.delete("next");
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
