<template>
	<view class="page-container">
		<view class="header">
			<view class="deco-circle deco-circle-1"></view>
			<view class="deco-circle deco-circle-2"></view>

			<view class="header-top">
				<view class="user-info" @click="goProfile">
					<view class="avatar">
						<view class="avatar-inner"></view>
						<view class="online-dot" v-if="isOnline"></view>
					</view>
					<view class="user-detail">
						<view class="name-row">
							<text class="user-name">{{ riderProfile.nickname || '骑手' }}</text>
							<view class="status-badge" :class="{ online: isOnline }" @click="toggleOnline">
								<view class="status-dot"></view>
								<text class="status-text">{{ isOnline ? '接单中' : '休息中' }}</text>
							</view>
						</view>
						<text class="user-id">工号：{{ (riderProfile.id || '').split('_')[1] || '001' }} | {{ riderProfile.school || '未设置' }}</text>
					</view>
				</view>
				<view class="header-actions">
					<view class="action-btn" @click="goClient" hover-class="action-hover">
						<view class="icon-user"></view>
						<text class="action-label">客户</text>
					</view>
					<view class="action-btn" @click="goWallet">
						<view class="icon-wallet"></view>
					</view>
					<view class="action-btn" @click="goNotifications">
						<view class="icon-bell"></view>
						<view class="badge-dot">3</view>
					</view>
				</view>
			</view>

			<view class="earnings-card">
				<view class="earnings-item">
					<text class="earnings-value">{{ todayEarnings }}</text>
					<text class="earnings-label">今日收益 (元)</text>
				</view>
				<view class="earnings-divider"></view>
				<view class="earnings-item">
					<text class="earnings-value">{{ todayOrders }}</text>
					<text class="earnings-label">今日单数</text>
				</view>
				<view class="earnings-divider"></view>
				<view class="earnings-item">
					<text class="earnings-value">{{ totalEarnings }}</text>
					<text class="earnings-label">累计收益 (元)</text>
				</view>
			</view>
			<view class="pending-settlement-bar" v-if="pendingSettlementCount > 0">
				<view class="pending-settlement-icon">⏳</view>
				<text class="pending-settlement-text">{{ pendingSettlementCount }} 笔订单等待客户确认收货后结算</text>
			</view>
		</view>

		<view class="content">
			<view class="quick-actions">
				<view class="quick-card highlight" @click="goGrabOrder">
					<view class="quick-icon-wrap">
						<view class="icon-grab"></view>
						<view class="pulse-ring"></view>
						<view class="pulse-ring delay"></view>
					</view>
					<view class="quick-info">
						<text class="quick-title">抢单大厅</text>
						<text class="quick-desc">
							<text class="order-count">{{ availableOrders }}</text>
							<text class="order-unit">个订单待接单</text>
						</text>
					</view>
					<view class="quick-arrow"></view>
				</view>
			</view>

			<view class="tab-section">
				<view class="section-header">
					<text class="section-title">我的接单</text>
					<view class="tab-btns">
						<view class="tab-btn" :class="{ active: currentTab === 'pending' }" @click="switchTab('pending')">
							<text class="tab-btn-text">待配送</text>
							<view class="tab-badge" v-if="pendingCount">{{ pendingCount }}</view>
						</view>
						<view class="tab-btn" :class="{ active: currentTab === 'completed' }" @click="switchTab('completed')">
							<text class="tab-btn-text">已完成</text>
						</view>
					</view>
				</view>

				<view class="order-list" v-if="currentTab === 'pending'">
					<view class="order-card" v-for="item in pendingOrders" :key="item.id" @click="goOrderDetail(item)">
						<view class="order-status-tag" :class="item.statusClass">
							<text class="status-tag-text">{{ item.statusText }}</text>
						</view>
						<view class="order-main">
							<view class="order-type-row">
								<view class="order-type" :class="item.typeClass">
									<text class="type-text">{{ item.type }}</text>
								</view>
								<text class="order-fee">¥{{ item.fee }}</text>
							</view>
							<view class="order-route">
								<view class="route-point">
									<view class="point-dot"></view>
									<text class="point-text">{{ item.from }}</text>
								</view>
								<view class="route-line"></view>
								<view class="route-point">
									<view class="point-dot destination"></view>
									<text class="point-text">{{ item.to }}</text>
								</view>
							</view>
							<view class="order-meta">
								<view class="meta-item">
									<view class="icon-clock"></view>
									<text class="meta-text">{{ item.time }}</text>
								</view>
								<view class="meta-item">
									<view class="icon-distance"></view>
									<text class="meta-text">{{ item.distance }}</text>
								</view>
							</view>
						</view>
						<view class="order-action">
							<view class="action-btn-primary" @click.stop="handleDeliver(item)">
								<text class="btn-text">{{ item.actionText }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="order-list" v-else>
					<view class="order-card completed" v-for="item in completedOrders" :key="item.id">
						<view class="completed-badge" :class="{ pending: item.status === 'delivered' }">
							<view class="icon-check"></view>
						</view>
						<view class="order-main">
							<view class="order-type-row">
								<view class="order-type" :class="item.typeClass">
									<text class="type-text">{{ item.type }}</text>
								</view>
								<text class="order-fee">¥{{ item.fee }}</text>
								<view class="pending-tag" v-if="item.status === 'delivered'">
									<text class="pending-tag-text">待结算</text>
								</view>
							</view>
							<view class="order-route">
								<text class="route-summary">{{ item.from }} → {{ item.to }}</text>
							</view>
							<view class="order-meta">
								<view class="meta-item">
									<text class="meta-text">{{ item.completedTime }}</text>
								</view>
								<view class="meta-item rating">
									<view class="icon-star"></view>
									<text class="meta-text">{{ item.rating }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="earnings-section">
				<view class="section-header">
					<text class="section-title">收益统计</text>
					<view class="view-all" @click="goEarningsDetail">
						<text class="view-all-text">查看明细</text>
						<view class="icon-arrow-right"></view>
					</view>
				</view>

				<view class="stats-grid">
					<view class="stat-card">
						<view class="stat-icon blue">
							<view class="icon-week"></view>
						</view>
						<text class="stat-value">¥{{ weekEarnings }}</text>
						<text class="stat-label">本周收益</text>
					</view>
					<view class="stat-card">
						<view class="stat-icon green">
							<view class="icon-month"></view>
						</view>
						<text class="stat-value">¥{{ monthEarnings }}</text>
						<text class="stat-label">本月收益</text>
					</view>
					<view class="stat-card">
						<view class="stat-icon amber">
							<view class="icon-rank"></view>
						</view>
						<text class="stat-value">{{ weekRank }}</text>
						<text class="stat-label">本周排名</text>
					</view>
					<view class="stat-card">
						<view class="stat-icon purple">
							<view class="icon-rating"></view>
						</view>
						<text class="stat-value">{{ avgRating }}</text>
						<text class="stat-label">平均评分</text>
					</view>
				</view>

				<view class="quick-deliver-card" @click="goPublish">
					<view class="deliver-left">
						<view class="icon-rocket"></view>
						<view class="deliver-info">
							<text class="deliver-title">即时发布</text>
							<text class="deliver-desc">快速创建配送订单</text>
						</view>
					</view>
					<view class="deliver-btn">
						<text class="deliver-btn-text">去发布</text>
					</view>
				</view>
			</view>
		</view>

		<view class="grab-modal" v-if="showGrabModal" @click="closeGrabModal">
			<view class="grab-modal-content" @click.stop>
				<view class="grab-modal-header">
					<text class="grab-modal-title">抢单大厅</text>
					<view class="grab-modal-close" @click="closeGrabModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="grab-list">
					<view class="grab-item" v-for="order in grabOrders" :key="order.id">
						<view class="grab-item-header">
							<view class="grab-type" :class="order.typeClass">
								<text class="grab-type-text">{{ order.type }}</text>
							</view>
							<text class="grab-fee">¥{{ order.fee }}</text>
							<view class="grab-urgent" v-if="order.urgent">
								<text class="urgent-text">加急</text>
							</view>
						</view>
						<view class="grab-route">
							<text class="grab-from">{{ order.from }}</text>
							<text class="grab-arrow">→</text>
							<text class="grab-to">{{ order.to }}</text>
						</view>
						<view class="grab-images" v-if="order.images && order.images.length > 0">
							<image 
								class="grab-thumb" 
								v-for="(img, idx) in order.images.slice(0, 3)" 
								:key="idx" 
								:src="img" 
								mode="aspectFill"
								@click="previewGrabImage(order.images, idx)"
							></image>
							<view class="grab-more" v-if="order.images.length > 3">
								<text class="grab-more-text">+{{ order.images.length - 3 }}</text>
							</view>
						</view>
						<view class="grab-meta">
							<text class="grab-meta-item">📏 {{ order.distance }}</text>
							<text class="grab-meta-item">⏱ {{ order.eta }}</text>
							<text class="grab-meta-item">💰 预计收益 ¥{{ order.fee }}</text>
						</view>
						<view class="grab-actions">
							<view class="grab-btn" @click="grabOrder(order)">
								<text class="grab-btn-text">立即抢单</text>
							</view>
						</view>
					</view>
					<view class="grab-empty" v-if="grabOrders.length === 0">
						<text class="empty-text">暂无新订单，请稍后刷新</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { orderService, onOrderChanged, offOrderChanged } from '@/services/order.js'
	import { initService } from '@/services/init.js'
	
	export default {
		data() {
			const rider = initService.getRider()
			return {
				isOnline: rider.isOnline,
				currentTab: 'pending',
				todayEarnings: rider.todayEarnings,
				todayOrders: rider.todayOrders,
				totalEarnings: rider.totalEarnings,
				weekEarnings: rider.weekEarnings,
				monthEarnings: rider.monthEarnings,
				weekRank: rider.weekRank,
				avgRating: rider.rating,
				availableOrders: 0,
				pendingOrders: [],
				completedOrders: [],
				showGrabModal: false,
				grabOrders: [],
				_pollTimer: null,
				_settledOrderIds: [],
				pendingSettlementCount: 0,
				riderProfile: rider
			}
		},
		computed: {
			pendingCount() {
				return this.pendingOrders.length
			}
		},
		methods: {
			toggleOnline() {
				this.isOnline = !this.isOnline
				uni.showToast({
					title: this.isOnline ? '已开启接单' : '已暂停接单',
					icon: 'none'
				})
			},
			switchTab(tab) {
				this.currentTab = tab
			},
			goGrabOrder() {
				if (!this.isOnline) {
					uni.showToast({
						title: '请先开启接单状态',
						icon: 'none'
					})
					return
				}
				this.showGrabModal = true
			},
			closeGrabModal() {
				this.showGrabModal = false
			},
			previewGrabImage(images, index) {
				uni.previewImage({
					current: images[index],
					urls: images
				})
			},
			async grabOrder(order) {
				if (!this.isOnline) {
					uni.showToast({
						title: '请先开启接单状态',
						icon: 'none'
					})
					return
				}
				
				const confirmed = await new Promise(resolve => {
					uni.showModal({
						title: '确认接单',
						content: `确认接取此订单？\n${order.type} | ¥${order.fee}`,
						success: (res) => resolve(res.confirm)
					})
				})
				
				if (!confirmed) return
				
				uni.showLoading({ title: '接单中...' })
				
				try {
					const riderInfo = uni.getStorageSync('riderInfo') || {}
					const userId = riderInfo._id || 'local_rider'
					
					const result = await orderService.grab(
						order.id.toString(),
						userId,
						riderInfo.name || riderInfo.nickname || '骑手',
						riderInfo.phone || ''
					)
					
					uni.hideLoading()
					
					if (result.errCode === 0) {
						const newOrder = {
							id: order.id,
							type: order.type,
							typeClass: order.typeClass,
							fee: order.fee,
							from: order.from,
							to: order.to,
							time: '距超时 30分钟',
							distance: order.distance,
							statusText: '待取货',
							statusClass: 'pending',
							actionText: '去取货',
							status: 'accepted',
							images: order.images || []
						}
						this.pendingOrders.unshift(newOrder)
						this.savePendingOrders()
						this.grabOrders = this.grabOrders.filter(o => o.id !== order.id)
						this.availableOrders = this.grabOrders.length
						this.showGrabModal = false
						this.todayEarnings += order.fee * 0.88
						this.todayOrders += 1
						uni.showToast({
							title: '接单成功！',
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: result.errMsg || '接单失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.hideLoading()
					console.error('接单失败:', error)
					
					const newOrder = {
						id: order.id,
						type: order.type,
						typeClass: order.typeClass,
						fee: order.fee,
						from: order.from,
						to: order.to,
						time: '距超时 30分钟',
						distance: order.distance,
						statusText: '待取货',
						statusClass: 'pending',
						actionText: '去取货',
						status: 'accepted',
						images: order.images || []
					}
					this.pendingOrders.unshift(newOrder)
					this.savePendingOrders()
					this.grabOrders = this.grabOrders.filter(o => o.id !== order.id)
					this.availableOrders = this.grabOrders.length
					this.showGrabModal = false
					this.todayEarnings += order.fee * 0.88
					this.todayOrders += 1
					uni.showToast({
						title: '接单成功（离线）',
						icon: 'success'
					})
				}
			},
			goOrderDetail(item) {
				uni.showToast({
					title: '订单 #' + item.id,
					icon: 'none'
				})
			},
			handleDeliver(item) {
				if (item.actionText === '去取货' || item.statusText === '待取货') {
					this.startPicking(item)
				} else if (item.actionText === '去送达' || item.statusText === '配送中' || item.actionText === '确认完成') {
					this.completeDelivery(item)
				} else {
					this.completeDelivery(item)
				}
			},
			async startPicking(item) {
				uni.showModal({
					title: '确认取货',
					content: `已到取货点？\n确认后订单将标记为配送中，可进行送达操作。`,
					confirmText: '确认取货',
					cancelText: '上传凭证',
					success: async (res) => {
						if (res.confirm) {
							try {
								uni.showLoading({ title: '更新状态中...' })
								await orderService.updateStatus(item.id, 'picking', {})
								
								const ordersData = uni.getStorageSync('orders_data') || []
								const idx = ordersData.findIndex(o => String(o._id) === String(item.id))
								if (idx !== -1) {
									ordersData[idx].status = 'picking'
									ordersData[idx].picking_at = Date.now()
									ordersData[idx].updated_at = Date.now()
									uni.setStorageSync('orders_data', ordersData)
								}
								
								const pendingOrders = uni.getStorageSync('rider_pending_orders') || []
								const orderIndex = pendingOrders.findIndex(o => String(o.id) === String(item.id))
								if (orderIndex !== -1) {
									pendingOrders[orderIndex].status = 'picking'
									pendingOrders[orderIndex].statusText = '配送中'
									pendingOrders[orderIndex].statusClass = 'delivering'
									pendingOrders[orderIndex].actionText = '去送达'
									uni.setStorageSync('rider_pending_orders', pendingOrders)
								}
								
								try {
									const records = uni.getStorageSync('order_status') || {}
									records[item.id] = { status: 'picking', updatedAt: Date.now() }
									uni.setStorageSync('order_status', records)
									uni.setStorageSync('order_events', Date.now())
								} catch (e) {}
								
								this.loadPendingOrders()
								
								uni.hideLoading()
								uni.showToast({ title: '已取货，配送中', icon: 'success' })
							} catch (err) {
								uni.hideLoading()
								console.warn('[骑手] 取货状态更新失败:', err.message)
								this.updateOrderStatus(item.id, 'picking')
								try {
									const ordersData = uni.getStorageSync('orders_data') || []
									const idx = ordersData.findIndex(o => String(o._id) === String(item.id))
									if (idx !== -1) {
										ordersData[idx].status = 'picking'
										ordersData[idx].picking_at = Date.now()
										ordersData[idx].updated_at = Date.now()
										uni.setStorageSync('orders_data', ordersData)
									}
									uni.setStorageSync('order_events', Date.now())
								} catch (e) {}
								uni.showToast({ title: '已取货', icon: 'success' })
							}
						} else if (res.cancel) {
							uni.navigateTo({
								url: '/pages/scan-result/index?orderId=' + item.id
							})
						}
					}
				})
			},
			async completeDelivery(item) {
				if (this._settledOrderIds.includes(item.id)) {
					uni.showToast({
						title: '订单已完成结算',
						icon: 'none'
					})
					return
				}

				uni.showModal({
					title: '确认送达',
					content: `订单 ${item.id} 已送达？\n等待客户确认收货后将进行结算。`,
					success: async (res) => {
						if (!res.confirm) return
						
						try {
							uni.showLoading({ title: '正在完成配送...' })
							
							try {
								await orderService.updateStatus(item.id, 'delivered')
								console.log('[骑手] 订单已标记送达，等待客户确认')
							} catch (err) {
								console.warn('[骑手] 云端状态更新失败，尝试本地更新:', err.message)
							}
							
							try {
								const pendingOrders = uni.getStorageSync('rider_pending_orders') || []
								const orderIndex = pendingOrders.findIndex(o => String(o.id) === String(item.id))
								if (orderIndex !== -1) {
									pendingOrders[orderIndex].status = 'delivered'
									pendingOrders[orderIndex].statusText = '已送达'
									pendingOrders[orderIndex].statusClass = 'delivered'
									pendingOrders[orderIndex].actionText = '查看详情'
									uni.setStorageSync('rider_pending_orders', pendingOrders)
								}
								
								try {
									const ordersData = uni.getStorageSync('orders_data') || []
									const dataIndex = ordersData.findIndex(o => String(o._id) === String(item.id))
									if (dataIndex !== -1) {
										ordersData[dataIndex].status = 'delivered'
										ordersData[dataIndex].delivered_at = Date.now()
										uni.setStorageSync('orders_data', ordersData)
									}
								} catch (e) {
									console.warn('[骑手] 更新orders_data失败:', e.message)
								}
								
								const completedOrders = uni.getStorageSync('rider_completed_orders') || []
								completedOrders.unshift({
									...item,
									status: 'delivered',
									statusText: '已送达',
									statusClass: 'delivered',
									actionText: '等待确认',
									completedTime: new Date().toLocaleString('zh-CN'),
									rating: '暂无评分'
								})
								uni.setStorageSync('rider_completed_orders', completedOrders)
								
								// 记录待结算订单（骑手收入在用户确认收货后才到账）
								const price = Number(item.price) || 0
								const platformFee = price * 0.02
								const serviceFee = price * 0.1
								const riderIncome = price - platformFee - serviceFee
								const pendingSettlementOrders = uni.getStorageSync('rider_pending_settlement') || []
								pendingSettlementOrders.push({
									id: item.id,
									amount: riderIncome,
									status: 'delivered',
									timestamp: Date.now()
								})
								uni.setStorageSync('rider_pending_settlement', pendingSettlementOrders)
								this.pendingSettlementCount = pendingSettlementOrders.length
								
								this.loadPendingOrders()
								this.loadCompletedOrders()
								
								try {
									uni.setStorageSync('order_events', Date.now())
								} catch (e) {}
								
								console.log('[骑手] 订单已送达，等待客户确认收货')
							} catch (e) {
								console.warn('[骑手] 本地更新失败:', e.message)
							}
							
							uni.hideLoading()
							uni.showToast({
								title: '已送达，等待客户确认',
								icon: 'success'
							})
							
						} catch (error) {
							uni.hideLoading()
							console.error('[骑手] 完成配送失败:', error)
							uni.showToast({
								title: '操作失败，请重试',
								icon: 'none'
							})
						}
					}
				})
			},
			loadCompletedOrders() {
				try {
					const saved = uni.getStorageSync('rider_completed_orders') || []
					this.completedOrders = saved
				} catch (e) {
					console.warn('[骑手] 加载已完成订单失败:', e.message)
				}
			},
			loadEarnings() {
				try {
					const rider = initService.getRider()
					this.todayEarnings = rider.todayEarnings
					this.todayOrders = rider.todayOrders
					this.totalEarnings = rider.totalEarnings
					this.monthEarnings = rider.monthEarnings
					this.weekEarnings = rider.weekEarnings
					this.weekRank = rider.weekRank
					this.avgRating = rider.rating
					this._settledOrderIds = uni.getStorageSync('rider_settled_orders') || []
					const pendingList = uni.getStorageSync('rider_pending_orders') || []
					this.pendingSettlementCount = pendingList.length
				} catch (e) {
					console.warn('[骑手] 加载收益数据失败:', e.message)
				}
			},
			refreshRiderData() {
				try {
					const rider = initService.getRider()
					// 同步客户端的学校信息
					try {
						const user = uni.getStorageSync('user_profile')
						if (user && user.school && rider.school !== user.school) {
							rider.school = user.school
							uni.setStorageSync('rider_profile', rider)
						}
						if (user && user.nickname && rider.nickname !== user.nickname && user.nickname !== '邻寝帮用户') {
							rider.nickname = user.nickname
							uni.setStorageSync('rider_profile', rider)
						}
					} catch (e) {}
					this.riderProfile = rider
					this.isOnline = rider.isOnline
					this.todayEarnings = rider.todayEarnings
					this.todayOrders = rider.todayOrders
					this.totalEarnings = rider.totalEarnings
					this.weekEarnings = rider.weekEarnings
					this.monthEarnings = rider.monthEarnings
					this.weekRank = rider.weekRank
					this.avgRating = rider.rating
				} catch (e) {
					console.warn('[骑手] 刷新数据失败:', e.message)
				}
			},
			goClient() {
				uni.showModal({
					title: '切换到客户端',
					content: '确定要切换到用户端吗？',
					confirmText: '切换',
					success: (res) => {
						if (res.confirm) {
							try {
								uni.setStorageSync('current_role', 'user')
								uni.setStorageSync('role_switched_at', Date.now())
							} catch (e) {}
							uni.switchTab({
								url: '/pages/index/index',
								success: () => {
									uni.showToast({ title: '已切换到客户端', icon: 'success' })
								},
								fail: () => {
									uni.reLaunch({
										url: '/pages/index/index'
									})
								}
							})
						}
					}
				})
			},
			goProfile() {
				uni.navigateTo({
					url: '/pages/profile/index'
				})
			},
			goWallet() {
				uni.navigateTo({
					url: '/pages/wallet/index'
				})
			},
			goNotifications() {
				uni.showToast({
					title: '暂无新消息',
					icon: 'none'
				})
			},
			goEarningsDetail() {
				uni.navigateTo({
					url: '/pages/wallet/index'
				})
			},
			goPublish() {
				uni.navigateTo({
					url: '/pages/publish/index'
				})
			},
			async loadGrabOrders() {
				try {
					console.log('[骑手] 正在加载抢单大厅数据...')
					const result = await orderService.getPendingOrders({})
					console.log('[骑手] 抢单大厅数据加载结果:', result)
					if (result.errCode === 0 && result.data) {
						this.grabOrders = result.data.map(order => ({
							id: order._id || order.id,
							type: this.getCategoryLabel(order.category),
							typeClass: this.getTypeClass(order.category),
							fee: order.price || order.serviceFee || 5,
							from: order.pickupAddress || '取货点',
							to: order.deliveryAddress || '送货地址',
							distance: '待计算',
							eta: '约10分钟',
							urgent: order.urgency === 'urgent',
							images: order.images || [],
							title: order.title || '',
							description: order.description || ''
						}))
						this.availableOrders = this.grabOrders.length
						console.log('[骑手] 抢单大厅已更新，共', this.availableOrders, '条订单')
					}
				} catch (error) {
					console.error('加载抢单大厅数据失败:', error)
				}
			},
			getCategoryLabel(category) {
				const map = { delivery: '快递', food: '餐饮', print: '打印', errand: '跑腿', other: '其他' }
				return map[category] || '其他'
			},
			getTypeClass(category) {
				const map = { delivery: 'blue', food: 'green', print: 'amber', errand: 'purple', other: 'gray' }
				return map[category] || 'gray'
			},
			savePendingOrders() {
				try {
					uni.setStorageSync('rider_pending_orders', this.pendingOrders)
					console.log('[骑手] 已保存待配送订单到本地，共', this.pendingOrders.length, '条')
				} catch (e) {
					console.warn('[骑手] 保存订单失败:', e.message)
				}
			},
			loadPendingOrders() {
				try {
					const saved = uni.getStorageSync('rider_pending_orders')
					if (saved && saved.length > 0) {
						this.pendingOrders = saved
						console.log('[骑手] 加载本地待配送订单，共', this.pendingOrders.length, '条')
					}
					
					const orderEvents = uni.getStorageSync('order_events')
					if (orderEvents) {
						this.refreshOrderStatuses()
					}
				} catch (e) {
					console.warn('[骑手] 加载订单失败:', e.message)
				}
			},
			refreshOrderStatuses() {
				try {
					const statusRecords = uni.getStorageSync('order_status') || {}
					let changed = false
					
					this.pendingOrders.forEach(order => {
						const storedStatus = statusRecords[order.id]
						if (storedStatus && storedStatus.status !== order.status) {
							order.status = storedStatus.status
							
							switch (storedStatus.status) {
								case 'picking':
									order.statusText = '配送中'
									order.statusClass = 'delivering'
									order.actionText = '去送达'
									break
								case 'delivering':
									order.statusText = '配送中'
									order.statusClass = 'delivering'
									order.actionText = '去送达'
									break
								case 'completed':
									order.statusText = '已完成'
									order.statusClass = 'completed'
									order.actionText = '查看详情'
									break
								case 'cancelled':
									order.statusText = '已取消'
									order.statusClass = 'cancelled'
									order.actionText = '删除'
									break
								default:
									order.statusText = '待取货'
									order.statusClass = 'pending'
									order.actionText = '去取货'
							}
							changed = true
						}
					})
					
					if (changed) {
						this.savePendingOrders()
						console.log('[骑手] 订单状态已更新')
					}
				} catch (e) {
					console.warn('[骑手] 刷新订单状态失败:', e.message)
				}
			},
			updateOrderStatus(orderId, newStatus) {
				const order = this.pendingOrders.find(o => o.id === orderId)
				if (order) {
					order.status = newStatus
					switch (newStatus) {
						case 'picking':
							order.statusText = '配送中'
							order.statusClass = 'delivering'
							order.actionText = '去送达'
							break
						case 'delivering':
							order.statusText = '配送中'
							order.statusClass = 'delivering'
							order.actionText = '去送达'
							break
						case 'completed':
							order.statusText = '已完成'
							order.statusClass = 'completed'
							order.actionText = '查看详情'
							break
						default:
							order.statusText = '待取货'
							order.statusClass = 'pending'
							order.actionText = '去取货'
					}
					this.savePendingOrders()
				}
			}
		},
		onShow() {
			console.log('[骑手] 页面显示，开始加载订单...')
			this.refreshRiderData()
			this.loadGrabOrders()
			this.loadPendingOrders()
			this.loadCompletedOrders()
			this.loadEarnings()
			this._pollTimer = setInterval(() => {
				this.loadGrabOrders()
				this.loadPendingOrders()
				this.loadCompletedOrders()
			}, 3000)
			onOrderChanged(() => {
				console.log('[骑手] 收到订单变更通知')
				this.loadGrabOrders()
				this.loadPendingOrders()
				this.loadCompletedOrders()
				this.refreshRiderData()
			})
		},
		onHide() {
			if (this._pollTimer) {
				clearInterval(this._pollTimer)
				this._pollTimer = null
			}
			offOrderChanged()
		},
		onUnload() {
			if (this._pollTimer) {
				clearInterval(this._pollTimer)
				this._pollTimer = null
			}
			offOrderChanged()
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background-color: #F5F8FA;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: linear-gradient(135deg, #4A90D9 0%, #2C5282 100%);
		padding: 80rpx 28rpx 48rpx;
		position: relative;
		overflow: hidden;
		border-radius: 0 0 48rpx 48rpx;
	}

	.deco-circle {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.deco-circle-1 {
		top: -100rpx;
		right: -60rpx;
		width: 320rpx;
		height: 320rpx;
		background: rgba(255, 255, 255, 0.1);
	}

	.deco-circle-2 {
		top: 80rpx;
		left: -40rpx;
		width: 200rpx;
		height: 200rpx;
		background: rgba(255, 255, 255, 0.06);
	}

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		z-index: 1;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.avatar-inner {
		width: 44rpx;
		height: 44rpx;
		border: 3rpx solid #fff;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: -24rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 68rpx;
			height: 34rpx;
			border: 3rpx solid #fff;
			border-top: none;
			border-radius: 34rpx 34rpx 0 0;
		}
	}

	.online-dot {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 20rpx;
		height: 20rpx;
		background: #22C55E;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 0 0 4rpx rgba(34, 197, 94, 0.3);
		animation: pulse-dot 2s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0%, 100% { box-shadow: 0 0 0 4rpx rgba(34, 197, 94, 0.3); }
		50% { box-shadow: 0 0 0 10rpx rgba(34, 197, 94, 0); }
	}

	.user-detail {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.user-name {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: 6rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		transition: all 0.3s;

		&.online {
			background: rgba(34, 197, 94, 0.3);
		}
	}

	.status-dot {
		width: 10rpx;
		height: 10rpx;
		background: #EF4444;
		border-radius: 50%;

		.online & {
			background: #22C55E;
		}
	}

	.status-text {
		font-size: 20rpx;
		color: #fff;
		font-weight: 500;
	}

	.user-id {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.header-actions {
		display: flex;
		gap: 16rpx;
	}

	.action-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		position: relative;

		&:active {
			background: rgba(255, 255, 255, 0.25);
		}

		&:has(.action-label) {
			border-radius: 20rpx;
			width: auto;
			height: auto;
			padding: 8rpx 16rpx;
			gap: 4rpx;
		}
	}

	.action-label {
		font-size: 18rpx;
		color: #fff;
	}

	.icon-wallet {
		width: 36rpx;
		height: 28rpx;
		border: 3rpx solid #fff;
		border-radius: 4rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			right: 2rpx;
			top: 50%;
			transform: translateY(-50%);
			width: 6rpx;
			height: 6rpx;
			background: #fff;
			border-radius: 50%;
		}
	}

	.icon-user {
		width: 32rpx;
		height: 32rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 16rpx;
			height: 16rpx;
			border: 3rpx solid #fff;
			border-radius: 50%;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 24rpx;
			height: 10rpx;
			border: 3rpx solid #fff;
			border-radius: 12rpx 12rpx 0 0;
		}
	}

	.icon-bell {
		width: 32rpx;
		height: 32rpx;
		border: 3rpx solid #fff;
		border-radius: 50%;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 10rpx;
			height: 6rpx;
			background: #fff;
			border-radius: 6rpx 6rpx 0 0;
		}
	}

	.badge-dot {
		position: absolute;
		top: 4rpx;
		right: 4rpx;
		min-width: 28rpx;
		height: 28rpx;
		background: #EF4444;
		border-radius: 14rpx;
		font-size: 18rpx;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2rpx solid #4A90D9;
		padding: 0 6rpx;
	}

	.earnings-card {
		background: rgba(255, 255, 255, 0.15);
		border: 2rpx solid rgba(255, 255, 255, 0.2);
		border-radius: 28rpx;
		padding: 32rpx;
		display: flex;
		backdrop-filter: blur(10px);
		margin-top: 32rpx;
		position: relative;
		z-index: 1;
	}

	.earnings-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.earnings-value {
		font-size: 40rpx;
		font-weight: 700;
		color: #fff;
	}

	.earnings-label {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.earnings-divider {
		width: 2rpx;
		background: rgba(255, 255, 255, 0.2);
	}

	.pending-settlement-bar {
		display: flex;
		align-items: center;
		gap: 16rpx;
		background: rgba(255, 193, 7, 0.2);
		padding: 20rpx 28rpx;
		border-radius: 0 0 24rpx 24rpx;
	}

	.pending-settlement-icon {
		font-size: 32rpx;
	}

	.pending-settlement-text {
		font-size: 24rpx;
		color: #fff;
		flex: 1;
	}

	.content {
		flex: 1;
		padding: 28rpx;
		margin-top: -24rpx;
		position: relative;
		z-index: 2;
	}

	.quick-actions {
		margin-bottom: 32rpx;
	}

	.quick-card {
		background: #fff;
		border-radius: 28rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		gap: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.98);
		}

		&.highlight {
			background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
			border: 2rpx solid #BFDBFE;
		}
	}

	.quick-icon-wrap {
		width: 96rpx;
		height: 96rpx;
		background: #4A90D9;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
	}

	.icon-grab {
		width: 48rpx;
		height: 48rpx;
		background: #fff;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.pulse-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 96rpx;
		height: 96rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 24rpx;
		opacity: 0;
		animation: ring-pulse 2s ease-out infinite;

		&.delay {
			animation-delay: 0.5s;
		}
	}

	@keyframes ring-pulse {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.8;
		}
		100% {
			transform: translate(-50%, -50%) scale(1.5);
			opacity: 0;
		}
	}

	.quick-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.quick-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.quick-desc {
		font-size: 24rpx;
		color: #6B7280;
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.order-count {
		font-size: 28rpx;
		font-weight: 700;
		color: #EF4444;
	}

	.order-unit {
		font-size: 24rpx;
		color: #6B7280;
	}

	.quick-arrow {
		width: 20rpx;
		height: 20rpx;
		border-right: 4rpx solid #9CA3AF;
		border-top: 4rpx solid #9CA3AF;
		transform: rotate(45deg);
		flex-shrink: 0;
	}

	.tab-section {
		margin-bottom: 32rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.tab-btns {
		display: flex;
		background: #fff;
		border-radius: 32rpx;
		padding: 6rpx;
		gap: 6rpx;
	}

	.tab-btn {
		padding: 14rpx 24rpx;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		transition: all 0.3s;

		&.active {
			background: #4A90D9;

			.tab-btn-text {
				color: #fff;
			}
		}
	}

	.tab-btn-text {
		font-size: 24rpx;
		color: #6B7280;
		font-weight: 500;
	}

	.tab-badge {
		min-width: 28rpx;
		height: 28rpx;
		background: #EF4444;
		border-radius: 14rpx;
		font-size: 20rpx;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 6rpx;
	}

	.order-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.order-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		display: flex;
		gap: 20rpx;
		position: relative;
		overflow: hidden;

		&.completed {
			opacity: 0.7;
		}
	}

	.order-status-tag {
		position: absolute;
		top: 0;
		right: 0;
		padding: 8rpx 20rpx;
		border-radius: 0 24rpx 0 20rpx;

		&.pending {
			background: #FEF3C7;
			.status-tag-text { color: #D97706; }
		}
		&.delivering {
			background: #DBEAFE;
			.status-tag-text { color: #4A90D9; }
		}
		&.urgent {
			background: #FEE2E2;
			.status-tag-text { color: #EF4444; }
		}
	}

	.status-tag-text {
		font-size: 20rpx;
		font-weight: 600;
	}

	.order-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.order-type-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.order-type {
		padding: 6rpx 16rpx;
		border-radius: 8rpx;

		&.blue { background: #EFF6FF; }
		&.green { background: #F0FDF4; }
		&.amber { background: #FFFBEB; }
		&.purple { background: #FAF5FF; }
	}

	.type-text {
		font-size: 22rpx;
		font-weight: 600;
		color: #4A90D9;

		.green & { color: #22C55E; }
		.amber & { color: #D97706; }
		.purple & { color: #8B5CF6; }
	}

	.order-fee {
		font-size: 32rpx;
		font-weight: 700;
		color: #EF4444;
		margin-left: auto;
	}

	.pending-tag {
		background: linear-gradient(135deg, #FF9800, #F57C00);
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		margin-left: 12rpx;
	}

	.pending-tag-text {
		font-size: 20rpx;
		color: #fff;
		font-weight: 500;
	}

	.completed-badge.pending {
		background: linear-gradient(135deg, #FF9800, #F57C00);
	}

	.order-route {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		padding: 12rpx 0;
	}

	.route-point {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.point-dot {
		width: 16rpx;
		height: 16rpx;
		background: #4A90D9;
		border-radius: 50%;
		flex-shrink: 0;

		&.destination {
			background: #EF4444;
		}
	}

	.point-text {
		font-size: 26rpx;
		color: #374151;
	}

	.route-line {
		width: 4rpx;
		height: 24rpx;
		background: #E5E7EB;
		margin-left: 6rpx;
	}

	.route-summary {
		font-size: 26rpx;
		color: #374151;
	}

	.order-meta {
		display: flex;
		gap: 24rpx;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 8rpx;

		&.rating {
			margin-left: auto;
		}
	}

	.icon-clock {
		width: 24rpx;
		height: 24rpx;
		border: 3rpx solid #9CA3AF;
		border-radius: 50%;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -80%);
			width: 3rpx;
			height: 8rpx;
			background: #9CA3AF;
		}
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-30%, -50%) rotate(45deg);
			width: 3rpx;
			height: 6rpx;
			background: #9CA3AF;
		}
	}

	.icon-distance {
		width: 20rpx;
		height: 24rpx;
		background: #9CA3AF;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-star {
		width: 24rpx;
		height: 24rpx;
		background: #F59E0B;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
	}

	.meta-text {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.order-action {
		display: flex;
		align-items: center;
	}

	.action-btn-primary {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		padding: 16rpx 28rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(74, 144, 217, 0.25);
		transition: all 0.2s;

		&:active {
			transform: scale(0.95);
		}
	}

	.btn-text {
		font-size: 24rpx;
		font-weight: 700;
		color: #fff;
	}

	.completed-badge {
		width: 48rpx;
		height: 48rpx;
		background: #22C55E;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon-check {
		width: 24rpx;
		height: 12rpx;
		border-left: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -6rpx;
	}

	.earnings-section {
		margin-bottom: 32rpx;
	}

	.view-all {
		display: flex;
		align-items: center;
		gap: 8rpx;

		&:active {
			opacity: 0.7;
		}
	}

	.view-all-text {
		font-size: 24rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.icon-arrow-right {
		width: 14rpx;
		height: 14rpx;
		border-right: 3rpx solid #4A90D9;
		border-top: 3rpx solid #4A90D9;
		transform: rotate(45deg);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		margin-bottom: 24rpx;
	}

	.stat-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.stat-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.blue { background: #EFF6FF; }
		&.green { background: #F0FDF4; }
		&.amber { background: #FFFBEB; }
		&.purple { background: #FAF5FF; }
	}

	.icon-week, .icon-month, .icon-rank, .icon-rating {
		width: 32rpx;
		height: 32rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 6rpx;

		.green & { border-color: #22C55E; }
		.amber & { border-color: #F59E0B; }
		.purple & { border-color: #8B5CF6; }
	}

	.icon-week {
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 3rpx;
			background: #4A90D9;
		}
	}

	.icon-month {
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -8rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 12rpx;
			height: 6rpx;
			background: #22C55E;
			border-radius: 3rpx;
		}
	}

	.icon-rank {
		position: relative;
		height: 28rpx;

		&::after {
			content: '';
			position: absolute;
			bottom: -8rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 16rpx;
			height: 4rpx;
			background: #F59E0B;
			border-radius: 2rpx;
		}
	}

	.icon-rating {
		position: relative;
		border: none;
		background: #8B5CF6;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
	}

	.stat-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.stat-label {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.quick-deliver-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
		}
	}

	.deliver-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.icon-rocket {
		width: 40rpx;
		height: 48rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 24rpx;
			height: 36rpx;
			background: #4A90D9;
			border-radius: 12rpx 12rpx 4rpx 4rpx;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 0;
			height: 0;
			border-left: 12rpx solid transparent;
			border-right: 12rpx solid transparent;
			border-top: 14rpx solid #4A90D9;
		}
	}

	.deliver-info {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.deliver-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.deliver-desc {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.deliver-btn {
		background: #EFF6FF;
		padding: 14rpx 28rpx;
		border-radius: 20rpx;
	}

	.deliver-btn-text {
		font-size: 24rpx;
		font-weight: 700;
		color: #4A90D9;
	}

	.grab-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: flex-end;
	}

	.grab-modal-content {
		width: 100%;
		max-height: 80vh;
		background: #fff;
		border-radius: 40rpx 40rpx 0 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.grab-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.grab-modal-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.grab-modal-close {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #F3F4F6;
		border-radius: 50%;
	}

	.close-icon {
		font-size: 36rpx;
		color: #6B7280;
		line-height: 1;
	}

	.grab-list {
		flex: 1;
		overflow-y: auto;
		padding: 24rpx;
	}

	.grab-item {
		background: #F9FAFB;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		border: 2rpx solid #F3F4F6;
	}

	.grab-item-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.grab-type {
		padding: 6rpx 16rpx;
		border-radius: 8rpx;

		&.blue { background: #EFF6FF; }
		&.green { background: #F0FDF4; }
		&.amber { background: #FFFBEB; }
		&.purple { background: #FAF5FF; }
	}

	.grab-type-text {
		font-size: 22rpx;
		font-weight: 600;
		color: #4A90D9;

		.green & { color: #22C55E; }
		.amber & { color: #D97706; }
		.purple & { color: #8B5CF6; }
	}

	.grab-fee {
		font-size: 36rpx;
		font-weight: 700;
		color: #EF4444;
		margin-left: auto;
	}

	.grab-urgent {
		background: #FEE2E2;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}

	.urgent-text {
		font-size: 20rpx;
		font-weight: 600;
		color: #EF4444;
	}

	.grab-route {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.grab-from, .grab-to {
		font-size: 26rpx;
		color: #374151;
		flex: 1;
	}

	.grab-arrow {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.grab-images {
		display: flex;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.grab-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		background: #F3F4F6;
	}

	.grab-more {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.grab-more-text {
		color: #FFFFFF;
		font-size: 28rpx;
		font-weight: 600;
	}

	.grab-meta {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.grab-meta-item {
		font-size: 22rpx;
		color: #6B7280;
	}

	.grab-actions {
		display: flex;
		justify-content: flex-end;
	}

	.grab-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		padding: 16rpx 40rpx;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(74, 144, 217, 0.3);
	}

	.grab-btn-text {
		font-size: 26rpx;
		font-weight: 700;
		color: #fff;
	}

	.grab-empty {
		display: flex;
		justify-content: center;
		padding: 60rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #9CA3AF;
	}
</style>
