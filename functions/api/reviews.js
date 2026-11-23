const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "https://zw.anchorstuds.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });

const avatars = new Set(["anchor","user","briefcase","code","laptop","globe","star","rocket","palette","building"]);

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers });
}

export async function onRequestGet({ env }) {
  try {
    const { results = [] } = await env.REVIEWS_DB.prepare(
      "SELECT id, display_name, avatar, rating, review_text, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 30"
    ).all();
    return json({ reviews: results });
  } catch {
    return json({ error: "Reviews are temporarily unavailable." }, 503);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const name = String(body.displayName || "").trim().replace(/\s+/g, " ");
    const review = String(body.review || "").trim();
    const avatar = String(body.avatar || "anchor");
    const rating = Number(body.rating);

    if (name.length < 2 || name.length > 40) return json({ error: "Name must be between 2 and 40 characters." }, 400);
    if (review.length < 15 || review.length > 1200) return json({ error: "Review must be between 15 and 1,200 characters." }, 400);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json({ error: "Choose a rating from 1 to 5." }, 400);
    if (!avatars.has(avatar)) return json({ error: "Choose one of the available profile icons." }, 400);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const recent = await env.REVIEWS_DB.prepare(
      "SELECT COUNT(*) AS total FROM reviews WHERE ip_hash = ? AND created_at >= datetime('now', '-1 day')"
    ).bind(await hashIp(ip)).first().catch(() => ({ total: 0 }));
    if ((recent?.total || 0) >= 3) return json({ error: "You've reached today's review submission limit. Please try again tomorrow." }, 429);

    await env.REVIEWS_DB.prepare(
      "INSERT INTO reviews (display_name, avatar, rating, review_text, status, ip_hash) VALUES (?, ?, ?, ?, 'pending', ?)"
    ).bind(name, avatar, rating, review, await hashIp(ip)).run();

    return json({ message: "Thanks for sharing your experience. Your review has been submitted for moderation." }, 201);
  } catch {
    return json({ error: "We couldn't submit your review. Please try again." }, 500);
  }
}

async function hashIp(value) {
  const bytes = new TextEncoder().encode(value + ":anchor-zimbabwe-review-v1");
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
