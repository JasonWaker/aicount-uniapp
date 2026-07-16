const COLLECTIONS = {
  books: "aicount_books",
  icons: "aicount_icons",
  templates: "aicount_templates"
}

const defaultBooks = [
  {
    _id: "default-life",
    user_id: "",
    system_key: "life",
    title: "生活",
    description: "记录琐碎日常中的美好",
    icon_key: "favorite",
    icon_url: "/static/assets/icons/favorite.svg",
    cover_color: "#ff8c00",
    cover_image_url: "",
    is_default: true,
    is_deleted: false,
    sort_order: 10
  },
  {
    _id: "default-study",
    user_id: "",
    system_key: "study",
    title: "学习",
    description: "不积跬步，无以至千里",
    icon_key: "school",
    icon_url: "/static/assets/icons/school.svg",
    cover_color: "#8abfff",
    cover_image_url: "",
    is_default: true,
    is_deleted: false,
    sort_order: 20
  },
  {
    _id: "default-anniversary",
    user_id: "",
    system_key: "anniversary",
    title: "纪念日",
    description: "有些日子，值得铭记一生",
    icon_key: "cake",
    icon_url: "/static/assets/icons/cake.svg",
    cover_color: "#ff9aa2",
    cover_image_url: "",
    is_default: true,
    is_deleted: false,
    sort_order: 30
  },
  {
    _id: "default-work",
    user_id: "",
    system_key: "work",
    title: "工作",
    description: "有条不紊，奔赴热爱",
    icon_key: "work",
    icon_url: "/static/assets/icons/work.svg",
    cover_color: "#a45cff",
    cover_image_url: "",
    is_default: true,
    is_deleted: false,
    sort_order: 40
  },
  {
    _id: "default-travel",
    user_id: "",
    system_key: "travel",
    title: "旅行",
    description: "去看看这个世界吧",
    icon_key: "explore",
    icon_url: "/static/assets/icons/explore.svg",
    cover_color: "#65e6bd",
    cover_image_url: "",
    is_default: true,
    is_deleted: false,
    sort_order: 50
  }
]

const defaultIcons = [
  ["icon-favorite", "favorite", "生活", "/static/assets/icons/favorite.svg", "book", 10],
  ["icon-school", "school", "学习", "/static/assets/icons/school.svg", "book", 20],
  ["icon-cake", "cake", "纪念日", "/static/assets/icons/cake.svg", "book", 30],
  ["icon-work", "work", "工作", "/static/assets/icons/work.svg", "book", 40],
  ["icon-explore", "explore", "旅行", "/static/assets/icons/explore.svg", "book", 50],
  ["icon-book", "book", "倒数本", "/static/assets/icons/book.svg", "common", 60]
].map(([ _id, icon_key, name, file_url, category, sort_order ]) => ({
  _id,
  icon_key,
  name,
  file_url,
  category,
  sort_order,
  status: "active"
}))

const defaultTemplates = [
  ["tpl-sky", "sky", "天空", "hot", "/static/assets/templates/sky.jpg", false, 10],
  ["tpl-modern", "modern", "现代主义", "hot", "/static/assets/templates/modern.jpg", true, 20],
  ["tpl-love", "love", "恋爱宣言", "minimal", "/static/assets/templates/love.jpg", true, 30],
  ["tpl-month", "month", "倒计时月", "minimal", "/static/assets/templates/month.jpg", false, 40]
].map(([ _id, template_key, title, category, image_url, is_pro, sort_order ]) => ({
  _id,
  template_key,
  title,
  category,
  image_url,
  thumbnail_url: image_url,
  is_pro,
  sort_order,
  status: "active"
}))

function now() {
  return Date.now()
}

function withTime(item) {
  return {
    ...item,
    created_at: item.created_at || now(),
    updated_at: item.updated_at || now()
  }
}

async function countCollection(db, collectionName) {
  const res = await db.collection(collectionName).count()
  return Number(res.total || 0)
}

async function existingIds(db, collectionName, ids) {
  if (!ids.length) return {}
  const res = await db.collection(collectionName)
    .where({ _id: db.command.in(ids) })
    .field({ _id: true })
    .get()
  return (res.data || []).reduce((map, item) => {
    map[item._id] = true
    return map
  }, {})
}

async function insertMissing(db, collectionName, rows) {
  const ids = rows.map((item) => item._id).filter(Boolean)
  const existed = await existingIds(db, collectionName, ids)
  const missing = rows.filter((item) => !existed[item._id]).map(withTime)
  if (missing.length) {
    await Promise.all(missing.map((item) => db.collection(collectionName).add(item)))
  }
  return {
    collection: collectionName,
    expected: rows.length,
    inserted: missing.length,
    existed: rows.length - missing.length
  }
}

module.exports = {
  _before() {
    this.db = uniCloud.database()
  },

  async checkInitData() {
    const [books, icons, templates] = await Promise.all([
      countCollection(this.db, COLLECTIONS.books),
      countCollection(this.db, COLLECTIONS.icons),
      countCollection(this.db, COLLECTIONS.templates)
    ])

    return {
      code: 0,
      data: {
        ready: books > 0 && icons > 0 && templates > 0,
        collections: {
          [COLLECTIONS.books]: {
            count: books,
            required: true,
            ready: books > 0
          },
          [COLLECTIONS.icons]: {
            count: icons,
            required: true,
            ready: icons > 0
          },
          [COLLECTIONS.templates]: {
            count: templates,
            required: true,
            ready: templates > 0
          }
        }
      }
    }
  },

  async ensureInitData(setupKey) {
    const expectedKey = process.env.AICOUNT_SETUP_KEY
    if (!expectedKey) {
      return {
        code: "SETUP_KEY_NOT_CONFIGURED",
        message: "Please configure AICOUNT_SETUP_KEY before writing init data."
      }
    }
    if (String(setupKey || "") !== expectedKey) {
      return {
        code: "INVALID_SETUP_KEY",
        message: "Invalid setup key."
      }
    }

    const results = await Promise.all([
      insertMissing(this.db, COLLECTIONS.books, defaultBooks),
      insertMissing(this.db, COLLECTIONS.icons, defaultIcons),
      insertMissing(this.db, COLLECTIONS.templates, defaultTemplates)
    ])
    const state = await this.checkInitData()

    return {
      code: 0,
      data: {
        results,
        state: state.data
      }
    }
  }
}
