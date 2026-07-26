const ORDERS_KEY = 'shared_orders'
const USERS_KEY = 'shared_users'
const CARDS_KEY = 'shared_bank_cards'
const TX_KEY = 'shared_transactions'
const RIDER_INCOME_KEY = 'shared_rider_income'
const SYNC_TIMESTAMP = 'shared_sync_timestamp'

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function readStore(key, defaultValue) {
  try {
    const val = uni.getStorageSync(key)
    if (val === '' || val === undefined || val === null) return defaultValue
    if (typeof val === 'string') {
      try { return JSON.parse(val) } catch { return defaultValue }
    }
    return val
  } catch (e) {
    return defaultValue
  }
}

function writeStore(key, value) {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    try {
      uni.setStorageSync(key, value)
    } catch (e2) {}
  }
}

const sharedData = {
  saveOrder(orderData) {
    const orders = readStore(ORDERS_KEY, [])
    const order = { ...orderData }
    if (!order._id) {
      order._id = generateId()
    }
    order._synced = true
    order._synced_at = Date.now()
    const idx = orders.findIndex(o => o._id === order._id)
    if (idx >= 0) {
      orders[idx] = { ...orders[idx], ...order }
    } else {
      orders.push(order)
    }
    writeStore(ORDERS_KEY, orders)
    writeStore(SYNC_TIMESTAMP, Date.now())
    return order
  },

  saveOrders(orderList) {
    if (!Array.isArray(orderList)) return
    const existing = readStore(ORDERS_KEY, [])
    const map = {}
    for (const o of existing) {
      if (o._id) map[o._id] = o
    }
    for (const order of orderList) {
      const o = { ...order }
      if (!o._id) o._id = generateId()
      o._synced = true
      o._synced_at = Date.now()
      map[o._id] = { ...map[o._id], ...o }
    }
    const result = Object.values(map)
    writeStore(ORDERS_KEY, result)
    writeStore(SYNC_TIMESTAMP, Date.now())
    return result
  },

  getOrders(filter = {}) {
    let orders = readStore(ORDERS_KEY, [])
    if (filter.status) orders = orders.filter(o => o.status === filter.status)
    if (filter.category) orders = orders.filter(o => o.category === filter.category)
    if (filter.user_id) orders = orders.filter(o => o.user_id === filter.user_id)
    if (filter.rider_id) orders = orders.filter(o => o.rider_id === filter.rider_id)
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase()
      orders = orders.filter(o =>
        (o.orderNo && o.orderNo.toLowerCase().includes(kw)) ||
        (o.title && o.title.toLowerCase().includes(kw)) ||
        (o.user_name && o.user_name.toLowerCase().includes(kw)) ||
        (o.rider_name && o.rider_name.toLowerCase().includes(kw))
      )
    }
    if (filter._id) {
      orders = orders.filter(o => o._id === filter._id)
      return orders.length > 0 ? orders[0] : null
    }
    const sortField = filter.orderBy || 'created_at'
    const sortOrder = filter.orderType === 'asc' ? 1 : -1
    orders.sort((a, b) => {
      const va = a[sortField] || 0
      const vb = b[sortField] || 0
      return (va - vb) * sortOrder
    })
    if (filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize
      return orders.slice(start, start + filter.pageSize)
    }
    return orders
  },

  getOrdersCount(filter = {}) {
    const orders = this.getOrders(filter)
    return Array.isArray(orders) ? orders.length : 0
  },

  deleteOrder(id) {
    let orders = readStore(ORDERS_KEY, [])
    orders = orders.filter(o => o._id !== id)
    writeStore(ORDERS_KEY, orders)
    writeStore(SYNC_TIMESTAMP, Date.now())
  },

  batchDeleteOrders(ids) {
    let orders = readStore(ORDERS_KEY, [])
    orders = orders.filter(o => !ids.includes(o._id))
    writeStore(ORDERS_KEY, orders)
    writeStore(SYNC_TIMESTAMP, Date.now())
  },

  updateOrderStatus(id, status, extraData = {}) {
    const orders = readStore(ORDERS_KEY, [])
    const idx = orders.findIndex(o => o._id === id)
    if (idx < 0) return null
    const validStatus = ['pending_payment', 'pending', 'accepted', 'picking', 'delivering', 'delivered', 'completed', 'cancelled', 'refunding']
    if (!validStatus.includes(status)) return null
    orders[idx].status = status
    orders[idx].updated_at = Date.now()
    if (status === 'accepted' && extraData.rider_id) {
      orders[idx].rider_id = extraData.rider_id
      orders[idx].rider_name = extraData.rider_name || ''
      orders[idx].rider_phone = extraData.rider_phone || ''
      orders[idx].accepted_at = Date.now()
    }
    if (status === 'completed') {
      orders[idx].completed_at = Date.now()
      if (extraData.rating) orders[idx].rating = extraData.rating
    }
    if (status === 'cancelled') {
      orders[idx].cancelled_at = Date.now()
      if (extraData.cancelReason) orders[idx].cancelReason = extraData.cancelReason
    }
    writeStore(ORDERS_KEY, orders)
    writeStore(SYNC_TIMESTAMP, Date.now())
    return orders[idx]
  },

  saveUser(userData) {
    const users = readStore(USERS_KEY, [])
    const user = { ...userData }
    if (!user._id) {
      user._id = generateId()
    }
    user._synced = true
    user._synced_at = Date.now()
    const idx = users.findIndex(u => u._id === user._id || u.user_id === user.user_id)
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user }
    } else {
      users.push(user)
    }
    writeStore(USERS_KEY, users)
    writeStore(SYNC_TIMESTAMP, Date.now())
    return user
  },

  saveUsers(userList) {
    if (!Array.isArray(userList)) return
    const existing = readStore(USERS_KEY, [])
    const map = {}
    for (const u of existing) {
      if (u._id) map[u._id] = u
      if (u.user_id) map['uid_' + u.user_id] = u
    }
    for (const user of userList) {
      const u = { ...user }
      if (!u._id) u._id = generateId()
      u._synced = true
      u._synced_at = Date.now()
      const key = u._id || ('uid_' + u.user_id)
      map[key] = { ...map[key], ...u }
    }
    const result = Object.values(map)
    writeStore(USERS_KEY, result)
    writeStore(SYNC_TIMESTAMP, Date.now())
    return result
  },

  getUsers(filter = {}) {
    let users = readStore(USERS_KEY, [])
    if (filter.role) users = users.filter(u => u.role === filter.role)
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase()
      users = users.filter(u =>
        (u.nickname && u.nickname.toLowerCase().includes(kw)) ||
        (u.phone && u.phone.includes(kw)) ||
        (u.school && u.school.toLowerCase().includes(kw))
      )
    }
    const sortField = filter.orderBy || 'created_at'
    const sortOrder = filter.orderType === 'asc' ? 1 : -1
    users.sort((a, b) => {
      const va = a[sortField] || 0
      const vb = b[sortField] || 0
      return (va - vb) * sortOrder
    })
    if (filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize
      return users.slice(start, start + filter.pageSize)
    }
    return users
  },

  getUsersCount(filter = {}) {
    const users = this.getUsers(filter)
    return Array.isArray(users) ? users.length : 0
  },

  getUserById(userId) {
    const users = readStore(USERS_KEY, [])
    return users.find(u => u._id === userId || u.user_id === userId) || null
  },

  deleteUser(id) {
    let users = readStore(USERS_KEY, [])
    users = users.filter(u => u._id !== id)
    writeStore(USERS_KEY, users)
    writeStore(SYNC_TIMESTAMP, Date.now())
  },

  saveBankCard(cardData) {
    const cards = readStore(CARDS_KEY, [])
    const card = { ...cardData }
    if (!card._id) {
      card._id = generateId()
    }
    const idx = cards.findIndex(c => c._id === card._id)
    if (idx >= 0) {
      cards[idx] = { ...cards[idx], ...card }
    } else {
      cards.push(card)
    }
    writeStore(CARDS_KEY, cards)
    return card
  },

  getBankCards(userId) {
    const cards = readStore(CARDS_KEY, [])
    return userId ? cards.filter(c => c.user_id === userId) : cards
  },

  saveTransaction(txData) {
    const txs = readStore(TX_KEY, [])
    const tx = { ...txData }
    if (!tx._id) tx._id = generateId()
    txs.push(tx)
    writeStore(TX_KEY, txs)
    return tx
  },

  getTransactions(userId, limit = 50) {
    const txs = readStore(TX_KEY, [])
    let result = userId ? txs.filter(t => t.user_id === userId) : txs
    result.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
    return result.slice(0, limit)
  },

  saveRiderIncome(incomeData) {
    const list = readStore(RIDER_INCOME_KEY, [])
    const item = { ...incomeData }
    if (!item._id) item._id = generateId()
    list.push(item)
    writeStore(RIDER_INCOME_KEY, list)
    return item
  },

  getRiderIncome(riderId) {
    const list = readStore(RIDER_INCOME_KEY, [])
    return riderId ? list.filter(i => i.rider_id === riderId) : list
  },

  getSyncTimestamp() {
    return readStore(SYNC_TIMESTAMP, 0)
  },

  exportAll() {
    return {
      orders: readStore(ORDERS_KEY, []),
      users: readStore(USERS_KEY, []),
      bankCards: readStore(CARDS_KEY, []),
      transactions: readStore(TX_KEY, []),
      riderIncome: readStore(RIDER_INCOME_KEY, []),
      exported_at: Date.now()
    }
  },

  importAll(data) {
    if (!data || typeof data !== 'object') return
    if (Array.isArray(data.orders)) writeStore(ORDERS_KEY, data.orders)
    if (Array.isArray(data.users)) writeStore(USERS_KEY, data.users)
    if (Array.isArray(data.bankCards)) writeStore(CARDS_KEY, data.bankCards)
    if (Array.isArray(data.transactions)) writeStore(TX_KEY, data.transactions)
    if (Array.isArray(data.riderIncome)) writeStore(RIDER_INCOME_KEY, data.riderIncome)
    writeStore(SYNC_TIMESTAMP, Date.now())
  },

  clearAll() {
    [ORDERS_KEY, USERS_KEY, CARDS_KEY, TX_KEY, RIDER_INCOME_KEY, SYNC_TIMESTAMP].forEach(key => {
      try { uni.removeStorageSync(key) } catch (e) {}
    })
  },

  getStats() {
    const orders = readStore(ORDERS_KEY, [])
    const users = readStore(USERS_KEY, [])
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0)
    const platformRevenue = orders.reduce((sum, o) => sum + (o.platformFee || 0), 0)
    const serviceFee = orders.reduce((sum, o) => sum + (o.serviceFee || 0), 0)
    const riderIncome = orders.reduce((sum, o) => sum + (o.riderIncome || 0), 0)
    const activeRiders = new Set(orders.map(o => o.rider_id).filter(Boolean)).size

    return {
      totalOrders: orders.length,
      completedOrders,
      activeRiders,
      totalUsers: users.length,
      platformRevenue: Math.round(platformRevenue * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      riderIncome: Math.round(riderIncome * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      syncTimestamp: this.getSyncTimestamp()
    }
  },

  generateMockData() {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    const mockUsers = [
      {
        _id: 'user_001',
        user_id: 'user_001',
        nickname: '张同学',
        avatar: '',
        phone: '13800000001',
        school: '华南理工大学',
        student_id: '20240001',
        verified: true,
        role: 'user',
        balance: 156.50,
        order_count: 5,
        total_orders: 5,
        rating: 5.0,
        created_at: now - 7 * oneDay,
        updated_at: now - oneDay
      },
      {
        _id: 'user_002',
        user_id: 'user_002',
        nickname: '李同学',
        avatar: '',
        phone: '13800000002',
        school: '华南理工大学',
        student_id: '20240002',
        verified: true,
        role: 'user',
        balance: 88.00,
        order_count: 3,
        total_orders: 3,
        rating: 4.8,
        created_at: now - 5 * oneDay,
        updated_at: now - 2 * oneDay
      },
      {
        _id: 'rider_001',
        user_id: 'rider_001',
        nickname: '骑手小王',
        avatar: '',
        phone: '13900000001',
        school: '华南理工大学',
        student_id: '20230001',
        verified: true,
        role: 'rider',
        balance: 32.50,
        order_count: 23,
        total_orders: 23,
        rating: 4.9,
        created_at: now - 30 * oneDay,
        updated_at: now
      },
      {
        _id: 'rider_002',
        user_id: 'rider_002',
        nickname: '骑手小李',
        avatar: '',
        phone: '13900000002',
        school: '华南理工大学',
        student_id: '20230002',
        verified: true,
        role: 'rider',
        balance: 18.80,
        order_count: 15,
        total_orders: 15,
        rating: 4.7,
        created_at: now - 20 * oneDay,
        updated_at: now
      }
    ]

    const mockOrders = [
      {
        _id: 'order_001',
        orderNo: 'NO2607261430150001ABC',
        user_id: 'user_001',
        user_name: '张同学',
        rider_id: 'rider_001',
        rider_name: '骑手小王',
        rider_phone: '13900000001',
        category: 'delivery',
        itemType: 'document',
        itemWeight: 'light',
        title: '快递代取',
        description: '菜鸟驿站取一个快递',
        pickupAddress: '华南理工大学东区1号菜鸟驿站',
        deliveryAddress: '华南理工大学西区15栋302',
        pickupLocation: { latitude: 23.15, longitude: 113.35 },
        deliveryLocation: { latitude: 23.16, longitude: 113.36 },
        pickupTimeRange: { start: '14:00', end: '15:00' },
        price: 8.00,
        serviceFee: 0.80,
        platformFee: 0.16,
        riderIncome: 7.04,
        urgency: 'normal',
        deliveryTime: '15:30前送达',
        images: [],
        remark: '',
        contactPhone: '13800000001',
        status: 'completed',
        rating: { score: 5, comment: '速度很快，态度很好', tags: ['快速', '态度好'] },
        created_at: now - 3 * oneDay,
        updated_at: now - 3 * oneDay + 3600000,
        accepted_at: now - 3 * oneDay + 600000,
        completed_at: now - 3 * oneDay + 3600000
      },
      {
        _id: 'order_002',
        orderNo: 'NO2607261500200002DEF',
        user_id: 'user_001',
        user_name: '张同学',
        rider_id: 'rider_002',
        rider_name: '骑手小李',
        rider_phone: '13900000002',
        category: 'food',
        itemType: 'food',
        itemWeight: 'light',
        title: '餐饮外送',
        description: '从东门麦当劳购买一个汉堡套餐',
        pickupAddress: '华南理工大学东门麦当劳',
        deliveryAddress: '华南理工大学西区12栋505',
        pickupLocation: { latitude: 23.14, longitude: 113.34 },
        deliveryLocation: { latitude: 23.16, longitude: 113.37 },
        pickupTimeRange: { start: '12:00', end: '12:30' },
        price: 15.00,
        serviceFee: 1.50,
        platformFee: 0.30,
        riderIncome: 13.20,
        urgency: 'urgent',
        deliveryTime: '30分钟内送达',
        images: [],
        remark: '不要辣',
        contactPhone: '13800000001',
        status: 'delivering',
        created_at: now - oneDay,
        updated_at: now - oneDay + 1800000,
        accepted_at: now - oneDay + 300000,
        delivering_at: now - oneDay + 1500000
      },
      {
        _id: 'order_003',
        orderNo: 'NO2607261600300003GHI',
        user_id: 'user_002',
        user_name: '李同学',
        rider_id: null,
        rider_name: '',
        rider_phone: '',
        category: 'print',
        itemType: 'document',
        itemWeight: 'light',
        title: '打印代办',
        description: '打印一份PDF文档，10页',
        pickupAddress: '华南理工大学图书馆1楼打印店',
        deliveryAddress: '华南理工大学东区8栋201',
        pickupLocation: { latitude: 23.15, longitude: 113.35 },
        deliveryLocation: { latitude: 23.14, longitude: 113.34 },
        pickupTimeRange: { start: '10:00', end: '11:00' },
        price: 5.00,
        serviceFee: 0.50,
        platformFee: 0.10,
        riderIncome: 4.40,
        urgency: 'normal',
        deliveryTime: '今天下午',
        images: [],
        remark: '黑白打印',
        contactPhone: '13800000002',
        status: 'pending',
        created_at: now - 3600000,
        updated_at: now - 3600000
      },
      {
        _id: 'order_004',
        orderNo: 'NO2607261700400004JKL',
        user_id: 'user_001',
        user_name: '张同学',
        rider_id: null,
        rider_name: '',
        rider_phone: '',
        category: 'errand',
        itemType: 'daily',
        itemWeight: 'medium',
        title: '跑腿代办',
        description: '去南门超市买一瓶洗衣液',
        pickupAddress: '华南理工大学南门超市',
        deliveryAddress: '华南理工大学西区15栋302',
        pickupLocation: { latitude: 23.17, longitude: 113.35 },
        deliveryLocation: { latitude: 23.16, longitude: 113.36 },
        pickupTimeRange: { start: '16:00', end: '17:00' },
        price: 10.00,
        serviceFee: 1.00,
        platformFee: 0.20,
        riderIncome: 8.80,
        urgency: 'urgent',
        deliveryTime: '1小时内',
        images: [],
        remark: '买蓝月亮的',
        contactPhone: '13800000001',
        status: 'pending_payment',
        created_at: now - 1800000,
        updated_at: now - 1800000
      }
    ]

    const mockCards = [
      {
        _id: 'card_001',
        user_id: 'user_001',
        bank_code: 'CMB',
        bank_name: '招商银行',
        card_number: '6225 **** **** 8888',
        card_holder: '张同学',
        last4: '8888',
        is_default: true,
        created_at: now - 7 * oneDay
      },
      {
        _id: 'card_002',
        user_id: 'user_002',
        bank_code: 'CCB',
        bank_name: '建设银行',
        card_number: '6222 **** **** 9999',
        card_holder: '李同学',
        last4: '9999',
        is_default: true,
        created_at: now - 5 * oneDay
      }
    ]

    const mockTxs = [
      { _id: 'tx_001', user_id: 'user_001', type: 'expense', amount: 8.00, category: 'order_fee', balance_after: 148.50, created_at: now - 3 * oneDay },
      { _id: 'tx_002', user_id: 'user_001', type: 'expense', amount: 15.00, category: 'order_fee', balance_after: 133.50, created_at: now - oneDay },
      { _id: 'tx_003', user_id: 'user_001', type: 'income', amount: 50.00, category: 'recharge', balance_after: 148.50, created_at: now - 2 * oneDay },
      { _id: 'tx_004', user_id: 'user_002', type: 'expense', amount: 12.00, category: 'order_fee', balance_after: 88.00, created_at: now - 2 * oneDay }
    ]

    writeStore(ORDERS_KEY, mockOrders)
    writeStore(USERS_KEY, mockUsers)
    writeStore(CARDS_KEY, mockCards)
    writeStore(TX_KEY, mockTxs)
    writeStore(SYNC_TIMESTAMP, now)

    return { orders: mockOrders, users: mockUsers, bankCards: mockCards, transactions: mockTxs }
  }
}

export default sharedData
