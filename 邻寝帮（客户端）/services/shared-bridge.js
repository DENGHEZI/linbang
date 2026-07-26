const BRIDGE_FILE_PATH = 'linbang_shared_data.json'

const fsManager = (() => {
  try {
    return uni.getFileSystemManager()
  } catch (e) {
    return null
  }
})()

function getBridgeFilePath() {
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      return BRIDGE_FILE_PATH
    }
    if (fsManager) {
      try {
        fsManager.accessSync(BRIDGE_FILE_PATH)
        return BRIDGE_FILE_PATH
      } catch (e) {
        try {
          fsManager.accessSync(`${wx.env.USER_DATA_PATH || ''}${BRIDGE_FILE_PATH}`)
          return `${wx.env.USER_DATA_PATH || ''}${BRIDGE_FILE_PATH}`
        } catch (e2) {
          return BRIDGE_FILE_PATH
        }
      }
    }
    return BRIDGE_FILE_PATH
  } catch (e) {
    return BRIDGE_FILE_PATH
  }
}

function readBridgeFile() {
  try {
    if (fsManager) {
      const filePath = getBridgeFilePath()
      try {
        fsManager.accessSync(filePath)
        const data = fsManager.readFileSync(filePath, 'utf-8')
        if (data) {
          return JSON.parse(data)
        }
      } catch (e) {
        const initData = getInitialData()
        writeBridgeFile(initData)
        return initData
      }
    } else {
      try {
        const val = uni.getStorageSync('linbang_bridge_data')
        if (val) {
          return typeof val === 'string' ? JSON.parse(val) : val
        }
      } catch (e) {}
      const initData = getInitialData()
      writeBridgeFile(initData)
      return initData
    }
  } catch (e) {
    return getInitialData()
  }
}

function writeBridgeFile(data) {
  try {
    if (fsManager) {
      const filePath = getBridgeFilePath()
      fsManager.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } else {
      uni.setStorageSync('linbang_bridge_data', JSON.stringify(data))
    }
    return true
  } catch (e) {
    try {
      uni.setStorageSync('linbang_bridge_data', JSON.stringify(data))
      return true
    } catch (e2) {
      return false
    }
  }
}

function getInitialData() {
  return {
    orders: [],
    users: [],
    bankCards: [],
    transactions: [],
    riderIncome: [],
    meta: {
      updated_at: Date.now(),
      version: '1.0.0'
    }
  }
}

const sharedBridge = {
  getAll() {
    return readBridgeFile()
  },

  getOrders(filter = {}) {
    const data = readBridgeFile()
    let orders = data.orders || []
    
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
    const orders = this.getOrders({ ...filter, page: undefined, pageSize: undefined })
    return Array.isArray(orders) ? orders.length : 0
  },

  saveOrder(orderData) {
    const data = readBridgeFile()
    const order = { ...orderData, _bridge_synced: true, _bridge_synced_at: Date.now() }
    
    const idx = data.orders.findIndex(o => o._id === order._id)
    if (idx >= 0) {
      data.orders[idx] = { ...data.orders[idx], ...order }
    } else {
      data.orders.push(order)
    }
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return order
  },

  saveOrders(orderList) {
    if (!Array.isArray(orderList)) return
    const data = readBridgeFile()
    const map = {}
    for (const o of data.orders) {
      if (o._id) map[o._id] = o
    }
    for (const order of orderList) {
      const o = { ...order, _bridge_synced: true, _bridge_synced_at: Date.now() }
      if (!o._id) {
        o._id = 'bridge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      }
      map[o._id] = { ...map[o._id], ...o }
    }
    data.orders = Object.values(map)
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return data.orders
  },

  deleteOrder(id) {
    const data = readBridgeFile()
    data.orders = data.orders.filter(o => o._id !== id)
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
  },

  updateOrderStatus(id, status, extraData = {}) {
    const data = readBridgeFile()
    const idx = data.orders.findIndex(o => o._id === id)
    if (idx < 0) return null
    
    const validStatus = ['pending_payment', 'pending', 'accepted', 'picking', 'delivering', 'delivered', 'completed', 'cancelled', 'refunding']
    if (!validStatus.includes(status)) return null
    
    data.orders[idx].status = status
    data.orders[idx].updated_at = Date.now()
    
    if (status === 'accepted' && extraData.rider_id) {
      data.orders[idx].rider_id = extraData.rider_id
      data.orders[idx].rider_name = extraData.rider_name || ''
      data.orders[idx].rider_phone = extraData.rider_phone || ''
      data.orders[idx].accepted_at = Date.now()
    }
    if (status === 'completed') {
      data.orders[idx].completed_at = Date.now()
      if (extraData.rating) data.orders[idx].rating = extraData.rating
    }
    
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return data.orders[idx]
  },

  getUsers(filter = {}) {
    const data = readBridgeFile()
    let users = data.users || []
    
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
    const users = this.getUsers({ ...filter, page: undefined, pageSize: undefined })
    return Array.isArray(users) ? users.length : 0
  },

  getUserById(userId) {
    const data = readBridgeFile()
    return (data.users || []).find(u => u._id === userId || u.user_id === userId) || null
  },

  saveUser(userData) {
    const data = readBridgeFile()
    const user = { ...userData, _bridge_synced: true, _bridge_synced_at: Date.now() }
    
    if (!user._id) {
      user._id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }
    
    const idx = data.users.findIndex(u => u._id === user._id || u.user_id === user.user_id)
    if (idx >= 0) {
      data.users[idx] = { ...data.users[idx], ...user }
    } else {
      data.users.push(user)
    }
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return user
  },

  saveUsers(userList) {
    if (!Array.isArray(userList)) return
    const data = readBridgeFile()
    const map = {}
    for (const u of data.users) {
      if (u._id) map[u._id] = u
      if (u.user_id) map['uid_' + u.user_id] = u
    }
    for (const user of userList) {
      const u = { ...user, _bridge_synced: true, _bridge_synced_at: Date.now() }
      if (!u._id) u._id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      const key = u._id || ('uid_' + u.user_id)
      map[key] = { ...map[key], ...u }
    }
    data.users = Object.values(map)
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return data.users
  },

  deleteUser(id) {
    const data = readBridgeFile()
    data.users = data.users.filter(u => u._id !== id)
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
  },

  getBankCards(userId) {
    const data = readBridgeFile()
    return userId ? (data.bankCards || []).filter(c => c.user_id === userId) : (data.bankCards || [])
  },

  saveBankCard(cardData) {
    const data = readBridgeFile()
    const card = { ...cardData, _bridge_synced: true, _bridge_synced_at: Date.now() }
    if (!card._id) card._id = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    const idx = (data.bankCards || []).findIndex(c => c._id === card._id)
    if (idx >= 0) {
      data.bankCards[idx] = { ...data.bankCards[idx], ...card }
    } else {
      if (!data.bankCards) data.bankCards = []
      data.bankCards.push(card)
    }
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return card
  },

  getTransactions(userId, limit = 50) {
    const data = readBridgeFile()
    let txs = data.transactions || []
    if (userId) txs = txs.filter(t => t.user_id === userId)
    txs.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
    return txs.slice(0, limit)
  },

  saveTransaction(txData) {
    const data = readBridgeFile()
    const tx = { ...txData, _bridge_synced: true, _bridge_synced_at: Date.now() }
    if (!tx._id) tx._id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    if (!data.transactions) data.transactions = []
    data.transactions.push(tx)
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return tx
  },

  getRiderIncome(riderId) {
    const data = readBridgeFile()
    return riderId ? (data.riderIncome || []).filter(i => i.rider_id === riderId) : (data.riderIncome || [])
  },

  saveRiderIncome(incomeData) {
    const data = readBridgeFile()
    const item = { ...incomeData, _bridge_synced: true, _bridge_synced_at: Date.now() }
    if (!item._id) item._id = 'ri_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    if (!data.riderIncome) data.riderIncome = []
    data.riderIncome.push(item)
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return item
  },

  importFromLocal(localData) {
    const data = readBridgeFile()
    
    if (localData.orders && Array.isArray(localData.orders)) {
      const existingMap = {}
      for (const o of data.orders) {
        if (o._id) existingMap[o._id] = o
      }
      for (const order of localData.orders) {
        const id = order._id || order.orderNo
        if (id) {
          existingMap[id] = { ...existingMap[id], ...order, _bridge_synced: true, _bridge_synced_at: Date.now() }
        } else {
          order._id = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          existingMap[order._id] = { ...order, _bridge_synced: true, _bridge_synced_at: Date.now() }
        }
      }
      data.orders = Object.values(existingMap)
    }
    
    if (localData.users && Array.isArray(localData.users)) {
      const userMap = {}
      for (const u of data.users) {
        if (u._id) userMap[u._id] = u
        if (u.user_id) userMap['uid_' + u.user_id] = u
      }
      for (const user of localData.users) {
        const id = user._id || ('uid_' + user.user_id)
        userMap[id] = { ...userMap[id], ...user, _bridge_synced: true, _bridge_synced_at: Date.now() }
      }
      data.users = Object.values(userMap)
    }
    
    if (localData.bankCards && Array.isArray(localData.bankCards)) {
      const cardMap = {}
      for (const c of (data.bankCards || [])) {
        if (c._id) cardMap[c._id] = c
      }
      for (const card of localData.bankCards) {
        const id = card._id || ('card_' + card.last4)
        cardMap[id] = { ...cardMap[id], ...card, _bridge_synced: true, _bridge_synced_at: Date.now() }
      }
      data.bankCards = Object.values(cardMap)
    }
    
    data.meta.updated_at = Date.now()
    writeBridgeFile(data)
    return data
  },

  clearAll() {
    writeBridgeFile(getInitialData())
  },

  getStats() {
    const data = readBridgeFile()
    const orders = data.orders || []
    const users = data.users || []
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
      updated_at: data.meta?.updated_at || 0
    }
  },

  getMeta() {
    const data = readBridgeFile()
    return data.meta || { updated_at: 0, version: '1.0.0' }
  }
}

export default sharedBridge
