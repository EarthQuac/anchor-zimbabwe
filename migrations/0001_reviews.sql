CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 2 AND 40),
  avatar TEXT NOT NULL DEFAULT 'anchor' CHECK(avatar IN ('anchor','user','briefcase','code','laptop','globe','star','rocket','palette','building')),
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL CHECK(length(review_text) BETWEEN 15 AND 1200),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ip_hash TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_reviews_public ON reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_ip_date ON reviews(ip_hash, created_at);
