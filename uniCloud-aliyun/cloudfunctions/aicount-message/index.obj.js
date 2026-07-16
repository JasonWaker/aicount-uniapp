const uniID = require("uni-id-common")

function startOfToday() {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function daysLeft(timestamp) {
  return Math.max(0, Math.ceil((timestamp - startOfToday()) / 86400000))
}

function eventMessage(event) {
  const left = daysLeft(Number(event.target_date || 0))
  if (event.status === "completed") {
    return {
      type: "completed",
      title: "时刻已完成",
      content: `${event.title} 已经被好好记录。`
    }
  }
  if (left === 0) {
    return {
      type: "today",
      title: "目标日到了",
      content: `${event.title} 就在今天，别忘了给它一点仪式感。`
    }
  }
  if (left <= 7) {
    return {
      type: "soon",
      title: "即将到来",
      content: `${event.title} 还有 ${left} 天。`
    }
  }
  return {
    type: "progress",
    title: "等待进行中",
    content: `${event.title} 还有 ${left} 天，继续稳稳靠近。`
  }
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

module.exports = {
  _before() {
    this.db = uniCloud.database()
    this.$ = this.db.command
  },

  async list() {
    const uid = await getUid(this)
    const eventsRes = await this.db.collection("aicount_events")
      .where({ user_id: uid, status: this.$.neq("deleted") })
      .orderBy("updated_at", "desc")
      .limit(50)
      .get()
    const readsRes = await this.db.collection("aicount_message_reads")
      .where({ user_id: uid })
      .get()
    const readMap = readsRes.data.reduce((map, item) => {
      map[item.message_id] = true
      return map
    }, {})
    const messages = eventsRes.data.map((event) => {
      const base = eventMessage(event)
      const id = `event-${event._id}-${base.type}`
      return {
        _id: id,
        event_id: event._id,
        created_at: event.updated_at || event.created_at,
        unread: !readMap[id],
        action_url: `/pages/event-detail/event-detail?id=${event._id}`,
        ...base
      }
    })
    return { code: 0, data: messages }
  },

  async markRead(messageId) {
    const uid = await getUid(this)
    if (!messageId) throw new Error("MESSAGE_ID_REQUIRED")
    const existed = await this.db.collection("aicount_message_reads")
      .where({ user_id: uid, message_id: messageId })
      .limit(1)
      .get()
    if (!existed.data.length) {
      await this.db.collection("aicount_message_reads").add({
        user_id: uid,
        message_id: messageId,
        read_at: Date.now()
      })
    }
    return { code: 0 }
  }
}
