import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

type Article = {
  id: string;
  sqlite_id: number | null;
  article_id: number | null;
  category: string | null;
  published_at: string | null;
  headline: string | null;
  related: string | null;
  source: string | null;
  summary: string | null;
  full_text: string | null;
  url: string;
  label: string | null;
  inserted_at: string;
  fetch_status: string | null;
  fetch_error: string | null;
  source_domain: string | null;
  tickers: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const category = searchParams.get("category");
    const source = searchParams.get("source");
    const tickers = searchParams.get("tickers");
    const search = searchParams.get("search");
    const orderBy = searchParams.get("orderBy") || "published_at";
    const orderDirection = searchParams.get("orderDirection") || "desc";

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as unknown as ReturnType<typeof cookies>,
    });

    let query = supabase.from("articles").select("*", { count: "exact" });

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (source) {
      query = query.eq("source", source);
    }

    if (tickers) {
      // tickers is a text field, so we use ilike for case-insensitive partial matching
      const tickerArray = tickers.split(",").map((t) => t.trim().toUpperCase());
      // Match any of the provided tickers in the text field
      if (tickerArray.length === 1) {
        query = query.ilike("tickers", `%${tickerArray[0]}%`);
      } else {
        // For multiple tickers, use OR filter
        const orConditions = tickerArray
          .map((ticker) => `tickers.ilike.%${ticker}%`)
          .join(",");
        query = query.or(orConditions);
      }
    }

    // Full-text search using the tsv column
    if (search) {
      query = query.textSearch("tsv", search, {
        type: "websearch",
        config: "english",
      });
    }

    // Apply ordering
    const validOrderBy = ["published_at", "inserted_at", "headline", "source"];
    const orderByField = validOrderBy.includes(orderBy)
      ? orderBy
      : "published_at";
    const orderDir = orderDirection.toLowerCase() === "asc" ? "asc" : "desc";

    query = query
      .order(orderByField, { ascending: orderDir === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
      return NextResponse.json(
        { error: "Failed to fetch articles", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      articles: data as Article[],
      total: count ?? 0,
      offset,
      limit,
      hasMore: count ? offset + limit < count : false,
    });
  } catch (error) {
    console.error("Error in /api/articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
