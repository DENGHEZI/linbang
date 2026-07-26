const db = uniCloud.database()
const dbCmd = db.command

const PLATFORM_FEE_RATE = 0.02

const RANDOM_TABLE = [
  23, 45, 67, 89, 12, 34, 56, 78, 90, 11,
  33, 55, 77, 99, 22, 44, 66, 88, 10, 31,
  53, 75, 97, 14, 36, 58, 80, 13, 35, 57,
  79, 91, 24, 46, 68, 82, 15, 37, 59, 71,
  93, 26, 48, 60, 84, 16, 38, 50, 72, 94,
  27, 49, 61, 83, 17, 39, 51, 73, 95, 28,
  40, 62, 85, 18, 32, 54, 76, 98, 29, 41,
  63, 86, 19, 42, 64, 87, 20, 43, 65, 81
]

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateOrderNo() {
  const now = new Date()
  const year = now.getFullYear().toString().slice(2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  let randomPart = ''
  for (let i = 0; i < 4; i++) {
    const tableIndex = RANDOM_TABLE[Math.floor(Math.random() * RANDOM_TABLE.length)]
    randomPart += tableIndex.toString().padStart(2, '0')
  }

  let charPart = ''
  for (let i = 0; i < 3; i++) {
    charPart += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }

  return `NO${year}${month}${day}${hours}${minutes}${seconds}${randomPart}${charPart}`
}

function getCurrentTimeString() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

exports.main = async (event, context) => {
  const { action, args = [] } = event
  const clientInfo = context.getClientInfo ? context.getClientInfo() : {}

  const handlers = {
    ping: async () => ({ errCode: 0, errMsg: 'pong' }),

    add: async (data) => {
      const {
        category, itemType, itemWeight, title, description,
        pickupAddress, deliveryAddress, pickupLocation, deliveryLocation,
        pickupTimeRange, price, urgency, deliveryTime, images, remark,
        contactPhone, userName, orderNo, location, user_id
      } = data

      if (!category || !itemType || !title || !pickupAddress || !deliveryAddress || !price) {
        return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
      }

      const orderPrice = Number(price) || 5
      const platformFee = orderPrice * PLATFORM_FEE_RATE
      const serviceFee = orderPrice * 0.1
      const riderIncome = orderPrice - platformFee - serviceFee
      const currentTime = getCurrentTimeString()

      const orderData = {
        orderNo: orderNo || generateOrderNo(),
        user_id: user_id || 'local_user',
        user_name: userName || '',
        category,
        itemType,
        itemWeight: itemWeight || 'light',
        title,
        description: description || '',
        pickupAddress,
        deliveryAddress,
        pickupLocation: pickupLocation || null,
        deliveryLocation: deliveryLocation || null,
        pickupTimeRange: pickupTimeRange || null,
        price: orderPrice,
        serviceFee: Math.round(serviceFee * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        riderIncome: Math.round(riderIncome * 100) / 100,
        urgency: urgency || 'normal',
        deliveryTime: deliveryTime || '',
        images: images || [],
        remark: remark || '',
        contactPhone: contactPhone || '',
        status: 'pending_payment',
        rider_id: null,
        rider_name: '',
        rider_phone: '',
        created_at: Date.now(),
        created_time: currentTime,
        updated_at: Date.now(),
        location: location || null
      }

      const result = await db.collection('order').add(orderData)

      return {
        errCode: 0,
        errMsg: '下单成功',
        data: {
          id: result.id,
          orderNo: orderData.orderNo,
          price: orderPrice,
          serviceFee: orderData.serviceFee,
          platformFee: orderData.platformFee,
          images: orderData.images || [],
          title: orderData.title,
          description: orderData.description || ''
        }
      }
    },

    list: async (params = {}) => {
      const { status, category, page = 1, pageSize = 10, type = 'all', uid } = params

      let query = {}
      if (type === 'user' && uid) {
        query.user_id = uid
      } else if (type === 'rider' && uid) {
        query.rider_id = uid
      }

      if (status) query.status = status
      if (category) query.category = category

      const countResult = await db.collection('order').where(query).count()
      const total = countResult.total

      const list = await db.collection('order')
        .where(query)
        .orderBy('created_at', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: { list: list.data || [], total, page, pageSize }
      }
    },

    detail: async (id) => {
      if (!id) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }

      const result = await db.collection('order').doc(id).get()
      if (!result.data || result.data.length === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      return { errCode: 0, errMsg: '获取成功', data: result.data[0] }
    },

    updateStatus: async (id, status, extraData = {}) => {
      if (!id || !status) return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }

      const validStatus = ['pending_payment', 'pending', 'accepted', 'picking', 'delivering', 'delivered', 'completed', 'cancelled', 'refunding']
      if (!validStatus.includes(status)) {
        return { errCode: 'INVALID_STATUS', errMsg: '无效的状态值' }
      }

      const updateData = { status, updated_at: Date.now() }

      if (status === 'accepted' && extraData.rider_id) {
        updateData.rider_id = extraData.rider_id
        updateData.rider_name = extraData.rider_name || ''
        updateData.rider_phone = extraData.rider_phone || ''
        updateData.accepted_at = Date.now()
      }

      if (status === 'picking') {
        updateData.picking_at = Date.now()
        if (extraData.proofsUploaded) {
          updateData.proofs_uploaded = true
          updateData.proofs_count = extraData.proofsCount || 0
        }
      }

      if (status === 'delivering') {
        updateData.delivering_at = Date.now()
      }

      if (status === 'delivered') {
        updateData.delivered_at = Date.now()
      }

      if (status === 'completed') {
        updateData.completed_at = Date.now()
        if (extraData.rating) updateData.rating = extraData.rating
      }

      if (status === 'cancelled') {
        updateData.cancelled_at = Date.now()
        if (extraData.cancelReason) updateData.cancelReason = extraData.cancelReason
      }

      const result = await db.collection('order').doc(id).update(updateData)
      if (result.updated === 0) {
        return { errCode: 'UPDATE_FAILED', errMsg: '状态更新失败' }
      }

      if (status === 'completed') {
        const order = await db.collection('order').doc(id).get()
        if (order.data && order.data[0] && order.data[0].rider_id) {
          const riderIncome = order.data[0].riderIncome || 0
          if (riderIncome > 0) {
            try {
              await db.collection('rider-income').add({
                rider_id: order.data[0].rider_id,
                order_id: id,
                amount: riderIncome,
                created_at: Date.now()
              })
            } catch (e) {
              console.warn('创建骑手收入记录失败:', e.message)
            }
          }
        }
      }

      return { errCode: 0, errMsg: '状态更新成功' }
    },

    grab: async (id, riderId, riderName = '', riderPhone = '') => {
      if (!id || !riderId) return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }

      const orderResult = await db.collection('order').doc(id).get()
      if (!orderResult.data || orderResult.data.length === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      const order = orderResult.data[0]
      if (order.status !== 'pending') {
        return { errCode: 'STATUS_ERROR', errMsg: '订单已被接单或已取消' }
      }
      if (order.rider_id) {
        return { errCode: 'ALREADY_GRABBED', errMsg: '订单已被其他骑手接走' }
      }

      await db.collection('order').doc(id).update({
        status: 'accepted',
        rider_id: riderId,
        rider_name: riderName,
        rider_phone: riderPhone,
        accepted_at: Date.now(),
        updated_at: Date.now()
      })

      if (order.riderIncome > 0) {
        try {
          await db.collection('rider-income').add({
            rider_id: riderId,
            order_id: id,
            order_no: order.orderNo,
            amount: order.riderIncome,
            type: 'grab',
            status: 'pending',
            created_at: Date.now()
          })
        } catch (e) {
          console.warn('创建骑手收入记录失败:', e.message)
        }
      }

      return {
        errCode: 0,
        errMsg: '接单成功',
        data: {
          id,
          orderNo: order.orderNo,
          title: order.title,
          category: order.category,
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          price: order.price,
          status: 'accepted'
        }
      }
    },

    getPendingOrders: async (params = {}) => {
      const { category, pageSize = 20 } = params || {}
      let query = { status: 'pending' }
      if (category) query.category = category

      const list = await db.collection('order')
        .where(query)
        .orderBy('created_at', 'desc')
        .limit(pageSize)
        .get()

      return { errCode: 0, errMsg: '获取成功', data: list.data || [] }
    },

    getDashboard: async (params = {}) => {
      const { days = 7 } = params || {}
      const startTime = Date.now() - days * 24 * 60 * 60 * 1000

      const orders = await db.collection('order')
        .where({ created_at: dbCmd.gte(startTime) })
        .get()

      const ordersList = orders.data || []
      const totalOrders = ordersList.length
      const completedOrders = ordersList.filter(o => o.status === 'completed').length
      const activeRiders = new Set(ordersList.map(o => o.rider_id).filter(Boolean)).size
      const platformRevenue = ordersList.reduce((sum, o) => sum + (o.platformFee || 0), 0)
      const totalRevenue = ordersList.reduce((sum, o) => sum + (o.price || 0), 0)
      const riderIncome = ordersList.reduce((sum, o) => sum + (o.riderIncome || 0), 0)
      const serviceFee = ordersList.reduce((sum, o) => sum + (o.serviceFee || 0), 0)

      const ratedOrders = ordersList.filter(o => o.rating)
      const totalRating = ratedOrders.reduce((sum, o) => sum + (o.rating ? o.rating.score : 5), 0)
      const goodRate = ratedOrders.length > 0 ? Math.round((totalRating / (ratedOrders.length * 5)) * 100) / 100 : 1.0

      const dailyStats = []
      for (let i = days - 1; i >= 0; i--) {
        const dayStart = new Date()
        dayStart.setHours(0, 0, 0, 0)
        dayStart.setDate(dayStart.getDate() - i)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const dayOrders = ordersList.filter(o => o.created_at >= dayStart.getTime() && o.created_at < dayEnd.getTime())
        dailyStats.push({
          date: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
          count: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + (o.price || 0), 0)
        })
      }

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          totalOrders,
          completedOrders,
          activeRiders,
          platformRevenue: Math.round(platformRevenue * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          riderIncome: Math.round(riderIncome * 100) / 100,
          serviceFee: Math.round(serviceFee * 100) / 100,
          goodRate,
          dailyStats,
          topRiders: []
        }
      }
    },

    countByStatus: async (params = {}) => {
      const { userType = 'user', uid, status } = params || {}
      let query = {}
      if (userType === 'user' && uid) query.user_id = uid
      else if (userType === 'rider' && uid) query.rider_id = uid
      if (status) query.status = status

      const result = await db.collection('order').where(query).count()
      return { errCode: 0, errMsg: '获取成功', data: { count: result.total } }
    },

    savePickupProof: async (orderId, images = []) => {
      if (!orderId) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }
      if (!images || !Array.isArray(images) || images.length === 0) {
        return { errCode: 'PARAM_ERROR', errMsg: '请上传凭证图片' }
      }

      const orderResult = await db.collection('order').doc(orderId).get()
      if (!orderResult.data || orderResult.data.length === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      const order = orderResult.data[0]
      const existingPickupProofs = order.pickup_proofs || []
      const newProofs = images.map((url, index) => ({
        url,
        uploaded_at: Date.now(),
        index: existingPickupProofs.length + index
      }))

      const updateData = {
        pickup_proofs: [...existingPickupProofs, ...newProofs],
        pickup_proofs_count: existingPickupProofs.length + newProofs.length,
        proofs_uploaded_at: Date.now(),
        updated_at: Date.now()
      }

      const result = await db.collection('order').doc(orderId).update(updateData)
      if (result.updated === 0) {
        return { errCode: 'UPDATE_FAILED', errMsg: '凭证保存失败' }
      }

      return {
        errCode: 0,
        errMsg: '凭证上传成功',
        data: {
          orderId,
          totalProofs: updateData.pickup_proofs_count,
          newProofsCount: newProofs.length
        }
      }
    },

    getPickupProofs: async (orderId) => {
      if (!orderId) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }

      const orderResult = await db.collection('order').doc(orderId).get()
      if (!orderResult.data || orderResult.data.length === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      const order = orderResult.data[0]
      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          orderId,
          orderNo: order.orderNo,
          pickup_proofs: order.pickup_proofs || [],
          pickup_proofs_count: order.pickup_proofs_count || 0,
          proofs_uploaded_at: order.proofs_uploaded_at || null
        }
      }
    },

    submitReview: async (orderId, reviewData) => {
      if (!orderId) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }
      if (!reviewData || typeof reviewData.score !== 'number' || reviewData.score < 1 || reviewData.score > 5) {
        return { errCode: 'PARAM_ERROR', errMsg: '评分参数不完整' }
      }

      const orderResult = await db.collection('order').doc(orderId).get()
      if (!orderResult.data || orderResult.data.length === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      const order = orderResult.data[0]
      if (order.status !== 'completed') {
        return { errCode: 'INVALID_STATUS', errMsg: '订单未完成，无法评价' }
      }

      if (order.rating && order.rating.score) {
        return { errCode: 'ALREADY_REVIEWED', errMsg: '您已评价过该订单' }
      }

      const ratingData = {
        score: reviewData.score,
        dimensions: reviewData.dimensions || {},
        tags: reviewData.tags || [],
        comment: reviewData.comment || '',
        created_at: Date.now()
      }

      const updateData = {
        rating: ratingData,
        reviewed_at: Date.now(),
        updated_at: Date.now()
      }

      const result = await db.collection('order').doc(orderId).update(updateData)
      if (result.updated === 0) {
        return { errCode: 'UPDATE_FAILED', errMsg: '评价提交失败' }
      }

      if (order.rider_id) {
        try {
          const riderOrders = await db.collection('order')
            .where({ rider_id: order.rider_id, status: 'completed' })
            .get()
          const ordersList = riderOrders.data || []
          const ratedOrders = ordersList.filter(o => o.rating && o.rating.score)
          const totalScore = ratedOrders.reduce((sum, o) => sum + o.rating.score, 0)
          const avgRating = ratedOrders.length > 0 ? Math.round((totalScore / ratedOrders.length) * 10) / 10 : 5.0

          try {
            const ratingResult = await db.collection('rider-rating').where({ rider_id: order.rider_id }).get()
            if (ratingResult.data && ratingResult.data.length > 0) {
              await db.collection('rider-rating').doc(ratingResult.data[0]._id).update({
                total_orders: ratedOrders.length,
                total_rating: totalScore,
                average_rating: avgRating,
                updated_at: Date.now()
              })
            } else {
              await db.collection('rider-rating').add({
                rider_id: order.rider_id,
                total_orders: ratedOrders.length,
                total_rating: totalScore,
                average_rating: avgRating,
                created_at: Date.now(),
                updated_at: Date.now()
              })
            }
          } catch (e) {
            console.warn('更新骑手评分失败:', e.message)
          }
        } catch (e) {
          console.warn('计算骑手评分失败:', e.message)
        }
      }

      return {
        errCode: 0,
        errMsg: '评价提交成功',
        data: {
          orderId,
          rating: ratingData
        }
      }
    },

    getReview: async (orderId) => {
      if (!orderId) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }

      const orderResult = await db.collection('order').doc(orderId).get()
      if (!orderResult.data || orderResult.data.length === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      const order = orderResult.data[0]
      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          orderId,
          rating: order.rating || null,
          reviewed_at: order.reviewed_at || null
        }
      }
    },

    confirmReceipt: async (orderId) => {
      if (!orderId) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }

      const orderResult = await db.collection('order').doc(orderId).get()
      if (!orderResult.data || orderResult.data.length === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      const order = orderResult.data[0]
      if (order.status !== 'delivered') {
        return { errCode: 'INVALID_STATUS', errMsg: '订单状态不正确，无法确认收货' }
      }

      await db.collection('order').doc(orderId).update({
        status: 'completed',
        completed_at: Date.now(),
        updated_at: Date.now()
      })

      if (order.rider_id && order.riderIncome > 0) {
        try {
          await db.collection('rider-income').add({
            rider_id: order.rider_id,
            order_id: orderId,
            order_no: order.orderNo,
            amount: order.riderIncome,
            type: 'delivery',
            status: 'settled',
            created_at: Date.now(),
            settled_at: Date.now()
          })
        } catch (e) {
          console.warn('创建骑手收入记录失败:', e.message)
        }
      }

      return { errCode: 0, errMsg: '确认收货成功' }
    },

    delete: async (id) => {
      if (!id) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }

      const result = await db.collection('order').doc(id).remove()
      if (result.deleted === 0) {
        return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
      }

      return { errCode: 0, errMsg: '删除成功' }
    },

    batchDelete: async (ids = []) => {
      if (!ids || !ids.length) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }

      const promises = ids.map(id => db.collection('order').doc(id).remove())
      await Promise.all(promises)

      return { errCode: 0, errMsg: '批量删除成功' }
    }
  }

  const handler = handlers[action]
  if (!handler) {
    return { errCode: 'NOT_FOUND', errMsg: `未知的操作: ${action}` }
  }

  try {
    return await handler(...args)
  } catch (error) {
    console.error(`云函数执行错误 [${action}]:`, error)
    return { errCode: 'SYSTEM_ERROR', errMsg: '服务器内部错误' }
  }
}
