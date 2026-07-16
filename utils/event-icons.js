const eventIcons = [
  { id: "cake", icon: "/static/assets/icons/cake.svg", activeIcon: "/static/assets/icons/cake-white.svg", label: "生日" },
  { id: "favorite", icon: "/static/assets/icons/favorite.svg", activeIcon: "/static/assets/icons/favorite-white.svg", label: "收藏" },
  { id: "flight", icon: "/static/assets/icons/flight.svg", activeIcon: "/static/assets/icons/flight-white.svg", label: "旅行" },
  { id: "work", icon: "/static/assets/icons/work.svg", activeIcon: "/static/assets/icons/work-white.svg", label: "工作" },
  { id: "school", icon: "/static/assets/icons/school-secondary.svg", activeIcon: "/static/assets/icons/school-white.svg", label: "学习" },
  { id: "home", icon: "/static/assets/icons/home.svg", label: "家庭" },
  { id: "pets", icon: "/static/assets/icons/pets.svg", label: "宠物" },
  { id: "restaurant", icon: "/static/assets/icons/restaurant.svg", label: "美食" },
  { id: "fitness", icon: "/static/assets/icons/fitness-center.svg", label: "健身" },
  { id: "movie", icon: "/static/assets/icons/movie.svg", label: "电影" },
  { id: "shopping", icon: "/static/assets/icons/shopping-bag.svg", label: "购物" },
  { id: "camera", icon: "/static/assets/icons/photo-camera.svg", label: "拍摄" },
  { id: "brush", icon: "/static/assets/icons/brush.svg", label: "创作" },
  { id: "music", icon: "/static/assets/icons/music-note.svg", label: "音乐" },
  { id: "cafe", icon: "/static/assets/icons/local-cafe.svg", label: "咖啡" },
  { id: "car", icon: "/static/assets/icons/directions-car.svg", label: "出行" },
  { id: "pool", icon: "/static/assets/icons/pool.svg", label: "泳池" },
  { id: "forest", icon: "/static/assets/icons/forest.svg", label: "森林" },
  { id: "beach", icon: "/static/assets/icons/beach-access.svg", label: "海边" },
  { id: "stroller", icon: "/static/assets/icons/stroller.svg", label: "亲子" },
  { id: "celebration", icon: "/static/assets/icons/celebration.svg", label: "庆祝" },
  { id: "nightlife", icon: "/static/assets/icons/nightlife.svg", label: "夜生活" },
  { id: "volunteer", icon: "/static/assets/icons/volunteer-activism.svg", label: "心愿" },
  { id: "ramen", icon: "/static/assets/icons/ramen-dining.svg", label: "拉面" },
  { id: "theater", icon: "/static/assets/icons/theater-comedy.svg", label: "剧场" },
  { id: "hiking", icon: "/static/assets/icons/hiking.svg", label: "徒步" }
]

function getEventIcons() {
  return eventIcons
}

function getSelectedEventIcon() {
  const stored = uni.getStorageSync("selectedEventIcon")

  if (!stored) {
    return eventIcons[0]
  }

  return eventIcons.find((item) => item.id === stored.id) || stored
}

module.exports = {
  eventIcons,
  getEventIcons,
  getSelectedEventIcon
}
