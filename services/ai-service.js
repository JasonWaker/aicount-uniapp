const cloudApi = require("./cloud-api")

const DEFAULT_TIMEOUT = 20000

let config = {
  cloudFunctionName: "deepseek-ai",
  endpoint: "",
  headers: {},
  timeout: DEFAULT_TIMEOUT,
  useCloudFunction: true
}

function configureAiService(nextConfig = {}) {
  config = {
    ...config,
    ...nextConfig,
    headers: {
      ...config.headers,
      ...(nextConfig.headers || {})
    }
  }
}

function getDaysLeft(targetDate) {
  if (!targetDate) return 0
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const target = new Date(targetDate.year, targetDate.month - 1, targetDate.day).getTime()
  return Math.max(0, Math.ceil((target - today) / 86400000))
}

function generateLocalReminder({ categoryId, eventName }) {
  const name = eventName || "\u8fd9\u4e2a\u91cd\u8981\u65f6\u523b"
  const templates = {
    travel: `\u98ce\u5df2\u7ecf\u5148\u4e00\u6b65\u62b5\u8fbe\u8fdc\u65b9\uff0c\u7b49${name}\u542f\u7a0b\u65f6\uff0c\u5c71\u6d77\u4f1a\u4e3a\u4f60\u94fa\u5f00\u65b0\u7684\u7ae0\u8282\u3002`,
    work: `${name}\u4e0d\u662f\u7ec8\u70b9\uff0c\u800c\u662f\u52aa\u529b\u843d\u7b14\u6210\u7ae0\u3001\u5149\u8292\u88ab\u770b\u89c1\u7684\u90a3\u4e00\u523b\u3002`,
    study: `\u6bcf\u4e00\u6b21\u9759\u5fc3\u79ef\u7d2f\u90fd\u5728\u9760\u8fd1${name}\uff0c\u4e66\u9875\u7ffb\u8fc7\u7684\u5730\u65b9\uff0c\u672a\u6765\u6b63\u6084\u6084\u53d1\u4eae\u3002`,
    anniversary: `${name}\u6536\u85cf\u7740\u65f6\u5149\u7559\u4e0b\u7684\u6e29\u67d4\uff0c\u7b49\u90a3\u4e00\u5929\u62b5\u8fbe\uff0c\u56de\u5fc6\u4f1a\u518d\u6b21\u5f00\u82b1\u3002`,
    life: `${name}\u6b63\u6cbf\u7740\u65e5\u5e38\u7684\u5149\u7f13\u7f13\u8d70\u6765\uff0c\u5e73\u51e1\u7684\u671f\u5f85\u4e5f\u4f1a\u5728\u90a3\u5929\u95ea\u95ea\u53d1\u4eae\u3002`
  }
  return `AI\u63d0\u9192\uff1a${templates[categoryId] || templates.life}`
}

function generateLocalTaskBreakdown(context = {}) {
  const daysLeft = getDaysLeft(context.targetDate)
  const timingLabels = [
    "\u4ece\u73b0\u5728\u5f00\u59cb",
    daysLeft > 30 ? `\u8ddd\u79bb\u76ee\u6807\u7ea6 ${Math.max(14, Math.floor(daysLeft / 2))} \u5929` : "\u8fdb\u5165\u4e2d\u6bb5\u65f6",
    daysLeft > 7 ? "\u8ddd\u79bb\u76ee\u6807 7 \u5929" : "\u4e34\u8fd1\u76ee\u6807\u65e5",
    "\u76ee\u6807\u65e5\u5f53\u5929"
  ]
  const templates = [
    ["\u6574\u7406\u671f\u5f85\u6e05\u5355", "\u5199\u4e0b\u60f3\u5b8c\u6210\u7684\u5c0f\u4e8b\uff0c\u8ba9\u7b49\u5f85\u6709\u6e05\u6670\u65b9\u5411\u3002"],
    ["\u63a8\u8fdb\u5173\u952e\u51c6\u5907", "\u63d0\u524d\u786e\u8ba4\u91cd\u8981\u5b89\u6392\uff0c\u4e3a\u76ee\u6807\u65e5\u7559\u51fa\u4ece\u5bb9\u4f59\u91cf\u3002"],
    ["\u590d\u6838\u7ec6\u8282", "\u68c0\u67e5\u65f6\u95f4\u3001\u7269\u54c1\u3001\u4eba\u5458\u548c\u63d0\u9192\u8bbe\u7f6e\u3002"],
    ["\u8fce\u63a5\u8fd9\u4e00\u523b", "\u5b89\u6392\u4e00\u4e2a\u5c5e\u4e8e\u81ea\u5df1\u7684\u5c0f\u5c0f\u4eea\u5f0f\u3002"]
  ]
  return templates.map(([title, description], index) => ({
    id: `task-${index + 1}`,
    title,
    description,
    timing: timingLabels[index],
    done: false
  }))
}

function requestCloudAi(payload) {
  return new Promise((resolve, reject) => {
    if (typeof uniCloud === "undefined" || typeof uniCloud.callFunction !== "function") {
      reject(new Error("uniCloud is unavailable"))
      return
    }
    uniCloud.callFunction({
      name: config.cloudFunctionName,
      data: payload,
      success: ({ result }) => {
        if (result && result.success !== false) {
          resolve(result)
          return
        }
        reject(new Error((result && result.message) || "AI cloud function failed"))
      },
      fail: reject
    })
  })
}

function requestHttpAi(payload) {
  return new Promise((resolve, reject) => {
    if (!config.endpoint) {
      reject(new Error("AI proxy endpoint is not configured"))
      return
    }
    uni.request({
      url: config.endpoint,
      method: "POST",
      header: config.headers,
      data: payload,
      timeout: config.timeout,
      success: ({ statusCode, data }) => {
        if (statusCode >= 200 && statusCode < 300) {
          resolve(data)
          return
        }
        reject(new Error(`AI request failed with status ${statusCode}`))
      },
      fail: reject
    })
  })
}

function requestAi(payload) {
  return config.useCloudFunction ? requestCloudAi(payload) : requestHttpAi(payload)
}

async function generateEventReminder(context) {
  const prefix = "AI\u63d0\u9192\uff1a"
  try {
    const cloudResponse = await cloudApi.ai().generateReminder(context)
    const cloudText = cloudResponse && cloudResponse.data && cloudResponse.data.text
    if (typeof cloudText === "string" && cloudText.trim()) {
      return cloudText.startsWith(prefix) ? cloudText.trim() : `${prefix}${cloudText.trim()}`
    }
  } catch (error) {}

  try {
    const response = await requestAi({ feature: "event-reminder", context })
    const text = response && (response.text || response.content || response.message)
    if (typeof text === "string" && text.trim()) {
      return text.startsWith(prefix) ? text.trim() : `${prefix}${text.trim()}`
    }
  } catch (error) {}

  return generateLocalReminder(context)
}

function normalizeTasks(tasks, meta = {}) {
  const normalizedTasks = tasks.slice(0, 6).map((task, index) => ({
    id: task.id || `task-${index + 1}`,
    title: task.title || task.name || `Stage ${index + 1}`,
    description: task.description || task.content || "",
    timing: task.timing || task.time || "\u6309\u8ba1\u5212\u8fdb\u884c",
    done: !!task.done
  }))
  normalizedTasks.provider = meta.provider || "remote"
  normalizedTasks.model = meta.model || ""
  return normalizedTasks
}

async function generateTaskBreakdown(context) {
  try {
    const cloudResponse = await cloudApi.ai().generateTasks(context)
    const payload = cloudResponse && cloudResponse.data
    if (payload && Array.isArray(payload.tasks) && payload.tasks.length) {
      return normalizeTasks(payload.tasks, payload)
    }
  } catch (error) {}

  try {
    const response = await requestAi({ feature: "event-task-breakdown", context })
    const tasks = response && (response.tasks || response.data)
    if (Array.isArray(tasks) && tasks.length) {
      return normalizeTasks(tasks, response)
    }
  } catch (error) {}

  const localTasks = generateLocalTaskBreakdown(context)
  localTasks.provider = "local"
  localTasks.model = ""
  return localTasks
}

module.exports = {
  configureAiService,
  generateEventReminder,
  generateLocalReminder,
  generateLocalTaskBreakdown,
  generateTaskBreakdown,
  requestAi
}
