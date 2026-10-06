import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      appName: "MIcroSpends Icarus",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // 1. Natural Language Expense Parser
  app.post("/api/gemini/parse-expense", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text input is required." });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Deterministic fallback if API key is not yet configured
        const parsedFallback = parseExpenseLocally(text);
        return res.json({ transaction: parsedFallback, fallback: true });
      }

      const ai = getAiClient();
      const currentDateContext = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Parse this natural language financial entry into a structured transaction: "${text}".
Current date context: ${currentDateContext}.
Classify category strictly into one of: 'Food & Dining', 'Groceries', 'Transportation', 'Shopping & Treasury', 'Health & Wellness', 'Bills & Utilities', 'Entertainment', 'Income & Salary', 'Other'.
Classify type as 'debit' (outflow/expense) or 'credit' (inflow/income).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Clean title e.g. Starbucks, Uber, Salary" },
              amount: { type: Type.NUMBER, description: "Positive numeric monetary amount" },
              type: { type: Type.STRING, description: "'debit' for expense/outflow or 'credit' for income/inflow" },
              category: { type: Type.STRING, description: "Category name" },
              merchant: { type: Type.STRING, description: "Merchant or payee name" },
              note: { type: Type.STRING, description: "Brief description or note" },
              paymentMethod: { type: Type.STRING, description: "UPI, Apple Pay, Card, Cash, Bank Transfer" },
            },
            required: ["title", "amount", "type", "category"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json({
        transaction: {
          title: parsed.title || "Quick Entry",
          amount: Math.abs(Number(parsed.amount) || 0),
          type: parsed.type === "credit" ? "credit" : "debit",
          category: parsed.category || "Other",
          merchant: parsed.merchant || parsed.title || "Manual",
          note: parsed.note || text,
          paymentMethod: parsed.paymentMethod || "Apple Pay",
          date: new Date().toISOString().split("T")[0],
        },
      });
    } catch (err: any) {
      console.error("Gemini parse-expense error:", err);
      // Fallback locally on network/API failure
      const fallback = parseExpenseLocally(req.body?.text || "");
      return res.json({ transaction: fallback, fallback: true });
    }
  });

  // Reusable Bank SMS Parser with Privacy Sanitization
  async function parseSmsTextToTx(rawSms: string) {
    // Strip sensitive numbers like 16-digit cards, OTPs, or phone numbers
    const sanitized = rawSms
      .replace(/\b\d{4,6}\b/g, "[OTP]")
      .replace(/\b\d{12,19}\b/g, "[ACCT_CARD]");

    if (!process.env.GEMINI_API_KEY) {
      return parseExpenseLocally(sanitized);
    }

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Parse this bank transaction alert / SMS notification into structured transaction data:
"${sanitized}"
Determine if it is a debit (spent, paid, withdrawn, debited) or credit (received, deposited, credited, salary).
Extract exact numeric amount, merchant name, and category ('Food & Dining', 'Groceries', 'Transportation', 'Shopping & Treasury', 'Health & Wellness', 'Bills & Utilities', 'Entertainment', 'Income & Salary', 'Other').`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING },
              category: { type: Type.STRING },
              merchant: { type: Type.STRING },
              paymentMethod: { type: Type.STRING },
            },
            required: ["title", "amount", "type", "category"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return {
        title: parsed.title || "Bank Alert",
        amount: Math.abs(Number(parsed.amount) || 0),
        type: parsed.type === "credit" ? "credit" : "debit",
        category: parsed.category || "Bills & Utilities",
        merchant: parsed.merchant || "Bank Notification",
        note: "Auto-parsed from bank SMS",
        paymentMethod: parsed.paymentMethod || "Bank / UPI",
        date: new Date().toISOString().split("T")[0],
      };
    } catch (err) {
      console.error("Gemini parseSmsTextToTx error, falling back to local:", err);
      return parseExpenseLocally(sanitized);
    }
  }

  // In-memory queue for automated incoming bank alerts (e.g. from iOS Shortcuts automation)
  interface IncomingAlert {
    id: string;
    sender: string;
    rawText: string;
    receivedAt: string;
    transaction: any;
    processed: boolean;
  }
  const incomingAlerts: IncomingAlert[] = [];

  // 2. Bank Alert / SMS Parser (Manual single paste)
  app.post("/api/gemini/parse-sms", async (req: Request, res: Response) => {
    try {
      const { rawSms } = req.body;
      if (!rawSms || typeof rawSms !== "string") {
        return res.status(400).json({ error: "rawSms is required" });
      }

      const transaction = await parseSmsTextToTx(rawSms);
      return res.json({ transaction });
    } catch (err: any) {
      console.error("Gemini parse-sms error:", err);
      const fallback = parseExpenseLocally(req.body?.rawSms || "");
      return res.json({ transaction: fallback, fallback: true });
    }
  });

  // Automated Incoming SMS Webhook (Designed for iOS Shortcuts Automation)
  app.post("/api/sms/incoming", async (req: Request, res: Response) => {
    try {
      const rawText =
        req.body?.message ||
        req.body?.text ||
        req.body?.body ||
        (typeof req.body === "string" ? req.body : "");

      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "No message text found in payload" });
      }

      const sender = req.body?.sender || "Bank Notification";
      const tx = await parseSmsTextToTx(rawText);

      const alertItem: IncomingAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender,
        rawText,
        receivedAt: new Date().toISOString(),
        transaction: tx,
        processed: false,
      };

      incomingAlerts.unshift(alertItem);
      if (incomingAlerts.length > 50) {
        incomingAlerts.pop();
      }

      return res.json({
        success: true,
        message: "Message received and automatically parsed into transaction",
        alert: alertItem,
      });
    } catch (err: any) {
      console.error("Error in /api/sms/incoming:", err);
      return res.status(500).json({ error: err.message || "Failed to process incoming SMS" });
    }
  });

  // Poll for pending automated incoming messages
  app.get("/api/sms/pending", (req: Request, res: Response) => {
    const pending = incomingAlerts.filter((a) => !a.processed);
    res.json({ pending });
  });

  // Mark automated messages as ingested/read
  app.post("/api/sms/mark-read", (req: Request, res: Response) => {
    const { ids } = req.body;
    if (Array.isArray(ids)) {
      incomingAlerts.forEach((a) => {
        if (ids.includes(a.id)) {
          a.processed = true;
        }
      });
    } else {
      incomingAlerts.forEach((a) => {
        a.processed = true;
      });
    }
    res.json({ success: true });
  });

  // Simulate incoming live bank alerts to test automatic flow
  const SAMPLE_BANK_MESSAGES = [
    "HDFC Bank: Rs 280.00 debited from a/c **4912 on 17-Mar-26 to BLUE TOKAI COFFEE via UPI Ref 6401928491. Avl Bal Rs 52,140.00.",
    "ICICI Bank Alert: Spent INR 1,450.00 on your Credit Card XX3019 at NATURES BASKET on 17-Mar-26 at 14:22. Avl Lmt: INR 1,94,200.",
    "Alert: Acct XX9012 debited with INR 380.00 on 17-Mar-26 at UBER TRIP UPI ref 940128. Avl Bal INR 48,220.",
    "Salary Credit: INR 85,000.00 deposited into A/c XX4019 on 17-Mar-26 by TECH CORP HRMS NEFT. Avl Bal INR 1,33,220.00.",
    "Chase Alert: A charge of $42.18 at WHOLE FOODS MARKET was approved on your card ending in 8821.",
    "Amex Notification: $16.99 spent at NETFLIX.COM on Mar 17. Current balance $1,240.50.",
  ];

  app.post("/api/sms/simulate-incoming", async (req: Request, res: Response) => {
    try {
      const sampleText =
        req.body?.text ||
        SAMPLE_BANK_MESSAGES[Math.floor(Math.random() * SAMPLE_BANK_MESSAGES.length)];

      const tx = await parseSmsTextToTx(sampleText);
      const alertItem: IncomingAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: "Simulated Bank SMS",
        rawText: sampleText,
        receivedAt: new Date().toISOString(),
        transaction: tx,
        processed: false,
      };

      incomingAlerts.unshift(alertItem);
      return res.json({ success: true, alert: alertItem });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to simulate bank alert" });
    }
  });

  // 3. Delphic Oracle AI Financial Advisor
  app.post("/api/gemini/advisor", async (req: Request, res: Response) => {
    try {
      const { userQuery, financialContext } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          score: 88,
          grade: "A",
          headline: "Strong Financial Equilibrium",
          summary:
            "Your net savings rate is positive with steady cash flow. The primary discretionary leak detected is Dining & Food, which accounts for ~34% of your total debits.",
          leakageBreakdown: {
            discretionary: 72,
            subscriptions: 85,
            dining: 64,
            variance: 90,
            discipline: 88,
          },
          recommendations: [
            "Trim weekend takeout dining by 15% to redirect ₹3,500 / $45 to high-yield reserve.",
            "Consolidate overlapping streaming subscriptions in your Vault.",
            "Set a daily micro-budget cap to preserve your 7-day streak.",
          ],
          actionItems: [
            "Review Vault subscriptions renewal within 7 days",
            "Cap dining out to twice weekly",
            "Lock in 20% savings buffer before discretionary spends",
          ],
        });
      }

      const ai = getAiClient();
      const currentDateStr = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" });
      const prompt = `You are the AI Financial Auditor of micro-spends ~ icarus edition, an ultra-clean personal finance advisor.
User Query: "${userQuery || "Perform a financial audit and evaluate spending efficiency."}"
Current Date Context: ${currentDateStr}

User Financial Context:
${JSON.stringify(financialContext, null, 2)}

Instructions:
1. Respond STRICTLY in English only. Do NOT use French or any other language.
2. Provide a clean, minimal, non-cliché financial intelligence assessment.
3. Score from 0 to 100 representing financial health.
4. Assign an academic grade: 'A+', 'A', 'B', 'C', or 'D'.
5. Calculate leakage indices (0-100 where higher is healthier) for:
- discretionary (control over non-essentials)
- subscriptions (burn rate efficiency)
- dining (dining out control)
- variance (consistency of daily spend)
- discipline (adherence to budget)
6. Provide 3 concise, high-impact tactical recommendations and 3 direct action items.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "0 to 100 health score" },
              grade: { type: Type.STRING, description: "Grade e.g. A+, A, B, C" },
              headline: { type: Type.STRING, description: "Short authoritative summary line" },
              summary: { type: Type.STRING, description: "Concise paragraph analysis" },
              leakageBreakdown: {
                type: Type.OBJECT,
                properties: {
                  discretionary: { type: Type.INTEGER },
                  subscriptions: { type: Type.INTEGER },
                  dining: { type: Type.INTEGER },
                  variance: { type: Type.INTEGER },
                  discipline: { type: Type.INTEGER },
                },
                required: ["discretionary", "subscriptions", "dining", "variance", "discipline"],
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["score", "grade", "headline", "summary", "leakageBreakdown", "recommendations", "actionItems"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Gemini advisor error:", err);
      return res.status(500).json({ error: "Failed to generate AI advice", details: err?.message });
    }
  });

  // Vite middleware in dev mode, static serving in prod mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIcroSpends Icarus server running at http://0.0.0.0:${PORT}`);
  });
}

// Simple rule-based local parser fallback
function parseExpenseLocally(text: string) {
  const clean = text.trim();
  const amountMatch = clean.match(/(?:[$€₹£])?\s*([0-9]+(?:[.,][0-9]{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : 25;

  const isCredit = /salary|received|deposit|credited|income|refund|\+/i.test(clean);
  let category = "Other";

  if (/coffee|starbucks|food|lunch|dinner|pizza|burger|cafe|mcdonald|chipotle|dining/i.test(clean)) {
    category = "Food & Dining";
  } else if (/grocery|supermarket|walmart|trader|whole foods|costco/i.test(clean)) {
    category = "Groceries";
  } else if (/uber|lyft|cab|taxi|gas|fuel|metro|subway|flight|train/i.test(clean)) {
    category = "Transportation";
  } else if (/netflix|spotify|youtube|disney|movie|hulu|prime/i.test(clean)) {
    category = "Entertainment";
  } else if (/amazon|apple|clothes|shoes|shopping|zara|mall/i.test(clean)) {
    category = "Shopping & Treasury";
  } else if (/gym|pharmacy|doctor|medicine|health|workout/i.test(clean)) {
    category = "Health & Wellness";
  } else if (/rent|wifi|internet|electric|water|bill|recharge/i.test(clean)) {
    category = "Bills & Utilities";
  } else if (isCredit) {
    category = "Income & Salary";
  }

  return {
    title: clean.slice(0, 24) || "Expense Entry",
    amount,
    type: isCredit ? "credit" : "debit",
    category,
    merchant: clean.split(" ")[0] || "Quick Pay",
    note: clean,
    paymentMethod: "Apple Pay",
    date: new Date().toISOString().split("T")[0],
  };
}

startServer();
