<template>
	<view class="page-container">
		<view class="header">
			<view class="deco-circle deco-circle-1"></view>
			<view class="deco-circle deco-circle-2"></view>

			<view class="header-top">
				<view class="placeholder"></view>
				<text class="header-title">邻寝帮</text>
				<view class="search-btn" @click="toggleSearch">
					<view class="icon-search-white"></view>
				</view>
			</view>

			<text class="header-slogan">取快递、带三餐，邻寝帮随叫随到</text>
		</view>

		<view class="search-bar" v-if="showSearch">
			<view class="search-input-wrap">
				<view class="icon-search-gray"></view>
				<input class="search-input" placeholder="搜索跑腿服务..." placeholder-class="search-placeholder" />
			</view>
		</view>

		<view class="role-switch-bar">
			<view class="role-tab" :class="{ active: viewMode === 'orders' }" @click="viewMode = 'orders'">
				<text class="role-tab-text">待接订单 ({{ pendingOrders.length }})</text>
			</view>
			<view class="role-tab" :class="{ active: viewMode === 'providers' }" @click="viewMode = 'providers'">
				<text class="role-tab-text">服务列表</text>
			</view>
		</view>

		<view class="filter-tabs" v-if="viewMode === 'orders'">
			<scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
				<view
					class="tab-item"
					:class="{ active: currentTab === index }"
					v-for="(tab, index) in orderTabs"
					:key="index"
					@click="selectTab(index)"
				>
					<text class="tab-text">{{ tab }}</text>
				</view>
			</scroll-view>
		</view>

		<view class="filter-tabs" v-else>
			<scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
				<view
					class="tab-item"
					:class="{ active: currentTab === index }"
					v-for="(tab, index) in tabs"
					:key="index"
					@click="selectTab(index)"
				>
					<text class="tab-text">{{ tab }}</text>
				</view>
			</scroll-view>
		</view>

		<scroll-view scroll-y class="service-list" :show-scrollbar="false" @scrolltolower="loadMore">
			<view class="order-card" v-if="viewMode === 'orders'" v-for="(item, index) in filteredPendingOrders" :key="'order-' + index">
				<view class="card-top">
					<view class="order-type-tag" :style="{ background: getCategoryColor(item.category) }">
						<text class="type-text">{{ getCategoryLabel(item.category) }}</text>
					</view>
					<view class="urgent-tag" v-if="item.urgency === 'urgent'">
						<text class="urgent-text">加急</text>
					</view>
					<view class="order-price">
						<text class="price-symbol">¥</text>
						<text class="price-value">{{ (item.price || 0).toFixed(2) }}</text>
					</view>
				</view>
				<view class="order-route">
					<view class="route-point pickup">
						<view class="point-dot"></view>
						<text class="point-label">取</text>
					</view>
					<text class="route-address">{{ item.pickupAddress || '取货点' }}</text>
				</view>
				<view class="order-route">
					<view class="route-point deliver">
						<view class="point-dot"></view>
						<text class="point-label">送</text>
					</view>
					<text class="route-address">{{ item.deliveryAddress || '目的地' }}</text>
				</view>
				<view class="order-meta">
					<text class="meta-text">📏 距离约 {{ calcDistance(item) }}</text>
					<text class="meta-text">⏱ 预计 {{ calcEta(item) }}</text>
					<text class="meta-text">📦 {{ item.images && item.images.length > 0 ? item.images.length + '张凭证' : '无凭证' }}</text>
				</view>
				<view class="order-title" v-if="item.title">
					<text class="title-text">{{ item.title }}</text>
				</view>
				<view class="order-actions">
					<view class="action-btn secondary" @click="viewOrderDetail(item)">
						<text class="btn-text">查看详情</text>
					</view>
					<view class="action-btn primary" @click="grabOrder(item)">
						<text class="btn-text">立即接单</text>
					</view>
				</view>
			</view>

			<view class="empty-tip" v-if="viewMode === 'orders' && filteredPendingOrders.length === 0">
				<text class="empty-icon">📋</text>
				<text class="empty-text">暂无待接订单</text>
				<text class="empty-hint">发布订单并支付后会在这里显示</text>
			</view>

			<view class="service-card" v-if="viewMode === 'providers'" v-for="(item, index) in filteredList" :key="'prov-' + index">
				<view class="card-header">
					<view class="user-info">
						<view class="avatar" :style="{ background: item.avatarBg }">
							<text class="avatar-text" :style="{ color: item.avatarColor }">{{ item.avatar }}</text>
						</view>
						<view class="user-detail">
							<view class="user-name-row">
								<text class="user-name">{{ item.name }}</text>
								<view class="rating">
									<text class="star">★</text>
									<text class="score">{{ item.rating }}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="price">
						<text class="price-symbol">¥</text>
						<text class="price-value">{{ item.price }}</text>
					</view>
				</view>

				<text class="service-title">{{ item.title }}</text>
				<text class="service-desc">{{ item.desc }}</text>

				<view class="tags">
					<view class="tag" :style="{ background: item.tagBg, color: item.tagColor }">
						<text class="tag-text">{{ item.tag }}</text>
					</view>
				</view>

				<view class="card-footer">
					<view class="meta-info">
						<text class="meta-item">📍 {{ item.location }}</text>
						<text class="meta-item">⏱ {{ item.time }}</text>
						<text class="meta-item">📦 已接{{ item.orders }}单</text>
					</view>
					<view class="order-btn" @click="openModal(item)">
						<text class="order-btn-text">立即下单</text>
					</view>
				</view>
			</view>

			<view class="list-bottom-space"></view>
		</scroll-view>

		<view class="modal-overlay" v-if="showModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<text class="modal-title">确认下单</text>

				<view class="modal-info">
					<view class="info-row">
						<text class="info-label">服务内容</text>
						<text class="info-value">{{ selectedItem ? selectedItem.title : '' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">基础费用</text>
						<text class="info-price">¥{{ selectedItem ? selectedItem.price : 0 }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">优惠券</text>
						<text class="info-link">选择优惠券 ></text>
					</view>
				</view>

				<view class="remark-area">
					<text class="remark-label">下单备注 (选填)</text>
					<textarea class="remark-input" placeholder="有什么特殊要求可以写在这里..." />
				</view>

				<view class="total-row">
					<view class="total-info">
						<text class="total-label">合计费用</text>
						<text class="total-hint">含平台服务费 (12%)</text>
					</view>
					<text class="total-price">¥{{ totalPrice }}</text>
				</view>

				<view class="modal-actions">
					<view class="btn-cancel" @click="closeModal">
						<text class="btn-cancel-text">取消</text>
					</view>
					<view class="btn-confirm" @click="confirmOrder">
						<text class="btn-confirm-text">确认下单</text>
					</view>
				</view>
			</view>
		</view>

		<AppTabBar :current="1" />
	</view>
</template>

<script>
	import AppTabBar from '@/components/order/index.vue'
	import { orderService } from '@/services/order.js'
	import { providersService } from '@/services/providers.js'

	export default {
		components: {
			AppTabBar
		},
		data() {
			return {
				showSearch: false,
				currentTab: 0,
				showModal: false,
				selectedItem: null,
				viewMode: 'orders',
				tabs: ['全部', '校园跑', '学习助手', '代买代购', '快递代取', '代办事务', '即时速递'],
				orderTabs: ['全部', '快递代取', '食堂代买', '代办事务', '即时速递'],
				serviceList: [],
				pendingOrders: [],
				loading: false
			}
		},
		async onLoad() {
			await this.loadProviders()
			await this.loadPendingOrders()
		},
		async onShow() {
			await this.loadPendingOrders()
			if (this.serviceList.length === 0) {
				await this.loadProviders()
			}
			try {
				const eventList = uni.getStorageSync('order_events')
				if (eventList) {
					this.loadPendingOrders()
				}
			} catch (e) {}
		},
		methods: {
			async loadProviders() {
				this.loading = true
				try {
					await providersService.initialize()
					const result = await providersService.list({})
					if (result.errCode === 0) {
						this.serviceList = result.data.list
					}
				} catch (e) {
					console.error('加载服务列表失败:', e)
				} finally {
					this.loading = false
				}
			},
			async loadPendingOrders() {
				try {
					const result = await orderService.getPendingOrders({})
					if (result.errCode === 0 && result.data) {
						this.pendingOrders = result.data
						console.log('[服务单] 加载待接订单:', this.pendingOrders.length, '条')
					}
				} catch (e) {
					console.warn('[服务单] 加载待接订单失败:', e.message)
					try {
						const orders = uni.getStorageSync('orders_data') || []
						this.pendingOrders = orders.filter(o => o.status === 'pending')
					} catch (e2) {}
				}
			},
			getCategoryLabel(category) {
				const map = { delivery: '快递代取', food: '食堂代买', print: '代办事务', errand: '即时速递', task: '代办事务', other: '其他' }
				return map[category] || '其他'
			},
			getCategoryColor(category) {
				const map = { delivery: '#3B82F6', food: '#10B981', print: '#8B5CF6', errand: '#F59E0B', task: '#EC4899', other: '#6B7280' }
				return map[category] || '#6B7280'
			},
			calcDistance(item) {
				if (item.pickupLocation && item.deliveryLocation) {
					return '0.8km'
				}
				const price = Number(item.price) || 0
				if (price >= 20) return '3km+'
				if (price >= 10) return '1.5km'
				return '0.8km'
			},
			calcEta(item) {
				const price = Number(item.price) || 0
				if (price >= 20) return '30分钟'
				if (price >= 10) return '20分钟'
				return '10分钟'
			},
			viewOrderDetail(order) {
				uni.navigateTo({
					url: '/pages/order-detail/index?id=' + order._id
				})
			},
			async grabOrder(order) {
				uni.showModal({
					title: '确认接单',
					content: `您确定要接这单吗？\n${order.pickupAddress || ''} → ${order.deliveryAddress || ''}\n配送费 ¥${(order.price || 0).toFixed(2)}`,
					confirmText: '接单',
					success: async (res) => {
						if (!res.confirm) return
						
						uni.showLoading({ title: '接单中...' })
						
						try {
							const riderProfile = uni.getStorageSync('rider_profile') || {}
							const result = await orderService.acceptOrder(order._id, {
								rider_id: riderProfile.id || 'rider_' + Date.now(),
								rider_name: riderProfile.nickname || '骑手'
							})
							
							if (result.errCode === 0) {
								// 同步更新本地存储
								try {
									const orders = uni.getStorageSync('orders_data') || []
									const idx = orders.findIndex(o => String(o._id) === String(order._id))
									if (idx !== -1) {
										orders[idx].status = 'accepted'
										orders[idx].rider_id = riderProfile.id || ''
										orders[idx].rider_name = riderProfile.nickname || '骑手'
										uni.setStorageSync('orders_data', orders)
									}
								} catch (e) {}
								
								// 添加到骑手的待配送订单
								try {
									const riderOrders = uni.getStorageSync('rider_pending_orders') || []
									riderOrders.unshift({
										id: order._id,
										type: order.category,
										typeClass: this.getTypeClass(order.category),
										fee: order.price,
										from: order.pickupAddress,
										to: order.deliveryAddress,
										distance: '待计算',
										eta: '约10分钟',
										urgent: order.urgency === 'urgent',
										images: order.images || [],
										title: order.title || '',
										description: order.description || '',
										status: 'accepted',
										statusText: '已接单',
										statusClass: 'accepted',
										actionText: '开始配送'
									})
									uni.setStorageSync('rider_pending_orders', riderOrders)
								} catch (e) {}
								
								uni.hideLoading()
								
								// 从待接订单列表中移除
								this.pendingOrders = this.pendingOrders.filter(o => String(o._id) !== String(order._id))
								
								uni.showToast({ title: '接单成功', icon: 'success' })
								
								setTimeout(() => {
									uni.switchTab({ url: '/pages/rider-home/index' })
								}, 1000)
							} else {
								uni.hideLoading()
								uni.showToast({ title: result.errMsg || '接单失败', icon: 'none' })
							}
						} catch (e) {
							uni.hideLoading()
							console.error('接单失败:', e)
							uni.showToast({ title: '接单失败，请重试', icon: 'none' })
						}
					}
				})
			},
			getTypeClass(category) {
				const map = { delivery: 'blue', food: 'green', print: 'amber', errand: 'purple', task: 'amber', other: 'gray' }
				return map[category] || 'gray'
			},
			loadMore() {
				this.loadPendingOrders()
			}
		},
		computed: {
			filteredList() {
				if (this.currentTab === 0) {
					return this.serviceList
				}
				const tabName = this.tabs[this.currentTab]
				return this.serviceList.filter(item => item.category === tabName)
			},
			filteredPendingOrders() {
				if (this.currentTab === 0) {
					return this.pendingOrders
				}
				const tabName = this.orderTabs[this.currentTab]
				const categoryMap = { '快递代取': 'delivery', '食堂代买': 'food', '代办事务': 'print', '即时速递': 'errand' }
				const cat = categoryMap[tabName]
				if (!cat) return this.pendingOrders
				return this.pendingOrders.filter(o => o.category === cat)
			},
			totalPrice() {
				if (!this.selectedItem) return '0.00'
				const base = this.selectedItem.price
				const fee = (base * 0.12).toFixed(2)
				return (base + parseFloat(fee)).toFixed(2)
			}
		},
		methods: {
			toggleSearch() {
				this.showSearch = !this.showSearch
			},
			selectTab(index) {
				this.currentTab = index
			},
			openModal(item) {
				this.selectedItem = item
				this.showModal = true
			},
			closeModal() {
				this.showModal = false
			},
			async confirmOrder() {
				if (!this.selectedItem) return
				
				this.closeModal()
				uni.showLoading({ title: '创建订单中...' })
				
				try {
					const categoryMap = {
						'校园跑': 'errand',
						'学习助手': 'print',
						'代买代购': 'food',
						'快递代取': 'delivery',
						'代办事务': 'task',
						'即时速递': 'errand',
						'其他': 'other'
					}
					
					const result = await orderService.add({
						category: categoryMap[this.selectedItem.category] || 'other',
						itemType: 'daily',
						itemWeight: 'light',
						title: this.selectedItem.title,
						description: this.selectedItem.desc,
						pickupAddress: this.selectedItem.location || '取货点',
						deliveryAddress: '当前位置',
						pickupLocation: null,
						deliveryLocation: null,
						pickupTimeRange: null,
						price: this.selectedItem.price,
						urgency: 'normal',
						deliveryTime: '',
						images: [],
						remark: '',
						contactPhone: '',
						userName: ''
					})
					
					uni.hideLoading()
					
					if (result.errCode === 0) {
						const orderId = result.data ? result.data.id : ''
						
						if (orderId) {
							uni.navigateTo({
								url: '/pages/pay/index?orderId=' + orderId
							})
						} else {
							uni.showToast({ title: '下单成功！', icon: 'success' })
							setTimeout(() => {
								uni.navigateTo({
									url: '/pages/orders/index'
								})
							}, 1500)
						}
					} else {
						uni.showToast({ 
							title: result.errMsg || '下单失败', 
							icon: 'none' 
						})
					}
				} catch (error) {
					uni.hideLoading()
					console.error('下单失败:', error)
					uni.showToast({ title: '下单成功（离线）', icon: 'none' })
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/orders/index'
						})
					}, 1500)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background-color: #F5F8FA;
		display: flex;
		flex-direction: column;
		padding-bottom: 140rpx;
	}

	.header {
		background: #4A90D9;
		padding: 100rpx 32rpx 40rpx;
		position: relative;
		overflow: hidden;
	}

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		position: relative;
		z-index: 1;
	}

	.placeholder {
		width: 64rpx;
	}

	.header-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #fff;
	}

	.search-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-search-white {
		width: 36rpx;
		height: 36rpx;
		border: 3rpx solid #fff;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			right: -8rpx;
			bottom: -6rpx;
			width: 14rpx;
			height: 3rpx;
			background: #fff;
			transform: rotate(45deg);
			border-radius: 2rpx;
		}
	}

	.header-slogan {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
		text-align: center;
		position: relative;
		z-index: 1;
		display: block;
	}

	.deco-circle {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.deco-circle-1 {
		top: -60rpx;
		right: -40rpx;
		width: 240rpx;
		height: 240rpx;
		background: rgba(255, 255, 255, 0.08);
	}

	.deco-circle-2 {
		bottom: -80rpx;
		left: -40rpx;
		width: 200rpx;
		height: 200rpx;
		background: rgba(255, 255, 255, 0.05);
	}

	.search-bar {
		background: #fff;
		padding: 24rpx 28rpx;
	}

	.search-input-wrap {
		background: #F3F4F6;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.icon-search-gray {
		width: 28rpx;
		height: 28rpx;
		border: 3rpx solid #9CA3AF;
		border-radius: 50%;
		position: relative;
		flex-shrink: 0;

		&::after {
			content: '';
			position: absolute;
			right: -5rpx;
			bottom: -3rpx;
			width: 10rpx;
			height: 3rpx;
			background: #9CA3AF;
			transform: rotate(45deg);
			border-radius: 2rpx;
		}
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}

	.search-placeholder {
		color: #9CA3AF;
	}

	.filter-tabs {
		background: #fff;
		padding: 20rpx 0;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.tabs-scroll {
		white-space: nowrap;
		padding: 0 24rpx;
	}

	.tab-item {
		display: inline-block;
		padding: 16rpx 32rpx;
		background: #F3F4F6;
		border-radius: 40rpx;
		margin-right: 16rpx;
		transition: all 0.2s;

		&.active {
			background: #EFF6FF;

			.tab-text {
				color: #4A90D9;
				font-weight: 500;
			}
		}
	}

	.tab-text {
		font-size: 26rpx;
		color: #6B7280;
	}

	.service-list {
		flex: 1;
		padding: 24rpx 28rpx;
	}

	.service-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 24rpx;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.avatar-text {
		font-size: 26rpx;
		font-weight: 700;
	}

	.user-detail {
		display: flex;
		flex-direction: column;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.user-name {
		font-size: 26rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.rating {
		display: flex;
		align-items: center;
		gap: 4rpx;
	}

	.star {
		font-size: 20rpx;
		color: #F59E0B;
	}

	.score {
		font-size: 20rpx;
		color: #F59E0B;
	}

	.price {
		display: flex;
		align-items: baseline;
		color: #EF4444;
	}

	.price-symbol {
		font-size: 24rpx;
		font-weight: 600;
	}

	.price-value {
		font-size: 36rpx;
		font-weight: 700;
	}

	.service-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
		display: block;
		margin-bottom: 8rpx;
	}

	.service-desc {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin-bottom: 16rpx;
	}

	.tags {
		display: flex;
		margin-bottom: 20rpx;
	}

	.tag {
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
	}

	.tag-text {
		font-size: 20rpx;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding-top: 20rpx;
		border-top: 2rpx solid #F9FAFB;
	}

	.meta-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.meta-item {
		font-size: 20rpx;
		color: #9CA3AF;
	}

	.order-btn {
		background: #4A90D9;
		padding: 16rpx 32rpx;
		border-radius: 40rpx;
	}

	.order-btn-text {
		font-size: 24rpx;
		font-weight: 500;
		color: #fff;
	}

	.list-bottom-space {
		height: 40rpx;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 48rpx;
		z-index: 1000;
	}

	.modal-content {
		background: #fff;
		border-radius: 32rpx;
		width: 100%;
		padding: 48rpx;
	}

	.modal-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
		text-align: center;
		display: block;
		margin-bottom: 32rpx;
	}

	.modal-info {
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 32rpx;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12rpx 0;

		&:last-child {
			border-top: 2rpx solid #F3F4F6;
			margin-top: 8rpx;
			padding-top: 20rpx;
		}
	}

	.info-label {
		font-size: 26rpx;
		color: #6B7280;
	}

	.info-value {
		font-size: 26rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.info-price {
		font-size: 26rpx;
		font-weight: 600;
		color: #EF4444;
	}

	.info-link {
		font-size: 26rpx;
		color: #4A90D9;
	}

	.remark-area {
		margin-bottom: 32rpx;
	}

	.remark-label {
		font-size: 26rpx;
		color: #6B7280;
		display: block;
		margin-bottom: 16rpx;
	}

	.remark-input {
		width: 100%;
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 24rpx;
		font-size: 26rpx;
		min-height: 160rpx;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		border-top: 2rpx solid #F3F4F6;
		margin-bottom: 32rpx;
	}

	.total-info {
		display: flex;
		flex-direction: column;
	}

	.total-label {
		font-size: 28rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.total-hint {
		font-size: 20rpx;
		color: #9CA3AF;
		margin-top: 4rpx;
	}

	.total-price {
		font-size: 44rpx;
		font-weight: 700;
		color: #EF4444;
	}

	.modal-actions {
		display: flex;
		gap: 24rpx;
	}

	.btn-cancel {
		flex: 1;
		padding: 28rpx;
		border: 2rpx solid #E5E7EB;
		border-radius: 24rpx;
		text-align: center;
	}

	.btn-cancel-text {
		font-size: 30rpx;
		color: #6B7280;
		font-weight: 500;
	}

	.btn-confirm {
		flex: 1;
		padding: 28rpx;
		background: #4A90D9;
		border-radius: 24rpx;
		text-align: center;
		box-shadow: 0 8rpx 20rpx rgba(74, 144, 217, 0.25);
	}

	.btn-confirm-text {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}

	.role-switch-bar {
		display: flex;
		gap: 16rpx;
		padding: 20rpx 32rpx;
		background: #fff;
	}

	.role-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		background: #F3F4F6;
		border-radius: 16rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&.active {
			background: linear-gradient(135deg, #4A90D9, #3672B0);
			border-color: #4A90D9;
		}
	}

	.role-tab-text {
		font-size: 26rpx;
		font-weight: 600;
		color: #374151;

		.active & {
			color: #fff;
		}
	}

	.order-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	}

	.card-top {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 20rpx;
	}

	.order-type-tag {
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
	}

	.type-text {
		font-size: 24rpx;
		font-weight: 600;
		color: #fff;
	}

	.urgent-tag {
		background: #FEF2F2;
		padding: 6rpx 12rpx;
		border-radius: 6rpx;
	}

	.urgent-text {
		font-size: 20rpx;
		color: #EF4444;
		font-weight: 600;
	}

	.order-price {
		margin-left: auto;
		display: flex;
		align-items: baseline;
	}

	.order-price .price-symbol {
		font-size: 24rpx;
		font-weight: 600;
		color: #F59E0B;
	}

	.order-price .price-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #F59E0B;
	}

	.order-route {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 12rpx;
	}

	.route-point {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.point-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background: #4A90D9;
	}

	.pickup .point-dot {
		background: #4A90D9;
	}

	.deliver .point-dot {
		background: #10B981;
	}

	.point-label {
		font-size: 22rpx;
		color: #6B7280;
		font-weight: 500;
	}

	.route-address {
		font-size: 26rpx;
		color: #1F2937;
		font-weight: 500;
		flex: 1;
	}

	.order-meta {
		display: flex;
		gap: 20rpx;
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #F3F4F6;
	}

	.meta-text {
		font-size: 22rpx;
		color: #6B7280;
	}

	.order-title {
		margin-top: 12rpx;
	}

	.title-text {
		font-size: 26rpx;
		color: #374151;
		line-height: 1.4;
	}

	.order-actions {
		display: flex;
		gap: 16rpx;
		margin-top: 20rpx;
	}

	.order-actions .action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		border-radius: 16rpx;
		transition: all 0.2s;

		&.secondary {
			background: #F3F4F6;
		}

		&.primary {
			background: linear-gradient(135deg, #4A90D9, #3672B0);
		}

		.btn-text {
			font-size: 28rpx;
			font-weight: 600;

			.secondary & {
				color: #6B7280;
			}

			.primary & {
				color: #fff;
			}
		}
	}

	.action-btn:active {
		transform: scale(0.96);
	}

	.empty-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 40rpx;
	}

	.empty-icon {
		font-size: 80rpx;
		margin-bottom: 16rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #6B7280;
		margin-bottom: 8rpx;
	}

	.empty-hint {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.list-bottom-space {
		height: 40rpx;
	}
</style>