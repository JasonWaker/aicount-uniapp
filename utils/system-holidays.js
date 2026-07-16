const DAY_MS = 86400000

const SYSTEM_HOLIDAYS = [
  {
    id: "mid-autumn-2026",
    title: "中秋节",
    dateText: "2026年9月25日",
    target: { year: 2026, month: 9, day: 25 },
    iconSrc: "/static/assets/icons/bedtime.svg",
    image: "/static/assets/lantern.jpg",
    theme: "brown",
    featured: true,
    aiReminder: "把月光写进团圆里，愿每一次相聚都温柔而明亮。",
    tasks: [
      { id: "holiday-mid-autumn-1", title: "确认团圆安排", description: "提前与家人确认聚会时间和地点，给路途留出余量。", timing: "提前30天" },
      { id: "holiday-mid-autumn-2", title: "准备节日心意", description: "按家人的喜好准备月饼、鲜果或一份小礼物。", timing: "提前14天" },
      { id: "holiday-mid-autumn-3", title: "整理赏月清单", description: "查看天气，准备茶点、灯笼与适合赏月的地点。", timing: "提前3天" },
      { id: "holiday-mid-autumn-4", title: "留住团圆时刻", description: "拍一张合照，记录今年中秋最想珍藏的一句话。", timing: "节日当天" }
    ]
  },
  {
    id: "national-day-2026",
    title: "国庆节",
    dateText: "2026年10月1日-7日",
    target: { year: 2026, month: 10, day: 1 },
    iconSrc: "/static/assets/icons/celebration.svg",
    image: "/static/assets/templates/scenery-1.jpg",
    theme: "orange",
    aiReminder: "山河辽阔，步履不停，愿这个假期装满自由与欢喜。",
    tasks: [
      { id: "holiday-national-1", title: "确定假期计划", description: "结合假期天数确定出行、返乡或休息安排。", timing: "提前30天" },
      { id: "holiday-national-2", title: "完成交通预订", description: "核对车票、机票和住宿信息，预留改签方案。", timing: "提前20天" },
      { id: "holiday-national-3", title: "整理行程物品", description: "根据天气和目的地准备证件、衣物与常用药品。", timing: "提前3天" },
      { id: "holiday-national-4", title: "轻松开启假期", description: "关闭工作提醒，把时间留给风景、家人和自己。", timing: "假期当天" }
    ]
  },
  {
    id: "double-ninth-2026",
    title: "重阳节",
    dateText: "2026年10月18日",
    target: { year: 2026, month: 10, day: 18 },
    iconSrc: "/static/assets/icons/forest.svg",
    image: "/static/assets/templates/scenery-4.jpg",
    theme: "peach",
    aiReminder: "登高望远，也别忘了把问候送给最牵挂的长辈。",
    tasks: [
      { id: "holiday-double-ninth-1", title: "安排陪伴时间", description: "提前询问长辈的时间，安排探望或一次视频通话。", timing: "提前14天" },
      { id: "holiday-double-ninth-2", title: "准备贴心礼物", description: "选择健康实用的小礼物，避免铺张和不合适的补品。", timing: "提前7天" },
      { id: "holiday-double-ninth-3", title: "规划轻松活动", description: "根据身体情况安排散步、赏秋或家庭聚餐。", timing: "提前2天" },
      { id: "holiday-double-ninth-4", title: "记录温暖故事", description: "听长辈讲一段往事，把珍贵的家庭记忆记录下来。", timing: "节日当天" }
    ]
  }
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function toDetailEvent(holiday) {
  const targetDate = new Date(
    holiday.target.year,
    holiday.target.month - 1,
    holiday.target.day
  )
  const createdAt = new Date(holiday.target.year, 0, 1).getTime()
  const initialDays = Math.max(1, Math.ceil((targetDate.getTime() - createdAt) / DAY_MS))

  return {
    id: holiday.id,
    title: holiday.title,
    note: "系统节日",
    target: clone(holiday.target),
    targetDateText: holiday.dateText,
    countdownBook: {
      id: "system-holiday",
      title: "节日",
      iconSrc: holiday.iconSrc
    },
    background: {
      type: "system",
      image: holiday.image,
      label: holiday.title
    },
    theme: holiday.theme,
    aiReminder: holiday.aiReminder,
    aiTasks: clone(holiday.tasks).map((task) => ({ ...task, done: false })),
    aiTaskProvider: "system",
    initialDays,
    pinned: false,
    status: "active",
    timeline: [],
    createdAt,
    updatedAt: createdAt,
    isSystemHoliday: true,
    readOnly: true
  }
}

function getSystemHolidays() {
  return clone(SYSTEM_HOLIDAYS)
}

function getSystemHolidayById(id) {
  const holiday = SYSTEM_HOLIDAYS.find((item) => item.id === id)
  return holiday ? toDetailEvent(holiday) : null
}

module.exports = {
  getSystemHolidayById,
  getSystemHolidays
}
