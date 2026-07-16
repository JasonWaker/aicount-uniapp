const categories = [
  { id: "popular", label: "热门" },
  { id: "minimal", label: "极简" },
  { id: "scenery", label: "风景" },
  { id: "anime", label: "动漫" },
  { id: "acg", label: "二次元" }
]

const libraries = {
  popular: {
    previewTitle: "儿子生日还有",
    previewImage: "/static/assets/templates/picker-1.jpg",
    templates: [
      { id: "popular-sky", title: "天空", subtitle: "37", image: "/static/assets/templates/picker-2.jpg" },
      { id: "popular-modern", title: "现代主义", subtitle: "01:07:34", image: "/static/assets/templates/picker-3.jpg", pro: true },
      { id: "popular-love", title: "恋爱宣言", subtitle: "23", tone: "love", pro: true },
      { id: "popular-month", title: "倒计时月", subtitle: "15 月", tone: "month" }
    ]
  },
  minimal: {
    previewTitle: "儿子生日还有",
    previewImage: "/static/assets/templates/minimal-1.jpg",
    templates: [
      { id: "minimal-1", title: "超凡极简", subtitle: "留白艺术", code: "极简 01", image: "/static/assets/templates/minimal-1.jpg" },
      { id: "minimal-2", title: "北欧灰调", subtitle: "沉静质感", code: "极简 02", image: "/static/assets/templates/minimal-2.jpg", pro: true },
      { id: "minimal-3", title: "抽象线条", subtitle: "灵动呼吸", code: "极简 03", image: "/static/assets/templates/minimal-3.jpg" },
      { id: "minimal-4", title: "排版构成", subtitle: "字体之美", code: "极简 04", image: "/static/assets/templates/minimal-4.jpg", pro: true }
    ]
  },
  scenery: {
    previewTitle: "日照金山还有",
    previewImage: "/static/assets/templates/scenery-1.jpg",
    templates: [
      { id: "scenery-1", title: "日照金山", subtitle: "皑皑雪峰", code: "风景 01", image: "/static/assets/templates/scenery-1.jpg" },
      { id: "scenery-2", title: "林间晨曦", subtitle: "深邃绿意", code: "风景 02", image: "/static/assets/templates/scenery-2.jpg" },
      { id: "scenery-3", title: "星空湖泊", subtitle: "静谧如镜", code: "风景 03", image: "/static/assets/templates/scenery-3.jpg", pro: true },
      { id: "scenery-4", title: "纯净海滩", subtitle: "落日余晖", code: "风景 04", image: "/static/assets/templates/scenery-4.jpg", pro: true }
    ]
  },
  anime: {
    previewTitle: "日照金山还有",
    previewImage: "/static/assets/templates/anime-1.jpg",
    templates: [
      { id: "anime-1", title: "夏日清风", subtitle: "治愈田野", code: "动漫 01", image: "/static/assets/templates/anime-1.jpg" },
      { id: "anime-2", title: "璀璨星空", subtitle: "星河入梦", code: "动漫 02", image: "/static/assets/templates/anime-2.jpg", pro: true },
      { id: "anime-3", title: "樱花书屋", subtitle: "春日暖阳", code: "动漫 03", image: "/static/assets/templates/anime-3.jpg" },
      { id: "anime-4", title: "海边小镇", subtitle: "清爽夏日", code: "动漫 04", image: "/static/assets/templates/anime-4.jpg", pro: true }
    ]
  },
  acg: {
    previewTitle: "赛博城市",
    previewImage: "/static/assets/templates/acg-1.jpg",
    templates: [
      { id: "acg-1", title: "赛博城市", subtitle: "霓虹幻梦", image: "/static/assets/templates/acg-1.jpg" },
      { id: "acg-2", title: "幻想世界", subtitle: "浮岛之诗", image: "/static/assets/templates/acg-2.jpg", pro: true },
      { id: "acg-3", title: "像素心情", subtitle: "复古治愈", image: "/static/assets/templates/acg-3.jpg" },
      { id: "acg-4", title: "虚拟偶像", subtitle: "星光舞台", image: "/static/assets/templates/acg-4.jpg", pro: true }
    ]
  }
}

function getLibrary(id) {
  return libraries[id] || libraries.popular
}

function getTemplateBackground(categoryId, templateId) {
  const library = getLibrary(categoryId)
  const template = library.templates.find((item) => item.id === templateId) || library.templates[0]

  return {
    type: "template",
    category: categoryId,
    templateId: template.id,
    image: template.image || "",
    tone: template.tone || "",
    label: template.title
  }
}

function getTemplateDateState() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const stored = uni.getStorageSync("selectedTargetDate") || {}
  const target = new Date(
    stored.year || today.getFullYear(),
    (stored.month || today.getMonth() + 1) - 1,
    stored.day || today.getDate()
  )
  const daysLeft = Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86400000))
  const weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  const pad = (value) => String(value).padStart(2, "0")

  return {
    daysLeft,
    targetDateText: `${target.getFullYear()}年${pad(target.getMonth() + 1)}月${pad(target.getDate())}日 ${weekNames[target.getDay()]}`,
    todayText: `${today.getFullYear()} / ${pad(today.getMonth() + 1)} / ${pad(today.getDate())}`
  }
}

module.exports = {
  categories,
  getTemplateDateState,
  getTemplateBackground,
  getLibrary,
  libraries
}
