const uniID = require("uni-id-common")

function now() {
  return Date.now()
}

function toTargetTimestamp(target) {
  if (!target) return 0
  if (typeof target === "number") return target
  if (typeof target === "string") {
    const parsed = new Date(target).getTime()
    return Number.isFinite(parsed) ? parsed : 0
  }
  const year = Number(target.year)
  const month = Number(target.month)
  const day = Number(target.day)
  if (!year || !month || !day) return 0
  return new Date(year, month - 1, day).getTime()
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function cleanEvent(data = {}) {
  const targetDate = toTargetTimestamp(data.target_date || data.target)
  if (!String(data.title || "").trim()) throw new Error("EVENT_TITLE_REQUIRED")
  if (!targetDate) throw new Error("EVENT_TARGET_DATE_REQUIRED")
  return {
    book_id: String(data.book_id || (data.countdownBook && data.countdownBook.id) || ""),
    book_title: String(data.book_title || (data.countdownBook && data.countdownBook.title) || ""),
    title: String(data.title || "").trim(),
    note: String(data.note || "").trim(),
    target_date: targetDate,
    target_date_text: String(data.target_date_text || data.targetDateText || formatDate(targetDate)),
    initial_days: Number(data.initial_days || data.initialDays || 0),
    pinned: !!data.pinned,
    ai_breakdown_enabled: !!(data.ai_breakdown_enabled || data.aiBreakdown),
    ai_reminder: String(data.ai_reminder || data.aiReminder || ""),
    background: data.background || {},
    theme_key: String(data.theme_key || data.theme || ""),
    effect: data.effect || {},
    reminder: data.reminder || {},
    poster: data.poster || {},
    event_icon_key: String(data.event_icon_key || data.iconKey || "")
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

async function assertEventOwner(context, eventId, uid) {
  const res = await context.db.collection("aicount_events")
    .where({ _id: eventId, user_id: uid, status: context.$.neq("deleted") })
    .limit(1)
    .get()
  if (!res.data.length) throw new Error("EVENT_NOT_FOUND")
  return res.data[0]
}

async function assertTimelineOwner(context, timelineId, uid) {
  const res = await context.db.collection("aicount_event_timeline")
    .where({ _id: timelineId, user_id: uid })
    .limit(1)
    .get()
  if (!res.data.length) throw new Error("TIMELINE_NOT_FOUND")
  return res.data[0]
}

module.exports = {
  _before() {
    this.db = uniCloud.database()
    this.$ = this.db.command
  },

  async list(query = {}) {
    const uid = await getUid(this)
    const where = {
      user_id: uid,
      status: query.status || this.$.neq("deleted")
    }
    if (query.book_id) where.book_id = String(query.book_id)
    const res = await this.db.collection("aicount_events")
      .where(where)
      .orderBy("pinned", "desc")
      .orderBy("created_at", "desc")
      .get()
    return { code: 0, data: res.data }
  },

  async detail(eventId) {
    const uid = await getUid(this)
    const event = await assertEventOwner(this, eventId, uid)
    const tasksRes = await this.db.collection("aicount_event_ai_tasks")
      .where({ event_id: eventId, user_id: uid })
      .orderBy("sort_order", "asc")
      .get()
    const timelineRes = await this.db.collection("aicount_event_timeline")
      .where({ event_id: eventId, user_id: uid })
      .orderBy("created_at", "desc")
      .get()
    const timelineIds = timelineRes.data.map((item) => item._id)
    let photos = []
    if (timelineIds.length) {
      const photosRes = await this.db.collection("aicount_event_photos")
        .where({ timeline_id: this.$.in(timelineIds), user_id: uid })
        .orderBy("sort_order", "asc")
        .get()
      photos = photosRes.data
    }
    const photoMap = photos.reduce((map, item) => {
      if (!map[item.timeline_id]) map[item.timeline_id] = []
      map[item.timeline_id].push(item)
      return map
    }, {})
    return {
      code: 0,
      data: {
        ...event,
        ai_tasks: tasksRes.data,
        timeline: timelineRes.data.map((item) => ({
          ...item,
          photos: photoMap[item._id] || []
        }))
      }
    }
  },

  async create(data = {}) {
    const uid = await getUid(this)
    const payload = {
      ...cleanEvent(data),
      user_id: uid,
      status: "active",
      created_at: now(),
      updated_at: now()
    }
    if (data._id || data.id) {
      payload._id = data._id || data.id
    }
    const res = await this.db.collection("aicount_events").add(payload)
    return { code: 0, data: { _id: res.id, ...payload } }
  },

  async update(eventId, data = {}) {
    const uid = await getUid(this)
    await assertEventOwner(this, eventId, uid)
    const patch = {
      ...cleanEvent(data),
      updated_at: now()
    }
    await this.db.collection("aicount_events").doc(eventId).update(patch)
    return { code: 0 }
  },

  async remove(eventId) {
    const uid = await getUid(this)
    await assertEventOwner(this, eventId, uid)
    await this.db.collection("aicount_events").doc(eventId).update({
      status: "deleted",
      updated_at: now()
    })
    return { code: 0 }
  },

  async complete(eventId) {
    const uid = await getUid(this)
    await assertEventOwner(this, eventId, uid)
    await this.db.collection("aicount_events").doc(eventId).update({
      status: "completed",
      completed_at: now(),
      updated_at: now()
    })
    return { code: 0 }
  },

  async replaceAiTasks(eventId, tasks = [], meta = {}) {
    const uid = await getUid(this)
    await assertEventOwner(this, eventId, uid)
    const existed = await this.db.collection("aicount_event_ai_tasks")
      .where({ event_id: eventId, user_id: uid })
      .get()
    await Promise.all(existed.data.map((item) => this.db.collection("aicount_event_ai_tasks").doc(item._id).remove()))
    const normalized = (Array.isArray(tasks) ? tasks : []).slice(0, 8).map((task, index) => ({
      event_id: eventId,
      user_id: uid,
      title: String(task.title || task.name || `Task ${index + 1}`),
      description: String(task.description || task.content || ""),
      timing: String(task.timing || task.time || ""),
      sort_order: index + 1,
      is_done: !!task.is_done || !!task.done,
      done_at: task.done_at || (task.done ? now() : null),
      provider: meta.provider || task.provider || "",
      model: meta.model || task.model || "",
      created_at: now(),
      updated_at: now()
    }))
    if (normalized.length) {
      await Promise.all(normalized.map((item) => this.db.collection("aicount_event_ai_tasks").add(item)))
    }
    return { code: 0, data: normalized }
  },

  async completeAiTask(taskId) {
    const uid = await getUid(this)
    const taskRes = await this.db.collection("aicount_event_ai_tasks")
      .where({ _id: taskId, user_id: uid })
      .limit(1)
      .get()
    if (!taskRes.data.length) throw new Error("TASK_NOT_FOUND")
    if (taskRes.data[0].is_done) return { code: 0 }
    await this.db.collection("aicount_event_ai_tasks").doc(taskId).update({
      is_done: true,
      done_at: now(),
      updated_at: now()
    })
    return { code: 0 }
  },

  async addTimeline(eventId, data = {}) {
    const uid = await getUid(this)
    await assertEventOwner(this, eventId, uid)
    const entry = {
      event_id: eventId,
      user_id: uid,
      content: String(data.content || ""),
      record_date: toTargetTimestamp(data.record_date || data.date) || now(),
      record_time: String(data.record_time || data.time || ""),
      location: data.location || null,
      created_at: now(),
      updated_at: now()
    }
    const res = await this.db.collection("aicount_event_timeline").add(entry)
    const timelineId = res.id
    const photos = Array.isArray(data.photos) ? data.photos : []
    if (photos.length) {
      const rows = photos.map((fileUrl, index) => ({
        timeline_id: timelineId,
        event_id: eventId,
        user_id: uid,
        file_url: String(fileUrl),
        sort_order: index + 1,
        created_at: now()
      }))
      await Promise.all(rows.map((item) => this.db.collection("aicount_event_photos").add(item)))
    }
    return { code: 0, data: { _id: timelineId, ...entry, photos } }
  },

  async updateTimeline(timelineId, data = {}) {
    const uid = await getUid(this)
    const timeline = await assertTimelineOwner(this, timelineId, uid)
    await assertEventOwner(this, timeline.event_id, uid)
    const patch = {
      content: String(data.content || ""),
      record_date: toTargetTimestamp(data.record_date || data.date) || timeline.record_date || now(),
      record_time: String(data.record_time || data.time || ""),
      location: data.location || null,
      updated_at: now()
    }
    await this.db.collection("aicount_event_timeline").doc(timelineId).update(patch)

    let photos
    if (Array.isArray(data.photos)) {
      const existedPhotos = await this.db.collection("aicount_event_photos")
        .where({ timeline_id: timelineId, user_id: uid })
        .get()
      await Promise.all(existedPhotos.data.map((item) => (
        this.db.collection("aicount_event_photos").doc(item._id).remove()
      )))

      photos = data.photos
      if (photos.length) {
        const rows = photos.map((fileUrl, index) => ({
          timeline_id: timelineId,
          event_id: timeline.event_id,
          user_id: uid,
          file_url: String(fileUrl),
          sort_order: index + 1,
          created_at: now()
        }))
        await Promise.all(rows.map((item) => this.db.collection("aicount_event_photos").add(item)))
      }
    }

    return { code: 0, data: { _id: timelineId, ...timeline, ...patch, photos: photos || null } }
  },

  async deleteTimeline(timelineId) {
    const uid = await getUid(this)
    const timeline = await assertTimelineOwner(this, timelineId, uid)
    await assertEventOwner(this, timeline.event_id, uid)
    const photos = await this.db.collection("aicount_event_photos")
      .where({ timeline_id: timelineId, user_id: uid })
      .get()
    await Promise.all(photos.data.map((item) => (
      this.db.collection("aicount_event_photos").doc(item._id).remove()
    )))
    await this.db.collection("aicount_event_timeline").doc(timelineId).remove()
    return { code: 0 }
  }
}
