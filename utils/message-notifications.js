const { getDaysLeft } = require("./book-events")
const { getEvents } = require("./event-store")

function formatRelativeTime(timestamp) {
  const time = Number(timestamp || 0)

  if (!time) {
    return "刚刚"
  }

  const diff = Math.max(0, Date.now() - time)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return "刚刚"
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  }

  if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  }

  return "较早"
}

function getBookTitle(event) {
  return (event.countdownBook && event.countdownBook.title) || "倒数本"
}

function getCreatedMessage(event) {
  const createdAt = Number(event.createdAt || 0)

  return {
    id: `${event.id}-created`,
    eventId: event.id,
    icon: "/static/assets/icons/check-circle-primary.svg",
    tone: "primary",
    title: "时刻创建成功",
    copy: `「${event.title || "未命名时刻"}」已加入${getBookTitle(event)}，AI 已为你准备好提醒与记录线索。`,
    time: formatRelativeTime(createdAt),
    timestamp: createdAt,
    unread: !!createdAt && Date.now() - createdAt < 24 * 60 * 60 * 1000
  }
}

function getPinnedMessage(event) {
  const timestamp = Number(event.updatedAt || event.createdAt || 0)

  return {
    id: `${event.id}-pinned`,
    eventId: event.id,
    icon: "/static/assets/icons/push-pin-white.svg",
    tone: "orange",
    title: "置顶时刻提醒",
    copy: `「${event.title || "未命名时刻"}」正在首页置顶展示，重要的等待会被优先看见。`,
    time: formatRelativeTime(timestamp),
    timestamp,
    unread: false
  }
}

function getStatusMessage(event) {
  const daysLeft = getDaysLeft(event.target)
  const title = event.title || "未命名时刻"
  const timestamp = Number(event.updatedAt || event.createdAt || 0)

  if (event.completed || daysLeft <= 0) {
    return {
      id: `${event.id}-completed`,
      eventId: event.id,
      icon: "/static/assets/icons/notifications-active.svg",
      tone: "orange",
      title: "时刻已抵达",
      copy: `「${title}」已经到达，记得留下这一刻的记录。`,
      time: formatRelativeTime(timestamp),
      timestamp: timestamp + 3,
      unread: !event.completed
    }
  }

  if (daysLeft <= 3) {
    return {
      id: `${event.id}-urgent`,
      eventId: event.id,
      icon: "/static/assets/icons/warning.svg",
      tone: "secondary",
      title: "时刻即将到期",
      copy: `距离「${title}」仅剩 ${daysLeft} 天，适合提前整理准备清单。`,
      time: formatRelativeTime(timestamp),
      timestamp: timestamp + 2,
      unread: true
    }
  }

  if (daysLeft <= 7) {
    return {
      id: `${event.id}-soon`,
      eventId: event.id,
      icon: "/static/assets/icons/hourglass-top.svg",
      tone: "amber",
      title: "本周重要提醒",
      copy: `「${title}」还有 ${daysLeft} 天，别让期待走得太匆忙。`,
      time: formatRelativeTime(timestamp),
      timestamp: timestamp + 1,
      unread: true
    }
  }

  return null
}

function buildMessages(events) {
  return events
    .reduce((list, event) => {
      const statusMessage = getStatusMessage(event)

      if (statusMessage) {
        list.push(statusMessage)
      }

      if (event.pinned) {
        list.push(getPinnedMessage(event))
      }

      list.push(getCreatedMessage(event))
      return list
    }, [])
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
}

function getUserMessages(isLoggedIn) {
  return isLoggedIn ? buildMessages(getEvents()) : []
}

function hasUnreadMessages(isLoggedIn) {
  return getUserMessages(isLoggedIn).some((message) => message.unread)
}

module.exports = {
  buildMessages,
  getUserMessages,
  hasUnreadMessages
}
