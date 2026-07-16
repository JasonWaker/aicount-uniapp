const cloudApi = require("../services/cloud-api")
const { getCloudTempFileURL, isCloudFileId } = require("./cloud-files")

const EVENT_STORAGE_KEY = "ai_countdown_events"

function normalizeEvents(events) {
  return Array.isArray(events)
    ? events.filter((item) => item && item.id && item.target)
    : []
}

function sortEvents(events) {
  return normalizeEvents(events)
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
}

function getEvents() {
  try {
    return sortEvents(uni.getStorageSync(EVENT_STORAGE_KEY))
  } catch (error) {
    return []
  }
}

function setEvents(events) {
  const nextEvents = sortEvents(events)
  uni.setStorageSync(EVENT_STORAGE_KEY, nextEvents)
  return nextEvents
}

function dateParts(timestamp) {
  const date = new Date(Number(timestamp || Date.now()))
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  }
}

function normalizeBackground(background = {}) {
  const image = background.image || background.image_url || ""
  const cloudFileId = background.cloudFileId || background.fileID || background.fileId || (isCloudFileId(image) ? image : "")

  return {
    type: background.type || "default",
    category: background.category || "",
    templateId: background.templateId || background.template_id || "",
    image,
    cloudFileId,
    tone: background.tone || "",
    label: background.label || ""
  }
}

function backgroundForCloud(background = {}) {
  const cloudFileId = background.cloudFileId || background.fileID || background.fileId || (isCloudFileId(background.image) ? background.image : "")
  return {
    ...background,
    image: cloudFileId || background.image || "",
    cloudFileId,
    localPreview: "",
    previewImage: ""
  }
}

async function resolveTimelinePhotos(timeline = []) {
  return Promise.all((Array.isArray(timeline) ? timeline : []).map(async (entry) => {
    const photos = Array.isArray(entry.photos) ? entry.photos : []
    const resolvedPhotos = await Promise.all(photos.map(async (photo) => {
      if (!isCloudFileId(photo)) return photo
      try {
        return await getCloudTempFileURL(photo)
      } catch (error) {
        console.warn("resolve timeline photo failed", error)
        return photo
      }
    }))
    return {
      ...entry,
      photos: resolvedPhotos
    }
  }))
}

async function resolveEventForDisplay(event) {
  const background = event && event.background ? event.background : null
  const timeline = await resolveTimelinePhotos(event && event.timeline)
  if (!background) {
    return {
      ...event,
      timeline
    }
  }

  const cloudFileId = background.cloudFileId || background.fileID || background.fileId || (isCloudFileId(background.image) ? background.image : "")
  if (!cloudFileId) {
    return {
      ...event,
      timeline
    }
  }

  try {
    const image = await getCloudTempFileURL(cloudFileId)
    return {
      ...event,
      timeline,
      background: {
        ...background,
        cloudFileId,
        image: image || background.image
      }
    }
  } catch (error) {
    console.warn("resolve event background failed", error)
    return {
      ...event,
      timeline
    }
  }
}

function resolveEventsForDisplay(events) {
  return Promise.all((Array.isArray(events) ? events : []).map(resolveEventForDisplay))
}

function mapCloudTask(task) {
  return {
    id: task._id || task.id,
    title: task.title || "",
    description: task.description || "",
    timing: task.timing || "",
    done: !!task.is_done,
    completedAt: task.done_at || null,
    provider: task.provider || "",
    model: task.model || ""
  }
}

function mapCloudTimeline(item) {
  const createdAt = Number(item.created_at || Date.now())
  const date = new Date(Number(item.record_date || createdAt))
  const photos = Array.isArray(item.photos)
    ? item.photos.map((photo) => photo.file_url || photo).filter(Boolean)
    : []

  return {
    id: item._id || item.id,
    content: item.content || "",
    dateText: `${date.getMonth() + 1}.${date.getDate()}`,
    timeText: item.record_time || "",
    photos,
    location: item.location || null,
    createdAt
  }
}

function fromCloudEvent(doc = {}) {
  const target = dateParts(doc.target_date)
  const createdAt = Number(doc.created_at || Date.now())
  const updatedAt = Number(doc.updated_at || createdAt)
  const background = doc.background || {}

  const aiTasks = Array.isArray(doc.ai_tasks) ? doc.ai_tasks.map(mapCloudTask) : []

  return {
    id: doc._id || doc.id,
    title: doc.title || "",
    note: doc.note || "",
    aiReminder: doc.ai_reminder || "",
    target,
    targetDateText: doc.target_date_text || "",
    countdownBook: {
      id: doc.book_id || "",
      title: doc.book_title || "",
      iconSrc: ""
    },
    background: normalizeBackground(background),
    theme: doc.theme_key || "",
    effect: doc.effect || {},
    reminder: doc.reminder || {},
    poster: doc.poster || null,
    pinned: !!doc.pinned,
    aiBreakdown: !!doc.ai_breakdown_enabled,
    initialDays: Number(doc.initial_days || 0),
    status: doc.status || "active",
    completedAt: doc.completed_at || null,
    aiTasks,
    aiTaskProvider: doc.ai_task_provider || (aiTasks[0] && aiTasks[0].provider) || "",
    aiTaskModel: doc.ai_task_model || (aiTasks[0] && aiTasks[0].model) || "",
    timeline: Array.isArray(doc.timeline) ? doc.timeline.map(mapCloudTimeline) : [],
    createdAt,
    updatedAt
  }
}

function toCloudEvent(event = {}) {
  const book = event.countdownBook || {}
  return {
    _id: event.id,
    id: event.id,
    title: event.title || "",
    note: event.note || "",
    target: event.target,
    targetDateText: event.targetDateText || "",
    countdownBook: {
      id: book.id || "",
      title: book.title || "",
      iconSrc: book.iconSrc || ""
    },
    background: backgroundForCloud(event.background || {}),
    theme: event.theme || "",
    effect: event.effect || {},
    reminder: event.reminder || {},
    poster: event.poster || {},
    pinned: !!event.pinned,
    aiBreakdown: !!event.aiBreakdown,
    aiReminder: event.aiReminder || "",
    initialDays: Number(event.initialDays || 0)
  }
}

async function saveEventToCloud(event, mode = "upsert") {
  if (!event || !event.id) return false
  try {
    const eventCloud = cloudApi.event()
    if (mode === "update") {
      await eventCloud.update(event.id, toCloudEvent(event))
    } else if (mode === "create") {
      try {
        await eventCloud.create(toCloudEvent(event))
      } catch (error) {
        // Retried submissions are idempotent: an existing id becomes an update.
        await eventCloud.update(event.id, toCloudEvent(event))
      }
    } else {
      try {
        await eventCloud.update(event.id, toCloudEvent(event))
      } catch (error) {
        await eventCloud.create(toCloudEvent(event))
      }
    }
    if (Array.isArray(event.aiTasks) && event.aiTasks.length) {
      await eventCloud.replaceAiTasks(event.id, event.aiTasks, {
        provider: event.aiTaskProvider || "",
        model: event.aiTaskModel || ""
      })
    }
    return true
  } catch (error) {
    console.warn("save event to cloud failed", error)
    return false
  }
}

async function refreshEventsFromCloud() {
  try {
    const cachedEvents = getEvents()
    const cachedEventMap = cachedEvents.reduce((map, event) => {
      map[event.id] = event
      return map
    }, {})
    const res = await cloudApi.event().list()
    const cloudEvents = res && res.data ? res.data : []
    const mergedEvents = cloudEvents.map((document) => {
      const cloudEvent = fromCloudEvent(document)
      const cachedEvent = cachedEventMap[cloudEvent.id]
      if (!cachedEvent) {
        return cloudEvent
      }

      const cachedTasks = Array.isArray(cachedEvent.aiTasks) ? cachedEvent.aiTasks : []
      const cachedTimeline = Array.isArray(cachedEvent.timeline) ? cachedEvent.timeline : []

      return {
        ...cloudEvent,
        aiTasks: cloudEvent.aiTasks.length ? cloudEvent.aiTasks : cachedTasks,
        aiTaskProvider: cloudEvent.aiTaskProvider || cachedEvent.aiTaskProvider || "",
        aiTaskModel: cloudEvent.aiTaskModel || cachedEvent.aiTaskModel || "",
        timeline: cloudEvent.timeline.length ? cloudEvent.timeline : cachedTimeline
      }
    })
    const displayEvents = await resolveEventsForDisplay(mergedEvents)
    return setEvents(displayEvents)
  } catch (error) {
    console.warn("refresh events from cloud failed", error)
    return getEvents()
  }
}

async function refreshEventDetailFromCloud(eventId) {
  if (!eventId) return null
  try {
    const res = await cloudApi.event().detail(eventId)
    const localEvent = getEventById(eventId)
    const cloudEvent = fromCloudEvent(res && res.data ? res.data : {})
    const shouldKeepCachedTasks = localEvent
      && Array.isArray(localEvent.aiTasks)
      && localEvent.aiTasks.length
      && (!Array.isArray(cloudEvent.aiTasks) || !cloudEvent.aiTasks.length)
    const event = shouldKeepCachedTasks
      ? {
          ...cloudEvent,
          aiTasks: localEvent.aiTasks,
          aiTaskProvider: localEvent.aiTaskProvider || "",
          aiTaskModel: localEvent.aiTaskModel || ""
        }
      : cloudEvent
    if (!event.id) return getEventById(eventId)
    const displayEvent = await resolveEventForDisplay(event)
    const events = getEvents().filter((item) => item.id !== event.id)
    setEvents([displayEvent].concat(events))
    return displayEvent
  } catch (error) {
    console.warn("refresh event detail from cloud failed", error)
    return getEventById(eventId)
  }
}

function saveEvent(event) {
  const events = getEvents().filter((item) => item.id !== event.id)
  const nextEvents = [event].concat(events)
  setEvents(nextEvents)
  Promise.resolve(saveEventToCloud(event, "create")).catch((error) => {
    console.warn("save event to cloud failed", error)
  })
  return event
}

async function saveEventAsync(event) {
  const events = getEvents().filter((item) => item.id !== event.id)
  const displayEvent = await resolveEventForDisplay(event)
  setEvents([displayEvent].concat(events))
  const cloudSaved = await saveEventToCloud(event, "create")
  if (!cloudSaved) throw new Error("EVENT_CLOUD_SAVE_FAILED")
  return displayEvent
}

function getEventById(eventId) {
  return getEvents().find((item) => item.id === eventId) || null
}

function updateEventLocally(eventId, patch) {
  const events = getEvents()
  const eventIndex = events.findIndex((item) => item.id === eventId)

  if (eventIndex < 0) {
    return null
  }

  const currentEvent = events[eventIndex]
  const nextPatch = typeof patch === "function" ? patch(currentEvent) : patch
  const nextEvent = {
    ...currentEvent,
    ...(nextPatch || {}),
    id: currentEvent.id
  }

  events[eventIndex] = nextEvent
  setEvents(events)
  return nextEvent
}

function updateEvent(eventId, patch) {
  const nextEvent = updateEventLocally(eventId, patch)
  if (nextEvent) {
    Promise.resolve(saveEventToCloud(nextEvent, "update")).catch((error) => {
      console.warn("update event in cloud failed", error)
    })
  }
  return nextEvent
}

async function updateEventAsync(eventId, patch) {
  const nextEvent = updateEventLocally(eventId, patch)
  if (!nextEvent) throw new Error("EVENT_NOT_FOUND")
  const cloudSaved = await saveEventToCloud(nextEvent, "update")
  if (!cloudSaved) throw new Error("EVENT_CLOUD_SAVE_FAILED")
  const displayEvent = await resolveEventForDisplay(nextEvent)
  updateEventLocally(eventId, displayEvent)
  return displayEvent
}

function deleteEvent(eventId) {
  const events = getEvents().filter((item) => item.id !== eventId)
  setEvents(events)
  try {
    cloudApi.event().remove(eventId)
  } catch (error) {
    console.warn("delete event from cloud failed", error)
  }
}

function addTimelineEntry(eventId, entry) {
  const nextEvent = updateEvent(eventId, (event) => ({
    timeline: [entry].concat(Array.isArray(event.timeline) ? event.timeline : [])
  }))
  try {
    Promise.resolve(cloudApi.event().addTimeline(eventId, {
      content: entry.content || "",
      record_date: entry.dateValue || entry.createdAt,
      record_time: entry.timeText || "",
      location: entry.location || null,
      photos: entry.photos || []
    })).catch((error) => {
      console.warn("add timeline to cloud failed", error)
    })
  } catch (error) {
    console.warn("add timeline to cloud failed", error)
  }
  return nextEvent
}

async function addTimelineEntryAsync(eventId, entry) {
  const nextEvent = updateEventLocally(eventId, (event) => ({
    timeline: [entry].concat(Array.isArray(event.timeline) ? event.timeline : [])
  }))
  if (!nextEvent) return null
  await cloudApi.event().addTimeline(eventId, {
    content: entry.content || "",
    record_date: entry.dateValue || entry.createdAt,
    record_time: entry.timeText || "",
    location: entry.location || null,
    photos: entry.photos || []
  })
  return nextEvent
}

async function updateTimelineEntryAsync(eventId, entryId, patch = {}) {
  const nextEvent = updateEventLocally(eventId, (event) => ({
    timeline: (Array.isArray(event.timeline) ? event.timeline : []).map((item) => (
      item.id === entryId
        ? {
            ...item,
            ...patch,
            id: item.id
          }
        : item
    ))
  }))
  if (!nextEvent) return null
  const nextEntry = (Array.isArray(nextEvent.timeline) ? nextEvent.timeline : [])
    .find((item) => item.id === entryId)
  if (!nextEntry) return null
  const payload = {
    content: nextEntry.content || "",
    record_date: nextEntry.dateValue || nextEntry.createdAt,
    record_time: nextEntry.timeText || "",
    location: nextEntry.location || null
  }
  if (Object.prototype.hasOwnProperty.call(patch, "photos")) {
    payload.photos = nextEntry.photos || []
  }
  await cloudApi.event().updateTimeline(entryId, payload)
  return nextEvent
}

async function deleteTimelineEntryAsync(eventId, entryId) {
  await cloudApi.event().deleteTimeline(entryId)
  return updateEventLocally(eventId, (event) => ({
    timeline: (Array.isArray(event.timeline) ? event.timeline : [])
      .filter((item) => item.id !== entryId)
  }))
}

function deleteTimelineEntry(eventId, entryId) {
  const nextEvent = updateEventLocally(eventId, (event) => ({
    timeline: (Array.isArray(event.timeline) ? event.timeline : [])
      .filter((item) => item.id !== entryId)
  }))
  Promise.resolve(cloudApi.event().deleteTimeline(entryId)).catch((error) => {
    console.warn("delete timeline from cloud failed", error)
  })
  return nextEvent
}

function getLatestPinnedEvent(events = getEvents()) {
  return events.find((item) => item.pinned) || null
}

function getListEvents(events = getEvents()) {
  const latestPinned = getLatestPinnedEvent(events)
  return events.filter((item) => !latestPinned || item.id !== latestPinned.id)
}

module.exports = {
  EVENT_STORAGE_KEY,
  addTimelineEntry,
  addTimelineEntryAsync,
  deleteEvent,
  deleteTimelineEntry,
  deleteTimelineEntryAsync,
  getEventById,
  getEvents,
  getLatestPinnedEvent,
  getListEvents,
  refreshEventDetailFromCloud,
  refreshEventsFromCloud,
  saveEvent,
  saveEventAsync,
  saveEventToCloud,
  updateEvent,
  updateEventAsync,
  updateTimelineEntryAsync
}
