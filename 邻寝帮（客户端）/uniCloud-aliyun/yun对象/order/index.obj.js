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

module.exports = {
	_before: async function () {
		const clientInfo = this.getClientInfo()
		this.uid = clientInfo.uniIdToken ? clientInfo.uid : null
		this.role = clientInfo.role || 'user'
	},

	add: async function (data) {
		const {
			category,
			itemType,
			itemWeight,
			title,
			description,
			pickupAddress,
			deliveryAddress,
			pickupLocation,
			deliveryLocation,
			pickupTimeRange,
			price,
			urgency,
			deliveryTime,
			images,
			remark,
			contactPhone,
			userName,
			orderNo,
			location
		} = data

		if (!category || !itemType || !title || !pickupAddress || !deliveryAddress || !price) {
			return {
				errCode: 'PARAM_ERROR',
				errMsg: '参数不完整，请检查必填项'
			}
		}

		const orderPrice = Number(price) || 5
		const platformFee = orderPrice * PLATFORM_FEE_RATE
		const serviceFee = orderPrice * 0.1
		const riderIncome = orderPrice - platformFee - serviceFee

		const currentTime = getCurrentTimeString()

		const orderData = {
			orderNo: orderNo || generateOrderNo(),
			user_id: this.uid || data.user_id || 'local_user',
			user_name: userName || data.user_name || '',
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
			status: 'pending',
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
				platformFee: orderData.platformFee
			}
		}
	},

	list: async function (params = {}) {
		const { status, category, page = 1, pageSize = 10, type = 'all', uid } = params

		let query = {}

		if (type === 'user' && uid) {
			query.user_id = uid
		} else if (type === 'rider' && uid) {
			query.rider_id = uid
		} else if (type === 'all') {
			if (this.role !== 'admin') {
				query.$or = [
					{ user_id: this.uid },
					{ rider_id: this.uid }
				]
			}
		}

		if (status) {
			query.status = status
		}

		if (category) {
			query.category = category
		}

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
			data: {
				list: list.data || [],
				total,
				page,
				pageSize
			}
		}
	},

	detail: async function (id) {
		if (!id) {
			return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }
		}

		const result = await db.collection('order').doc(id).get()

		if (!result.data || result.data.length === 0) {
			return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
		}

		return {
			errCode: 0,
			errMsg: '获取成功',
			data: result.data[0]
		}
	},

	update: async function (id, data) {
		if (!id) {
			return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }
		}

		const updateData = { updated_at: Date.now() }
		const allowedFields = ['title', 'description', 'pickupAddress', 'deliveryAddress', 'price', 'contactPhone', 'remark', 'images']
		allowedFields.forEach(field => {
			if (data[field] !== undefined) {
				updateData[field] = data[field]
			}
		})

		const result = await db.collection('order').doc(id).update(updateData)
		if (result.updated === 0) {
			return { errCode: 'UPDATE_FAILED', errMsg: '更新失败' }
		}

		return { errCode: 0, errMsg: '更新成功' }
	},

	updateStatus: async function (id, status, extraData = {}) {
		if (!id || !status) {
			return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
		}

		const validStatus = ['pending', 'accepted', 'picking', 'delivering', 'completed', 'cancelled', 'refunding']
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

		if (status === 'completed') {
			updateData.completed_at = Date.now()
			if (extraData.rating) {
				updateData.rating = extraData.rating
			}
		}

		if (status === 'cancelled') {
			updateData.cancelled_at = Date.now()
			if (extraData.cancelReason) {
				updateData.cancelReason = extraData.cancelReason
			}
		}

		const result = await db.collection('order').doc(id).update(updateData)
		if (result.updated === 0) {
			return { errCode: 'UPDATE_FAILED', errMsg: '状态更新失败' }
		}

		if (status === 'completed') {
			const order = await db.collection('order').doc(id).get()
			if (order.data && order.data[0] && order.data[0].rider_id) {
				await db.collection('rider-income').where({
					order_id: id,
					rider_id: order.data[0].rider_id,
					status: 'pending'
				}).update({ status: 'settled', settled_at: Date.now() })

				await this.updateRiderRating(order.data[0].rider_id, extraData.rating || null)
			}
		}

		return { errCode: 0, errMsg: '状态更新成功' }
	},

	updateRiderRating: async function (riderId, rating) {
		if (!riderId) return

		const stats = await db.collection('rider-rating').where({ rider_id: riderId }).get()
		let ratingData = stats.data && stats.data[0]

		if (!ratingData) {
			await db.collection('rider-rating').add({
				rider_id: riderId,
				total_orders: 1,
				total_rating: rating ? rating.score : 5,
				average_rating: rating ? rating.score : 5.0,
				rating_distribution: {
					"5": rating && rating.score === 5 ? 1 : 0,
					"4": rating && rating.score === 4 ? 1 : 0,
					"3": rating && rating.score === 3 ? 1 : 0,
					"2": rating && rating.score === 2 ? 1 : 0,
					"1": rating && rating.score === 1 ? 1 : 0
				},
				created_at: Date.now(),
				updated_at: Date.now()
			})
		} else {
			const newTotal = ratingData.total_orders + 1
			const newTotalRating = ratingData.total_rating + (rating ? rating.score : 5)
			const distribution = ratingData.rating_distribution || {}
			if (rating) {
				distribution[String(rating.score)] = (distribution[String(rating.score)] || 0) + 1
			}
			await db.collection('rider-rating').doc(ratingData._id).update({
				total_orders: newTotal,
				total_rating: newTotalRating,
				average_rating: Math.round((newTotalRating / newTotal) * 10) / 10,
				rating_distribution: distribution,
				updated_at: Date.now()
			})
		}
	},

	remove: async function (id) {
		if (!id) {
			return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }
		}

		const result = await db.collection('order').doc(id).remove()
		if (result.deleted === 0) {
			return { errCode: 'DELETE_FAILED', errMsg: '删除失败' }
		}

		return { errCode: 0, errMsg: '删除成功' }
	},

	grab: async function (id, riderId, riderName = '', riderPhone = '') {
		if (!id || !riderId) {
			return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
		}

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
			await db.collection('rider-income').add({
				rider_id: riderId,
				order_id: id,
				order_no: order.orderNo,
				amount: order.riderIncome,
				type: 'grab',
				status: 'pending',
				created_at: Date.now()
			})
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

	cancel: async function (id, reason = '') {
		if (!id) {
			return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }
		}

		const orderResult = await db.collection('order').doc(id).get()
		if (!orderResult.data || orderResult.data.length === 0) {
			return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
		}

		const order = orderResult.data[0]
		if (order.status === 'completed' || order.status === 'cancelled') {
			return { errCode: 'STATUS_ERROR', errMsg: '订单无法取消' }
		}

		await db.collection('order').doc(id).update({
			status: 'cancelled',
			cancelReason: reason,
			cancelled_at: Date.now(),
			updated_at: Date.now()
		})

		return { errCode: 0, errMsg: '取消成功' }
	},

	getPendingOrders: async function (params = {}) {
		const { category, pageSize = 20 } = params || {}

		let query = { status: 'pending' }
		if (category) {
			query.category = category
		}

		const list = await db.collection('order')
			.where(query)
			.orderBy('created_at', 'desc')
			.limit(pageSize)
			.get()

		return {
			errCode: 0,
			errMsg: '获取成功',
			data: list.data || []
		}
	},

	getDashboard: async function (params = {}) {
		try {
			const { days = 7 } = params || {}
			const startTime = Date.now() - days * 24 * 60 * 60 * 1000

			const orders = await db.collection('order')
				.where({
					created_at: dbCmd.gte(startTime)
				})
				.get()

			const ordersList = orders.data || []

			const totalOrders = ordersList.length
			const completedOrders = ordersList.filter(o => o.status === 'completed').length
			const cancelledOrders = ordersList.filter(o => o.status === 'cancelled').length
			const pendingOrders = ordersList.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'picking' || o.status === 'delivering').length

			const platformRevenue = ordersList.reduce((sum, o) => sum + (o.platformFee || 0), 0)
			const riderIncome = ordersList.reduce((sum, o) => sum + (o.riderIncome || 0), 0)
			const totalRevenue = ordersList.reduce((sum, o) => sum + (o.price || 0), 0)
			const serviceFee = ordersList.reduce((sum, o) => sum + (o.serviceFee || 0), 0)

			const uniqueRiders = new Set(ordersList.map(o => o.rider_id).filter(Boolean))
			const activeRiders = uniqueRiders.size

			const totalRating = ordersList.reduce((sum, o) => sum + (o.rating ? o.rating.score : 5), 0)
			const ratedOrders = ordersList.filter(o => o.rating).length
			const goodRate = ratedOrders > 0 ? Math.round((totalRating / (ratedOrders * 5)) * 100) / 100 : 1.0

			const dailyStats = []
			for (let i = days - 1; i >= 0; i--) {
				const dayStart = new Date()
				dayStart.setHours(0, 0, 0, 0)
				dayStart.setDate(dayStart.getDate() - i)
				const dayEnd = new Date(dayStart)
				dayEnd.setDate(dayEnd.getDate() + 1)

				const dayOrders = ordersList.filter(o => {
					return o.created_at >= dayStart.getTime() && o.created_at < dayEnd.getTime()
				})

				dailyStats.push({
					date: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
					count: dayOrders.length,
					revenue: dayOrders.reduce((sum, o) => sum + (o.price || 0), 0)
				})
			}

			const riders = await db.collection('rider-income')
				.where({ status: 'settled' })
				.orderBy('created_at', 'desc')
				.limit(10)
				.get()

			return {
				errCode: 0,
				errMsg: '获取成功',
				data: {
					totalOrders,
					completedOrders,
					cancelledOrders,
					pendingOrders,
					activeRiders,
					platformRevenue: Math.round(platformRevenue * 100) / 100,
					totalRevenue: Math.round(totalRevenue * 100) / 100,
					riderIncome: Math.round(riderIncome * 100) / 100,
					serviceFee: Math.round(serviceFee * 100) / 100,
					goodRate,
					dailyStats,
					topRiders: riders.data || []
				}
			}
		} catch (error) {
			console.error('getDashboard error:', error)
			return {
				errCode: 'SYSTEM_ERROR',
				errMsg: '获取统计数据失败',
				data: {
					totalOrders: 0,
					completedOrders: 0,
					cancelledOrders: 0,
					pendingOrders: 0,
					activeRiders: 0,
					platformRevenue: 0,
					totalRevenue: 0,
					riderIncome: 0,
					serviceFee: 0,
					goodRate: 1.0,
					dailyStats: [],
					topRiders: []
				}
			}
		}
	},

	countByStatus: async function (params = {}) {
		const { userType = 'user', uid, status } = params || {}
		let query = {}
		if (userType === 'user' && uid) {
			query.user_id = uid
		} else if (userType === 'rider' && uid) {
			query.rider_id = uid
		}
		if (status) {
			query.status = status
		}
		const result = await db.collection('order').where(query).count()
		return {
			errCode: 0,
			errMsg: '获取成功',
			data: { count: result.total }
		}
	}
}
