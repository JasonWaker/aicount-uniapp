const https = require("https")

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
const DEFAULT_MODEL = "deepseek-v4-pro"
const MAX_TEXT_LENGTH = 500

function cleanText(value, fallback = "") {
  const text = value === undefined || value === null || value === "" ? fallback : value
  return String(text || "").trim().slice(0, MAX_TEXT_LENGTH)
}

function cleanNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function getDaysLeft(targetDate) {
  if (!targetDate) {
    return 0
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const target = new Date(targetDate.year, targetDate.month - 1, targetDate.day).getTime()
  return Math.max(0, Math.ceil((target - today) / 86400000))
}

function requestDeepSeek(body, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const request = https.request(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      },
      timeout: 50000
    }, (response) => {
      let raw = ""

      response.setEncoding("utf8")
      response.on("data", (chunk) => {
        raw += chunk
      })
      response.on("end", () => {
        let data
        try {
          data = JSON.parse(raw)
        } catch (error) {
          reject(new Error("DeepSeek returned invalid JSON"))
          return
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          const message = data && data.error && data.error.message
          reject(new Error(message || `DeepSeek request failed with status ${response.statusCode}`))
          return
        }
        resolve(data)
      })
    })

    request.on("timeout", () => {
      request.destroy(new Error("DeepSeek request timed out"))
    })
    request.on("error", reject)
    request.write(payload)
    request.end()
  })
}

function parseJsonContent(content) {
  const normalized = String(content || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
  return JSON.parse(normalized)
}

function buildTaskPrompt(context = {}) {
  const daysLeft = getDaysLeft(context.targetDate)
  const category = cleanText(context.categoryName || context.categoryId, "life")
  const eventName = cleanText(context.eventName, "important date")
  const note = cleanText(context.note, "none")
  const target = context.targetDate || {}

  return [
    "You are the task planning assistant for an AI countdown app.",
    "Based on event type, event name, note, target date and remaining days, split the goal into 4 to 6 executable stages.",
    "The tasks must cover now, mid-term, near the target date, and the target day.",
    "Write concise, concrete, action-oriented Simplified Chinese.",
    "Return only a JSON object. Do not return Markdown or extra explanation.",
    'JSON schema: {"tasks":[{"title":"stage title in Chinese","description":"specific action suggestion in Chinese","timing":"recommended timing in Chinese"}]}',
    `Event type: ${category}`,
    `Event name: ${eventName}`,
    `Note: ${note}`,
    `Target date: ${target.year || ""}-${target.month || ""}-${target.day || ""}`,
    `Remaining days: ${daysLeft}`
  ].join("\n")
}

function buildReminderPrompt(context = {}) {
  const category = cleanText(context.categoryName || context.categoryId, "life")
  const eventName = cleanText(context.eventName, "important date")
  const note = cleanText(context.note, "none")

  return [
    "You are a poetic reminder writer for an AI countdown app.",
    "Generate one warm Simplified Chinese sentence with 35 to 55 Chinese characters.",
    "Do not use a title, quotes, Markdown, or the prefix AI reminder.",
    `Event type: ${category}`,
    `Event name: ${eventName}`,
    `Note: ${note}`
  ].join("\n")
}

function buildBookInsightPrompt(context = {}) {
  const book = context.book || {}
  const metrics = context.metrics || {}
  const events = Array.isArray(context.events) ? context.events.slice(0, 10) : []
  const eventLines = events.map((item, index) => {
    const title = cleanText(item.title, "unnamed event")
    const status = item.completed ? "completed" : "ongoing"
    const daysLeft = cleanNumber(item.daysLeft)
    return `${index + 1}. ${title} / ${status} / ${daysLeft} days left`
  })

  return [
    "You are the category insight analyst for an AI countdown app.",
    "Analyze the countdown book using its profile, metrics, and event list.",
    "Write for the end user in warm, restrained, useful Simplified Chinese.",
    "Avoid exaggerated wording. Give actionable and specific observations.",
    "Return only a JSON object. Do not return Markdown or extra explanation.",
    'JSON schema: {"insight":"80 to 120 Chinese characters","highlights":["finding 1","finding 2"],"suggestions":["actionable suggestion 1","actionable suggestion 2"],"risk_level":"low|medium|high","focus":"current focus area"}',
    `Book title: ${cleanText(book.title, "unnamed book")}`,
    `Book description: ${cleanText(book.desc, "none")}`,
    `Book tone: ${cleanText(book.tone, "calm")}`,
    `Total events: ${cleanNumber(metrics.total)}`,
    `Ongoing events: ${cleanNumber(metrics.ongoing)}`,
    `Completed events: ${cleanNumber(metrics.completed)}`,
    `Waiting days: ${cleanNumber(metrics.waitingDays)}`,
    `Average days: ${cleanNumber(metrics.averageDays)}`,
    `Completion rate: ${cleanNumber(metrics.completionRate)}%`,
    `Urgent count: ${cleanNumber(metrics.urgentCount)}`,
    "Events:",
    eventLines.length ? eventLines.join("\n") : "No events"
  ].join("\n")
}

async function callDeepSeek(messages, jsonOutput) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    const error = new Error("DEEPSEEK_API_KEY is not configured")
    error.code = "DEEPSEEK_KEY_MISSING"
    throw error
  }

  const body = {
    model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
    messages,
    thinking: {
      type: "enabled"
    },
    reasoning_effort: "high",
    stream: false,
    temperature: 0.5,
    max_tokens: 1400
  }

  if (jsonOutput) {
    body.response_format = { type: "json_object" }
  }

  const response = await requestDeepSeek(body, apiKey)
  const content = response
    && response.choices
    && response.choices[0]
    && response.choices[0].message
    && response.choices[0].message.content

  if (!content) {
    throw new Error("DeepSeek returned empty content")
  }

  return {
    content,
    model: response.model || body.model
  }
}

function normalizeStringList(value, limit) {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, limit)
}

exports.main = async (event = {}) => {
  try {
    if (event.feature === "event-task-breakdown") {
      const response = await callDeepSeek([
        {
          role: "system",
          content: "You create clear and executable countdown event task stages. Always answer in Simplified Chinese."
        },
        {
          role: "user",
          content: buildTaskPrompt(event.context)
        }
      ], true)
      const parsed = parseJsonContent(response.content)
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : []

      return {
        success: true,
        provider: "deepseek",
        model: response.model,
        tasks: tasks.slice(0, 6)
      }
    }

    if (event.feature === "event-reminder") {
      const response = await callDeepSeek([
        {
          role: "system",
          content: "You write concise, visual, warm Chinese reminder copy for important dates."
        },
        {
          role: "user",
          content: buildReminderPrompt(event.context)
        }
      ], false)

      return {
        success: true,
        provider: "deepseek",
        model: response.model,
        text: response.content.trim()
      }
    }

    if (event.feature === "book-category-insight") {
      const response = await callDeepSeek([
        {
          role: "system",
          content: "You analyze countdown-book category health and planning rhythm. Always answer as strict JSON in Simplified Chinese."
        },
        {
          role: "user",
          content: buildBookInsightPrompt(event.context)
        }
      ], true)
      const parsed = parseJsonContent(response.content)
      const insight = cleanText(parsed.insight || parsed.summary || parsed.text)
      const highlights = normalizeStringList(parsed.highlights, 3)
      const suggestions = normalizeStringList(parsed.suggestions, 3)
      const riskLevel = ["low", "medium", "high"].includes(parsed.risk_level) ? parsed.risk_level : "medium"
      const focus = cleanText(parsed.focus)

      return {
        success: true,
        provider: "deepseek",
        model: response.model,
        insight,
        highlights,
        suggestions,
        risk_level: riskLevel,
        focus
      }
    }

    return {
      success: false,
      code: "AI_FEATURE_UNSUPPORTED",
      message: "Unsupported AI feature"
    }
  } catch (error) {
    console.error("DeepSeek cloud function failed", {
      feature: event.feature,
      code: error.code || "DEEPSEEK_ERROR",
      message: error.message
    })
    return {
      success: false,
      code: error.code || "DEEPSEEK_ERROR",
      message: "AI service is temporarily unavailable"
    }
  }
}
