const BRIDGE_BASE = 'http://127.0.0.1:19876'

let bridgeAvailable = null
let bridgeChecked = false

function checkBridge() {
  return new Promise((resolve) => {
    if (bridgeChecked) {
      resolve(bridgeAvailable)
      return
    }
    
    uni.request({
      url: `${BRIDGE_BASE}/ping`,
      method: 'GET',
      timeout: 2000,
      success: (res) => {
        bridgeAvailable = res.data && res.data.errCode === 0
        bridgeChecked = true
        resolve(bridgeAvailable)
      },
      fail: () => {
        bridgeAvailable = false
        bridgeChecked = true
        resolve(false)
      }
    })
  })
}

function request(method, path, data = {}) {
  return new Promise((resolve) => {
    if (!bridgeChecked || bridgeAvailable === null) {
      checkBridge().then(() => {
        if (!bridgeAvailable) {
          resolve(null)
          return
        }
        doRequest(method, path, data, resolve)
      })
    } else if (!bridgeAvailable) {
      resolve(null)
    } else {
      doRequest(method, path, data, resolve)
    }
  })
}

function doRequest(method, path, data, resolve) {
  uni.request({
    url: `${BRIDGE_BASE}${path}`,
    method: method,
    data: method === 'GET' ? data : JSON.stringify(data),
    header: {
      'Content-Type': 'application/json'
    },
    timeout: 5000,
    success: (res) => {
      resolve(res.data || null)
    },
    fail: () => {
      bridgeAvailable = false
      bridgeChecked = true
      resolve(null)
    }
  })
}

function queryString(params = {}) {
  const parts = []
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    }
  }
  return parts.length > 0 ? '?' + parts.join('&') : ''
}

const bridgeClient = {
  isAvailable() {
    return bridgeAvailable
  },

  async checkConnection() {
    bridgeChecked = false
    return checkBridge()
  },

  async getOrders(filter = {}) {
    const query = queryString({
      status: filter.status,
      category: filter.category,
      user_id: filter.user_id,
      rider_id: filter.rider_id,
      keyword: filter.keyword,
      _id: filter._id,
      page: filter.page,
      pageSize: filter.pageSize,
      orderBy: filter.orderBy,
      orderType: filter.orderType
    })
    const result = await request('GET', `/orders${query}`)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async saveOrder(orderData) {
    const result = await request('POST', '/orders', orderData)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async updateOrderStatus(id, status, extraData = {}) {
    return request('POST', '/orders/update-status', { id, status, extraData })
  },

  async deleteOrder(id) {
    return request('POST', '/orders/delete', { id })
  },

  async getUsers(filter = {}) {
    const query = queryString({
      role: filter.role,
      keyword: filter.keyword,
      page: filter.page,
      pageSize: filter.pageSize,
      orderBy: filter.orderBy,
      orderType: filter.orderType
    })
    const result = await request('GET', `/users${query}`)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async saveUser(userData) {
    const result = await request('POST', '/users', userData)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async deleteUser(id) {
    return request('POST', '/users/delete', { id })
  },

  async getBankCards(userId) {
    const query = queryString({ user_id: userId })
    const result = await request('GET', `/bank-cards${query}`)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async saveBankCard(cardData) {
    const result = await request('POST', '/bank-cards', cardData)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async getTransactions(userId, limit = 50) {
    const query = queryString({ user_id: userId, limit })
    const result = await request('GET', `/transactions${query}`)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async saveTransaction(txData) {
    const result = await request('POST', '/transactions', txData)
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async syncAll(payload) {
    return request('POST', '/sync', payload)
  },

  async getStats() {
    const result = await request('GET', '/stats')
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async getAll() {
    const result = await request('GET', '/all')
    if (result && result.errCode === 0) {
      return result.data
    }
    return null
  },

  async clearAll() {
    return request('GET', '/clear')
  }
}

export default bridgeClient
