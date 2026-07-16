const { getCountdownBookById } = require("./countdown-books")
const { getEvents } = require("./event-store")

const DAY_MS = 86400000
const DEFAULT_EVENT_IMAGE = "/static/assets/create/preview-bg.jpg"

function getTodayTime() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function getTargetTime(target) {
  if (!target) {
    return getTodayTime()
  }

  return new Date(target.year, target.month - 1, target.day).getTime()
}

function getDaysLeft(target) {
  return Math.max(0, Math.ceil((getTargetTime(target) - getTodayTime()) / DAY_MS))
}

function padDateValue(value) {
  return String(value).padStart(2, "0")
}

function formatCompactDate(target) {
  if (!target) {
    return "未设置日期"
  }

  return `${target.year}.${padDateValue(target.month)}.${padDateValue(target.day)}`
}

function getInitialDays(event) {
  if (Number.isFinite(Number(event.initialDays))) {
    return Math.max(0, Number(event.initialDays))
  }

  const createdAt = new Date(event.createdAt || Date.now())
  const startTime = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).getTime()
  return Math.max(0, Math.ceil((getTargetTime(event.target) - startTime) / DAY_MS))
}

function getProgress(event, daysLeft) {
  if (event.completed) {
    return 100
  }

  const initialDays = getInitialDays(event)
  if (initialDays <= 0) {
    return daysLeft <= 0 ? 100 : 0
  }

  return Math.min(100, Math.max(0, Math.round(((initialDays - daysLeft) / initialDays) * 100)))
}

function getEventAiTip(event) {
  const text = String(event.aiReminder || event.note || "").replace(/^AI提醒[:：]\s*/, "").trim()

  if (text) {
    return text
  }

  if (event.countdownBook && event.countdownBook.id === "study") {
    return "适合完成一轮重点复盘"
  }

  if (event.countdownBook && event.countdownBook.id === "work") {
    return "建议提前确认关键交付"
  }

  if (event.countdownBook && event.countdownBook.id === "travel") {
    return "适合整理路线与行李清单"
  }

  return "适合继续推进一个小步骤"
}

function getStatusLabel(event, completed, progress) {
  if (completed) {
    return "已完成"
  }

  if (event.statusLabel) {
    return event.statusLabel
  }

  if (event.countdownBook && event.countdownBook.id === "travel") {
    return "待出发"
  }

  if (progress >= 50) {
    return "挑战中"
  }

  return "进行中"
}

function normalizeEvent(event, book) {
  const daysLeft = getDaysLeft(event.target)
  const completed = !!event.completed || daysLeft <= 0
  const bookTitle = book ? book.title : (event.countdownBook && event.countdownBook.title) || "倒数本"
  const progress = getProgress({ ...event, completed }, daysLeft)

  return {
    ...event,
    bookTitle,
    bookIcon: (event.countdownBook && event.countdownBook.iconSrc) || (book && book.iconSrc) || "/static/assets/icons/book.svg",
    aiTip: getEventAiTip(event),
    completed,
    completedDateText: `${formatCompactDate(event.target)} 完成`,
    daysLeft,
    image: (event.background && event.background.image) || DEFAULT_EVENT_IMAGE,
    progress,
    progressText: progress > 0 && !completed ? `第 ${progress} / 100 天` : "",
    statusLabel: getStatusLabel(event, completed, progress),
    targetDateCompact: formatCompactDate(event.target)
  }
}

function getBookEvents(bookId) {
  const book = getCountdownBookById(bookId)

  return getEvents()
    .filter((event) => event.countdownBook && event.countdownBook.id === bookId)
    .map((event) => normalizeEvent(event, book))
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return a.daysLeft - b.daysLeft
    })
}

function getBookSummary(bookId) {
  const book = getCountdownBookById(bookId)
  const events = getBookEvents(bookId)
  const ongoing = events.filter((event) => !event.completed)
  const completed = events.filter((event) => event.completed)
  const waitingDays = ongoing.reduce((sum, event) => sum + event.daysLeft, 0)
  const averageDays = ongoing.length ? Math.round(waitingDays / ongoing.length) : 0
  const completionRate = events.length ? Math.round((completed.length / events.length) * 100) : 0
  const urgentCount = ongoing.filter((event) => event.daysLeft <= 7).length

  return {
    book,
    completed,
    completionRate,
    events,
    averageDays,
    ongoing,
    urgentCount,
    waitingDays
  }
}

function getBookInsight(summary) {
  if (!summary || !summary.events.length) {
    return "还没有事件，先把一个期待放进这个倒数本里，AI 会在这里沉淀你的时间节奏。"
  }

  if (summary.urgentCount > 0) {
    return `最近有 ${summary.urgentCount} 个时刻即将抵达，适合提前整理准备清单，把临近的期待稳稳接住。`
  }

  if (summary.completionRate >= 50) {
    return "这个倒数本的完成节奏不错，继续保留那些值得回看的节点，让时间变成清晰的成长轨迹。"
  }

  return `平均等待 ${summary.averageDays} 天，把远方拆成几段，抵达会更轻，也更有方向感。`
}

module.exports = {
  getBookEvents,
  getBookInsight,
  getBookSummary,
  getDaysLeft
}
