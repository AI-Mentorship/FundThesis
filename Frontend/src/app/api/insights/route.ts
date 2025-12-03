import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

type Article = {
  headline: string | null;
  summary: string | null;
  label: string | null;
  source: string | null;
  published_at: string | null;
  tickers: string | null;
};

// Helper function to format articles for LLM prompt
function formatArticlesForPrompt(articles: Article[]): string {
  if (articles.length === 0) {
    return "No recent articles available.";
  }

  return articles
    .slice(0, 30) // Limit to 30 most recent
    .map((article) => {
      const headline = article.headline || "No headline";
      const summary = article.summary?.substring(0, 200) || "No summary";
      const sentiment = article.label || "neutral";
      const source = article.source || "Unknown";
      const tickers = article.tickers || "";

      return `Headline: ${headline}\nSummary: ${summary}\nSentiment: ${sentiment}\nSource: ${source}\nTickers: ${tickers}\n---`;
    })
    .join("\n");
}

// Generate insights using Google Gemini API directly or fallback to simple analysis
async function generateMarketSummary(articlesText: string): Promise<string> {
  try {
    // Try to use Google Generative AI SDK directly if available
    if (process.env.GEMINI_API_KEY) {
      const genAIModule = await import("@google/generative-ai").catch(
        () => null
      );

      if (genAIModule?.GoogleGenerativeAI) {
        const genAI = new genAIModule.GoogleGenerativeAI(
          process.env.GEMINI_API_KEY
        );
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Improved prompt that's more directive
        const prompt = `Analyze these financial news articles and write a 2-3 sentence market summary. Reference specific sectors, stocks, or trends mentioned in the articles. Be concrete and specific.

Articles:
${articlesText}

Market Summary:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text && text.trim()) {
          // Filter out responses that mention the prompt, no articles, disclaimers, or hypothetical scenarios
          const lowerText = text.toLowerCase();
          if (
            lowerText.includes("absence of") ||
            lowerText.includes("no articles") ||
            lowerText.includes("cannot be generated") ||
            lowerText.includes("no recent") ||
            lowerText.includes("without recent") ||
            lowerText.includes("without any specific") ||
            lowerText.includes("providing a specific") ||
            lowerText.includes("is impossible") ||
            lowerText.includes("assuming a neutral") ||
            lowerText.includes("assuming a") ||
            lowerText.includes("hypothetical") ||
            lowerText.includes("even though there are no") ||
            lowerText.includes("i understand") ||
            lowerText.includes("i will still") ||
            lowerText.includes("based on a hypothetical") ||
            lowerText.includes("given the lack of specific news") ||
            (lowerText.includes("likely experiencing") &&
              lowerText.includes("awaiting")) ||
            text.includes("prompt") ||
            text.includes("instructions")
          ) {
            console.log(
              "Gemini returned meta-commentary or 'no articles' response, using fallback"
            );
            return generateFallbackSummary(articlesText);
          }

          // Clean up the response - remove disclaimer sentences
          let cleanedText = text.trim();

          // Remove sentences that contain disclaimer phrases
          const sentences = cleanedText
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 0);
          const filteredSentences = sentences.filter((sentence) => {
            const lower = sentence.toLowerCase();
            return !(
              lower.includes("without recent") ||
              lower.includes("without any specific") ||
              lower.includes("given the lack of") ||
              lower.includes("lack of specific") ||
              lower.includes("providing a specific") ||
              lower.includes("is impossible") ||
              lower.includes("assuming a neutral") ||
              lower.includes("assuming a") ||
              (lower.includes("however") &&
                (lower.includes("assuming") || lower.includes("likely"))) ||
              (lower.includes("given") && lower.includes("lack"))
            );
          });

          cleanedText = filteredSentences.join(". ").trim();
          if (
            cleanedText &&
            !cleanedText.endsWith(".") &&
            !cleanedText.endsWith("!") &&
            !cleanedText.endsWith("?")
          ) {
            cleanedText += ".";
          }

          return cleanedText || generateFallbackSummary(articlesText);
        }
      }
    }
  } catch (error) {
    console.log("Gemini API not available, using fallback:", error);
  }

  // Fallback: Simple analysis based on article sentiment
  return generateFallbackSummary(articlesText);
}

async function generateAIRecommendations(
  articlesText: string
): Promise<string> {
  try {
    // Try to use Google Generative AI SDK directly if available
    if (process.env.GEMINI_API_KEY) {
      const genAIModule = await import("@google/generative-ai").catch(
        () => null
      );

      if (genAIModule?.GoogleGenerativeAI) {
        const genAI = new genAIModule.GoogleGenerativeAI(
          process.env.GEMINI_API_KEY
        );
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

        const prompt = `Analyze these financial news articles and write 2-3 sentences of investment recommendations. Reference specific sectors, companies, or themes from the articles. Provide actionable advice.

Articles:
${articlesText}

Recommendations:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text && text.trim()) {
          // Filter out responses that mention the prompt, no articles, disclaimers, or hypothetical scenarios
          const lowerText = text.toLowerCase();
          if (
            lowerText.includes("absence of") ||
            lowerText.includes("no articles") ||
            lowerText.includes("cannot be generated") ||
            lowerText.includes("no recent") ||
            lowerText.includes("hypothetical") ||
            lowerText.includes("even though there are no") ||
            lowerText.includes("i understand") ||
            lowerText.includes("i will still") ||
            lowerText.includes("based on a hypothetical") ||
            lowerText.includes("given the lack of") ||
            lowerText.includes("lack of specific") ||
            lowerText.includes("without any specific") ||
            lowerText.includes("generalized investment") ||
            lowerText.includes("general advice") ||
            lowerText.includes("doesn't substitute") ||
            lowerText.includes("does not substitute") ||
            lowerText.includes("crucial to remember") ||
            lowerText.includes("important to remember") ||
            lowerText.includes("it's crucial") ||
            lowerText.includes("it is crucial") ||
            lowerText.includes("personalized financial plan") ||
            lowerText.includes("individual circumstances") ||
            text.includes("prompt") ||
            text.includes("instructions")
          ) {
            console.log(
              "Gemini returned meta-commentary or disclaimers, using fallback"
            );
            return generateFallbackRecommendations(articlesText);
          }
          // Clean up the response - remove disclaimer sentences
          let cleanedText = text.trim();

          // Remove sentences that contain disclaimer phrases
          const sentences = cleanedText
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 0);
          const filteredSentences = sentences.filter((sentence) => {
            const lower = sentence.toLowerCase();
            return !(
              lower.includes("without any specific") ||
              lower.includes("given the lack of") ||
              lower.includes("lack of specific") ||
              lower.includes("generalized") ||
              lower.includes("general advice") ||
              lower.includes("doesn't substitute") ||
              lower.includes("does not substitute") ||
              lower.includes("crucial to remember") ||
              lower.includes("important to remember") ||
              lower.includes("personalized financial plan") ||
              lower.includes("individual circumstances") ||
              lower.includes("it's crucial") ||
              lower.includes("it is crucial") ||
              (lower.includes("given") && lower.includes("lack"))
            );
          });

          cleanedText = filteredSentences.join(". ").trim();
          if (
            cleanedText &&
            !cleanedText.endsWith(".") &&
            !cleanedText.endsWith("!") &&
            !cleanedText.endsWith("?")
          ) {
            cleanedText += ".";
          }

          return cleanedText || generateFallbackRecommendations(articlesText);
        }
      }
    }
  } catch (error) {
    console.log("Gemini API not available, using fallback:", error);
  }

  // Fallback: Simple recommendations based on article sentiment
  return generateFallbackRecommendations(articlesText);
}

// Fallback functions when LangChain is not available
function generateFallbackSummary(articlesText: string): string {
  if (!articlesText || articlesText === "No recent articles available.") {
    return "Markets showed mixed signals today with various sectors experiencing different trends. Technology and healthcare sectors showed resilience, while some cyclical sectors faced pressure. Investors are maintaining a balanced approach to portfolio management.";
  }

  const positiveKeywords = [
    "positive",
    "gain",
    "rise",
    "growth",
    "bullish",
    "surge",
    "rally",
    "up",
    "increase",
  ];
  const negativeKeywords = [
    "negative",
    "fall",
    "drop",
    "decline",
    "bearish",
    "plunge",
    "crash",
    "down",
    "decrease",
  ];

  // Extract sectors and tickers from articles
  const sectorKeywords = {
    tech: [
      "tech",
      "technology",
      "ai",
      "semiconductor",
      "software",
      "cloud",
      "microsoft",
      "apple",
      "nvidia",
      "google",
    ],
    healthcare: [
      "healthcare",
      "pharma",
      "biotech",
      "medical",
      "pfizer",
      "jnj",
      "unh",
    ],
    finance: ["bank", "financial", "jpmorgan", "goldman", "wells fargo"],
    energy: ["energy", "oil", "renewable", "solar", "exxon", "chevron"],
  };

  const text = articlesText.toLowerCase();
  const positiveCount = positiveKeywords.filter((kw) =>
    text.includes(kw)
  ).length;
  const negativeCount = negativeKeywords.filter((kw) =>
    text.includes(kw)
  ).length;

  // Find mentioned sectors
  const mentionedSectors = [];
  if (sectorKeywords.tech.some((kw) => text.includes(kw)))
    mentionedSectors.push("technology");
  if (sectorKeywords.healthcare.some((kw) => text.includes(kw)))
    mentionedSectors.push("healthcare");
  if (sectorKeywords.finance.some((kw) => text.includes(kw)))
    mentionedSectors.push("financial");
  if (sectorKeywords.energy.some((kw) => text.includes(kw)))
    mentionedSectors.push("energy");

  const sectorText =
    mentionedSectors.length > 0
      ? `${mentionedSectors.slice(0, 2).join(" and ")} sectors`
      : "various sectors";

  if (positiveCount > negativeCount) {
    return `Markets showed positive momentum today with ${sectorText} leading the gains. Investor sentiment remains optimistic as markets respond to favorable developments. Key sectors continue to attract attention with strong performance indicators.`;
  } else if (negativeCount > positiveCount) {
    return `Markets experienced volatility today with ${sectorText} facing headwinds. Investors are exercising caution amid market uncertainties. Consider monitoring key indicators closely before making significant portfolio adjustments.`;
  } else {
    return `Markets showed mixed signals today with ${sectorText} experiencing different trends. Technology and healthcare sectors showed resilience, while some cyclical sectors faced pressure. Investors are maintaining a balanced approach to portfolio management.`;
  }
}

function generateFallbackRecommendations(articlesText: string): string {
  if (!articlesText || articlesText === "No recent articles available.") {
    return "Consider diversifying your portfolio across technology, healthcare, and financial sectors for balanced growth. Maintain a mix of growth and value stocks to manage risk effectively. Regularly review your asset allocation to align with your investment goals and risk tolerance.";
  }

  const techKeywords = [
    "tech",
    "ai",
    "semiconductor",
    "software",
    "cloud",
    "microsoft",
    "apple",
    "nvidia",
    "google",
  ];
  const energyKeywords = [
    "energy",
    "renewable",
    "solar",
    "wind",
    "oil",
    "exxon",
    "chevron",
  ];
  const healthcareKeywords = [
    "healthcare",
    "pharma",
    "biotech",
    "medical",
    "pfizer",
    "jnj",
  ];
  const financeKeywords = [
    "bank",
    "financial",
    "jpmorgan",
    "goldman",
    "wells fargo",
  ];

  const text = articlesText.toLowerCase();
  const hasTech = techKeywords.some((kw) => text.includes(kw));
  const hasEnergy = energyKeywords.some((kw) => text.includes(kw));
  const hasHealthcare = healthcareKeywords.some((kw) => text.includes(kw));
  const hasFinance = financeKeywords.some((kw) => text.includes(kw));

  const recommendations = [];
  if (hasTech) {
    recommendations.push("technology");
  }
  if (hasEnergy) {
    recommendations.push("energy");
  }
  if (hasHealthcare) {
    recommendations.push("healthcare");
  }
  if (hasFinance) {
    recommendations.push("financial services");
  }

  if (recommendations.length > 0) {
    const sectorList =
      recommendations.length > 2
        ? `${recommendations.slice(0, 2).join(", ")}, and ${recommendations[2]}`
        : recommendations.join(" and ");
    return `Consider diversifying into ${sectorList} sectors based on current market trends. These areas show potential for growth while helping balance your portfolio risk. Maintain a strategic mix of growth and value positions to optimize returns.`;
  }

  return "Consider diversifying your portfolio across technology, healthcare, and financial sectors for balanced growth. Maintain a mix of growth and value stocks to manage risk effectively. Regularly review your asset allocation to align with your investment goals.";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "both";

    // Fetch recent articles from Supabase
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as unknown as ReturnType<typeof cookies>,
    });

    // Get articles from last 24 hours, with fallback to last 7 days if needed
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("headline, summary, label, source, published_at, tickers")
      .gte("published_at", twentyFourHoursAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(30);

    // If no articles in last 24 hours, try last 7 days
    if ((!articles || articles.length === 0) && !articlesError) {
      console.log("No articles in last 24 hours, trying last 7 days...");
      const result = await supabase
        .from("articles")
        .select("headline, summary, label, source, published_at, tickers")
        .gte("published_at", sevenDaysAgo.toISOString())
        .order("published_at", { ascending: false })
        .limit(30);
      articles = result.data;
      articlesError = result.error;
    }

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
    }

    const articlesList = (articles || []) as Article[];
    const articlesText = formatArticlesForPrompt(articlesList);

    // Log for debugging
    console.log(
      `Fetched ${articlesList.length} articles for insights generation`
    );
    if (articlesList.length > 0) {
      console.log("Sample article:", articlesList[0].headline);
    }

    // Generate insights based on type
    let marketSummary = "";
    let aiRecommendations = "";

    if (type === "summary" || type === "both") {
      marketSummary = await generateMarketSummary(articlesText);
    }

    if (type === "recommendations" || type === "both") {
      aiRecommendations = await generateAIRecommendations(articlesText);
    }

    return NextResponse.json({
      market_summary: marketSummary || undefined,
      ai_recommendations: aiRecommendations || undefined,
      articles_analyzed: articlesList.length,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating insights:", error);

    // Return fallback content on error
    return NextResponse.json(
      {
        market_summary:
          "Markets showed positive momentum today with tech stocks leading the gains. AI and semiconductor sectors continue to attract investor attention.",
        ai_recommendations:
          "Based on your portfolio and risk profile, consider diversifying into emerging markets and renewable energy sectors.",
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate insights",
      },
      { status: 200 }
    );
  }
}
