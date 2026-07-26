const PROVIDERS_KEY = 'service_providers'
const INITIALIZED_KEY = 'service_providers_initialized'

const defaultProviders = [
  {
    _id: 'p_001',
    name: '小王同学',
    rating: 4.9,
    price: 8,
    title: '每晚操场代跑3公里',
    desc: '每晚操场准时打卡，步数真实有效，可接各校区。',
    tag: '校园跑',
    tagBg: '#EFF6FF',
    tagColor: '#4A90D9',
    location: '操场',
    time: '30分钟前发布',
    orders: 23,
    avatar: '王',
    avatarBg: '#DBEAFE',
    avatarColor: '#4A90D9',
    category: '校园跑',
    categoryKey: 'campus_run',
    available: true
  },
  {
    _id: 'p_002',
    name: '小李同学',
    rating: 4.8,
    price: 3,
    title: '菜鸟驿站代取快递',
    desc: '顺路代取，大件小件均可，送到宿舍楼下。',
    tag: '快递代取',
    tagBg: '#DCFCE7',
    tagColor: '#22C55E',
    location: '菜鸟驿站',
    time: '1小时前发布',
    orders: 56,
    avatar: '李',
    avatarBg: '#DCFCE7',
    avatarColor: '#22C55E',
    category: '快递代取',
    categoryKey: 'delivery',
    available: true
  },
  {
    _id: 'p_003',
    name: '小张同学',
    rating: 4.9,
    price: 4,
    title: '二食堂午餐代买配送',
    desc: '二食堂各窗口均可，保证饭菜到手还是热的。',
    tag: '代买代购',
    tagBg: '#FFEDD5',
    tagColor: '#F97316',
    location: '二食堂',
    time: '2小时前发布',
    orders: 34,
    avatar: '张',
    avatarBg: '#FFEDD5',
    avatarColor: '#F97316',
    category: '代买代购',
    categoryKey: 'food',
    available: true
  },
  {
    _id: 'p_004',
    name: '小赵同学',
    rating: 4.7,
    price: 5,
    title: '图书馆资料代取代还',
    desc: '帮取书、还书，也可代占座，效率高。',
    tag: '学习助手',
    tagBg: '#F3E8FF',
    tagColor: '#8B5CF6',
    location: '图书馆',
    time: '3小时前发布',
    orders: 18,
    avatar: '赵',
    avatarBg: '#F3E8FF',
    avatarColor: '#8B5CF6',
    category: '学习助手',
    categoryKey: 'study',
    available: true
  },
  {
    _id: 'p_005',
    name: '小陈同学',
    rating: 4.8,
    price: 5,
    title: '宿舍楼间急件互送',
    desc: '10分钟内取件，全校宿舍楼均可送达。',
    tag: '即时速递',
    tagBg: '#E0E7FF',
    tagColor: '#6366F1',
    location: '全校',
    time: '4小时前发布',
    orders: 41,
    avatar: '陈',
    avatarBg: '#E0E7FF',
    avatarColor: '#6366F1',
    category: '即时速递',
    categoryKey: 'express',
    available: true
  },
  {
    _id: 'p_006',
    name: '小刘同学',
    rating: 4.6,
    price: 6,
    title: '代排队代领证件',
    desc: '行政楼各窗口代排队，代领各类证明材料。',
    tag: '代办事务',
    tagBg: '#FEF3C7',
    tagColor: '#D97706',
    location: '行政楼',
    time: '5小时前发布',
    orders: 15,
    avatar: '刘',
    avatarBg: '#FEF3C7',
    avatarColor: '#D97706',
    category: '代办事务',
    categoryKey: 'task',
    available: true
  },
  {
    _id: 'p_007',
    name: '小周同学',
    rating: 4.9,
    price: 5,
    title: '晨跑打卡代跑',
    desc: '早上6点-8点代跑打卡，信誉第一。',
    tag: '校园跑',
    tagBg: '#FCE7F3',
    tagColor: '#EC4899',
    location: '操场',
    time: '6小时前发布',
    orders: 28,
    avatar: '周',
    avatarBg: '#FCE7F3',
    avatarColor: '#EC4899',
    category: '校园跑',
    categoryKey: 'campus_run',
    available: true
  },
  {
    _id: 'p_008',
    name: '小吴同学',
    rating: 4.8,
    price: 10,
    title: '代遛宠物30分钟',
    desc: '喜欢小动物，有丰富遛狗经验，生活区周边。',
    tag: '其他',
    tagBg: '#F3F4F6',
    tagColor: '#6B7280',
    location: '生活区',
    time: '8小时前发布',
    orders: 9,
    avatar: '吴',
    avatarBg: '#F3F4F6',
    avatarColor: '#6B7280',
    category: '代办事务',
    categoryKey: 'task',
    available: false
  },
  {
    _id: 'p_009',
    name: '小孙同学',
    rating: 4.7,
    price: 4,
    title: '打印店代取文件',
    desc: '顺路取打印文件，A4/A3均可，快速送达。',
    tag: '学习助手',
    tagBg: '#F3E8FF',
    tagColor: '#8B5CF6',
    location: '打印店',
    time: '12小时前发布',
    orders: 12,
    avatar: '孙',
    avatarBg: '#F3E8FF',
    avatarColor: '#8B5CF6',
    category: '学习助手',
    categoryKey: 'study',
    available: true
  },
  {
    _id: 'p_010',
    name: '小郑同学',
    rating: 4.9,
    price: 7,
    title: '超市代购日用品',
    desc: '学校周边超市代购，接受图片下单，快速配送。',
    tag: '代买代购',
    tagBg: '#FFEDD5',
    tagColor: '#F97316',
    location: '学校周边',
    time: '1天前发布',
    orders: 47,
    avatar: '郑',
    avatarBg: '#FFEDD5',
    avatarColor: '#F97316',
    category: '代买代购',
    categoryKey: 'food',
    available: true
  }
]

function getProviders() {
  try {
    const data = uni.getStorageSync(PROVIDERS_KEY)
    if (data && data.length > 0) {
      return data
    }
    return []
  } catch (e) {
    return []
  }
}

function saveProviders(list) {
  try {
    uni.setStorageSync(PROVIDERS_KEY, list)
  } catch (e) {
    console.error('[providers] 保存数据失败:', e)
  }
}

export const providersService = {
  async initialize() {
    const initialized = uni.getStorageSync(INITIALIZED_KEY)
    if (initialized) {
      return { errCode: 0, errMsg: '已初始化' }
    }

    saveProviders(defaultProviders)
    uni.setStorageSync(INITIALIZED_KEY, true)
    
    return { errCode: 0, errMsg: '初始化成功', data: { count: defaultProviders.length } }
  },

  async reset() {
    saveProviders(defaultProviders)
    uni.setStorageSync(INITIALIZED_KEY, true)
    return { errCode: 0, errMsg: '重置成功', data: { count: defaultProviders.length } }
  },

  async list(params = {}) {
    const { category, keyword, available } = params
    let list = getProviders()

    if (list.length === 0) {
      list = defaultProviders
      saveProviders(list)
    }

    if (category && category !== '全部') {
      list = list.filter(p => p.category === category)
    }

    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      list = list.filter(p => 
        p.title.toLowerCase().includes(kw) ||
        p.desc.toLowerCase().includes(kw) ||
        p.name.toLowerCase().includes(kw)
      )
    }

    if (available !== undefined) {
      list = list.filter(p => p.available === available)
    }

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: { list, total: list.length }
    }
  },

  async getById(id) {
    const list = getProviders()
    const provider = list.find(p => p._id === id)
    if (!provider) {
      return { errCode: 'NOT_FOUND', errMsg: '服务商不存在' }
    }
    return { errCode: 0, errMsg: '获取成功', data: provider }
  },

  async updateOrderCount(id, increment = 1) {
    const list = getProviders()
    const index = list.findIndex(p => p._id === id)
    if (index !== -1) {
      list[index].orders = (list[index].orders || 0) + increment
      saveProviders(list)
    }
    return { errCode: 0 }
  },

  async search(keyword) {
    return this.list({ keyword })
  },

  getCategories() {
    return [
      { key: 'all', label: '全部' },
      { key: 'campus_run', label: '校园跑' },
      { key: 'study', label: '学习助手' },
      { key: 'food', label: '代买代购' },
      { key: 'delivery', label: '快递代取' },
      { key: 'task', label: '代办事务' },
      { key: 'express', label: '即时速递' }
    ]
  }
}
