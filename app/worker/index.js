const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ETF ISIN to ticker mapping
const ISIN_MAP = {
  "IE00B4L5Y983": { ticker: "IWDA.AS", name: "iShares Core MSCI World" },
  "IE00BKM4GZ66": { ticker: "EMIM.AS", name: "iShares Core MSCI EM IMI" },
  "IE00B4L5YC18": { ticker: "IEMA.AS", name: "iShares MSCI EM" },
  "IE00BJ0KDQ92": { ticker: "VWCE.AS", name: "Vanguard FTSE All-World" },
  "LU0908501215": { ticker: "XESC.DE", name: "Xtrackers Euro Stoxx 50" },
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // --- ETF PRICES ---
    if (url.pathname === "/api/etf-prices") {
      try {
        const prices = {};
        for (const [isin, info] of Object.entries(ISIN_MAP)) {
          const cacheKey = "price:" + isin;
          const cached = await env.KV.get(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.ts < 3600000) {
              prices[isin] = parsed;
              continue;
            }
          }
          const res = await fetch(
            "https://financialmodelingprep.com/api/v3/quote/" +
            info.ticker + "?apikey=" + env.FMP_API_KEY
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]) {
              const p = {
                isin, name: info.name, ticker: info.ticker,
                price: data[0].price,
                change: data[0].changesPercentage,
                ts: Date.now()
              };
              prices[isin] = p;
              await env.KV.put(cacheKey, JSON.stringify(p), { expirationTtl: 7200 });
            }
          }
        }
        return new Response(JSON.stringify(prices), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }

    // --- NEWS FEED ---
    if (url.pathname === "/api/news") {
      try {
        const body = request.method === "POST" ? await request.json() : {};
        const keywords = body.keywords || ["ETF", "MSCI World", "stock market Europe"];
        const query = keywords.slice(0, 3).join(" OR ");

        const cacheKey = "news:" + query.slice(0, 50);
        const cached = await env.KV.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.ts < 1800000) {
            return new Response(JSON.stringify(parsed.articles), {
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
            });
          }
        }

        const res = await fetch(
          "https://financialmodelingprep.com/api/v3/stock_news?limit=15&apikey=" + env.FMP_API_KEY
        );
        if (!res.ok) throw new Error("FMP news failed");
        const data = await res.json();

        const articles = data
          .filter(a => {
            const text = (a.title + " " + a.text).toLowerCase();
            return keywords.some(k => text.includes(k.toLowerCase()));
          })
          .slice(0, 10)
          .map(a => ({
            title: a.title,
            url: a.url,
            source: a.site,
            date: a.publishedDate ? a.publishedDate.slice(0, 10) : "",
            summary: a.text ? a.text.slice(0, 150) + "..." : "",
            ticker: a.symbol || "",
          }));

        await env.KV.put(cacheKey, JSON.stringify({ articles, ts: Date.now() }), { expirationTtl: 3600 });

        return new Response(JSON.stringify(articles), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify([]), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Life Hub API", { headers: CORS_HEADERS });
  }
};
