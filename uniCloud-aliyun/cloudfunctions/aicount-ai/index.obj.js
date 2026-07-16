const uniID = require("uni-id-common")

function now() {
  return Date.now()
}

function fallbackReminder(context = {}) {
  const name = context.eventName || context.title || "这个重要时刻"
  return `AI提醒：${name}正在靠近，把今天的认真收好，等待也会慢慢长出光。`
}

function fallbackTasks(context = {}) {
  const name = context.eventName || context.title || "目标日"
  return [
    { title: "整理期待清单", description: `写下关于${name}最想完成的准备。`, timing: "从现在开始" },
    { title: "推进关键准备", description: "把最重要的安排提前确认，减少临近时的慌乱。", timing: "中期阶段" },
    { title: "复核细节", description: "检查时间、物品、人员和提醒设置。", timing: "临近目标日" },
    { title: "迎接这一刻", description: "给目标日留出一点仪式感，让它值得被记住。", timing: "目标日当天" }
  ]
}

async function getUid(context) {
  const fallbackUid = process.env.AICOUNT_DEMO_USER_ID || "demo-user"
  const token = context.getUniIdToken()
  if (!token) return fallbackUid
  try {
    const instance = uniID.createInstance({ clientInfo: context.getClientInfo() })
    const result = await instance.checkToken(token)
    return result.code ? fallbackUid : result.uid
  } catch (error) {
    console.warn("uni-id is not configured, using demo user", error.message)
    return fallbackUid
  }
}

async function writeLog(db, log) {
  try {
    await db.collection("aicount_ai_logs").add({
      ...log,
      created_at: now()
    })
  } catch (error) {
    console.error("write ai log failed", error)
  }
}

module.exports = {
  _before() {
    this.db = uniCloud.database()
  },

  async generateReminder(context = {}) {
    const uid = await getUid(this)
    try {
      const res = await uniCloud.callFunction({
        name: "deepseek-ai",
        data: {
          feature: "event-reminder",
          context
        }
      })
      const result = res.result || {}
      if (result.success && result.text) {
        await writeLog(this.db, {
          user_id: uid,
          event_id: context.eventId || "",
          feature: "event-reminder",
          provider: result.provider || "deepseek",
          model: result.model || "",
          request_payload: context,
          response_payload: result,
          status: "success"
        })
        return { code: 0, data: { text: result.text, provider: result.provider, model: result.model } }
      }
      throw new Error(result.message || "AI_REMINDER_FAILED")
    } catch (error) {
      const text = fallbackReminder(context)
      await writeLog(this.db, {
        user_id: uid,
        event_id: context.eventId || "",
        feature: "event-reminder",
        provider: "local",
        model: "",
        request_payload: context,
        response_payload: { text },
        status: "fallback",
        error_message: error.message
      })
      return { code: 0, data: { text, provider: "local", model: "" } }
    }
  },

  async generateTasks(context = {}) {
    const uid = await getUid(this)
    try {
      const res = await uniCloud.callFunction({
        name: "deepseek-ai",
        data: {
          feature: "event-task-breakdown",
          context
        }
      })
      const result = res.result || {}
      if (result.success && Array.isArray(result.tasks)) {
        await writeLog(this.db, {
          user_id: uid,
          event_id: context.eventId || "",
          feature: "event-task-breakdown",
          provider: result.provider || "deepseek",
          model: result.model || "",
          request_payload: context,
          response_payload: result,
          status: "success"
        })
        return { code: 0, data: { tasks: result.tasks, provider: result.provider, model: result.model } }
      }
      throw new Error(result.message || "AI_TASKS_FAILED")
    } catch (error) {
      const tasks = fallbackTasks(context)
      await writeLog(this.db, {
        user_id: uid,
        event_id: context.eventId || "",
        feature: "event-task-breakdown",
        provider: "local",
        model: "",
        request_payload: context,
        response_payload: { tasks },
        status: "fallback",
        error_message: error.message
      })
      return { code: 0, data: { tasks, provider: "local", model: "" } }
    }
  }
}
