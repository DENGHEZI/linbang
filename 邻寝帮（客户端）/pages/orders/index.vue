<template>
	<view class="page-container">
		<view class="header">
			<text class="header-title">我的订单</text>
		</view>

		<view class="tab-bar">
			<view
				class="tab-item"
				:class="{ active: currentTab === index }"
				v-for="(tab, index) in tabs"
				:key="index"
				@click="selectTab(index)"
			>
				<text class="tab-text">{{ tab }}</text>
			</view>
		</view>

		<scroll-view scroll-y class="order-list" :show-scrollbar="false">
			<view class="order-card" v-for="(order, index) in filteredOrders" :key="index" @click="showDetail(order)">
				<view class="card-header">
					<view class="header-left">
						<text class="order-type">{{ order.type }}</text>
						<text class="order-time">{{ order.time }}</text>
					</view>
					<text class="order-status" :style="{ color: order.statusColor }">{{ order.status }}</text>
				</view>

				<view class="card-body">
					<view class="order-info">
						<text class="order-title">{{ order.title }}</text>
						<view class="rider-info-row" v-if="order.rider && order.rider !== '待接单'">
							<view class="rider-avatar">
								<text class="avatar-text">{{ (order.rider || '骑').charAt(0) }}</text>
							</view>
							<view class="rider-detail">
								<text class="rider-name">{{ order.rider }}</text>
								<text class="rider-phone" v-if="order.riderPhone" @click.stop="callRider(order.riderPhone)">📞 {{ order.riderPhone }}</text>
							</view>
						</view>
						<text class="order-rider" v-else>骑手: {{ order.rider }}</text>
					</view>
					<view class="order-price">
						<text class="price-symbol">¥</text>
						<text class="price-value">{{ order.price }}</text>
					</view>
				</view>

				<view class="delivery-progress" v-if="order.progress && order.progress.length > 0">
					<view class="progress-item" v-for="(step, sIdx) in order.progress" :key="sIdx" :class="{ active: step.active, done: step.done }">
						<view class="progress-dot"></view>
						<text class="progress-text">{{ step.label }}</text>
					</view>
				</view>

				<view class="proofs-notice" v-if="order.hasPickupProofs" @click.stop="showDetail(order)">
					<view class="proofs-icon">📦</view>
					<text class="proofs-text">骑手已上传取货凭证 ({{ order.pickupProofsCount }}张)</text>
					<view class="proofs-view">
						<text class="proofs-view-text">查看照片</text>
					</view>
				</view>

				<view class="proofs-thumbs" v-if="order.hasPickupProofs && detailOrder && order._id === detailOrder._id">
					<image 
						class="proof-thumb" 
						v-for="(proof, pIdx) in (detailOrder && detailOrder.pickup_proofs ? detailOrder.pickup_proofs : [])" 
						:key="pIdx"
						:src="proof.url" 
						mode="aspectFill"
						@click.stop="previewProofImages(detailOrder.pickup_proofs, pIdx)"
					/>
				</view>

				<view class="card-actions">
					<view
						class="action-btn"
						:class="{ primary: getPrimaryStyle(order) === 'primary', secondary: getPrimaryStyle(order) === 'secondary' }"
						@click.stop="showDetail(order)"
					>
						<text class="action-text">详情</text>
					</view>
					<view
						class="action-btn"
						:class="{ primary: true }"
						@click.stop="handleAction(order.primaryAction, order)"
					>
						<text class="action-text">{{ getActionLabel(order) }}</text>
					</view>
				</view>
			</view>

			<view class="empty-tip" v-if="filteredOrders.length === 0">
				<text class="empty-text">暂无订单</text>
			</view>

			<view class="list-bottom-space"></view>
		</scroll-view>

		<view class="modal-overlay" v-if="showDetailModal" @click="closeDetailModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">订单详情</text>
					<view class="close-btn" @click="closeDetailModal">
						<text class="close-text">✕</text>
					</view>
				</view>
				<scroll-view scroll-y class="modal-body">
					<view class="detail-section" v-if="detailOrder">
						<view class="detail-row">
							<text class="detail-label">订单号</text>
							<text class="detail-value">{{ detailOrder.orderNo || detailOrder._id }}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">状态</text>
							<text class="detail-value" :style="{ color: orderStatusColor }">{{ getStatusText(detailOrder.status) }}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">取货地址</text>
							<text class="detail-value">{{ detailOrder.pickupAddress || detailOrder.pickup_address }}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">送货地址</text>
							<text class="detail-value">{{ detailOrder.deliveryAddress || detailOrder.delivery_address }}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">价格</text>
							<text class="detail-value price">¥{{ (detailOrder.price || 0).toFixed(2) }}</text>
						</view>
						<view class="detail-row" v-if="detailOrder.rider_name">
							<text class="detail-label">骑手</text>
							<text class="detail-value">{{ detailOrder.rider_name }}</text>
						</view>
						<view class="detail-row" v-if="detailOrder.rider_phone">
							<text class="detail-label">电话</text>
							<text class="detail-value link" @click="callRider(detailOrder.rider_phone)">{{ detailOrder.rider_phone }}</text>
						</view>

						<view class="proofs-section" v-if="detailOrder.pickup_proofs && detailOrder.pickup_proofs.length > 0">
							<text class="proofs-section-title">取货凭证</text>
							<view class="proofs-grid">
								<image 
									class="proof-image" 
									v-for="(proof, idx) in detailOrder.pickup_proofs" 
									:key="idx"
									:src="proof.url" 
									mode="aspectFill"
									@click="previewProofImages(detailOrder.pickup_proofs, idx)"
								/>
							</view>
						</view>

						<view class="fee-breakdown" v-if="detailOrder.platformFee !== undefined">
							<text class="fee-title">费用明细</text>
							<view class="fee-row">
								<text class="fee-label">订单金额</text>
								<text class="fee-value">¥{{ (detailOrder.price || 0).toFixed(2) }}</text>
							</view>
							<view class="fee-row">
								<text class="fee-label">平台抽成 (2%)</text>
								<text class="fee-value deduct">-¥{{ (detailOrder.platformFee || 0).toFixed(2) }}</text>
							</view>
							<view class="fee-row">
								<text class="fee-label">服务费 (10%)</text>
								<text class="fee-value deduct">-¥{{ (detailOrder.serviceFee || 0).toFixed(2) }}</text>
							</view>
							<view class="fee-row total">
								<text class="fee-label">骑手收入 (88%)</text>
								<text class="fee-value income">¥{{ (detailOrder.riderIncome || 0).toFixed(2) }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<view class="modal-btn cancel" @click="closeDetailModal">
						<text class="btn-text">关闭</text>
					</view>
					<view class="modal-btn primary" v-if="detailOrder && detailOrder.rider_phone" @click="callRider(detailOrder.rider_phone); closeDetailModal()">
						<text class="btn-text">呼叫骑手</text>
					</view>
				</view>
			</view>
		</view>

		<AppTabBar :current="2" />
	</view>
</template>

<script>
	import AppTabBar from '@/components/order/index.vue'
	import { orderService, onOrderChanged, offOrderChanged } from '@/services/order.js'
	
	export default {
		components: {
			AppTabBar
		},
		data() {
			return {
				currentTab: 0,
				tabs: ['全部', '进行中', '已完成', '待评价'],
				orders: [],
				localOrders: [],
				showDetailModal: false,
				detailOrder: null
			}
		},
		computed: {
			mergedOrders() {
				const statusMap = {
					pending_payment: { text: '待支付', color: '#EF4444', progress: [
						{ label: '已下单', done: true },
						{ label: '待支付', active: true },
						{ label: '骑手接单' },
						{ label: '配送中' },
						{ label: '已送达' }
					]},
					pending: { text: '待接单', color: '#F59E0B', progress: [
						{ label: '已下单', done: true },
						{ label: '骑手接单', active: true },
						{ label: '取货中' },
						{ label: '配送中' },
						{ label: '已送达' }
					]},
					accepted: { text: '取货中', color: '#4A90D9', progress: [
						{ label: '已下单', done: true },
						{ label: '骑手接单', done: true },
						{ label: '取货中', active: true },
						{ label: '配送中' },
						{ label: '已送达' }
					]},
					picking: { text: '取货中', color: '#4A90D9', progress: [
						{ label: '已下单', done: true },
						{ label: '骑手接单', done: true },
						{ label: '取货中', active: true },
						{ label: '配送中' },
						{ label: '已送达' }
					]},
					delivering: { text: '配送中', color: '#4A90D9', progress: [
						{ label: '已下单', done: true },
						{ label: '骑手接单', done: true },
						{ label: '取货中', done: true },
						{ label: '配送中', active: true },
						{ label: '已送达' }
					]},
					delivered: { text: '已送达', color: '#10B981', progress: [
						{ label: '已下单', done: true },
						{ label: '骑手接单', done: true },
						{ label: '取货中', done: true },
						{ label: '配送中', done: true },
						{ label: '已送达', done: true }
					]},
					completed: { text: '已完成', color: '#4ECDC4', progress: [
						{ label: '已下单', done: true },
						{ label: '骑手接单', done: true },
						{ label: '取货中', done: true },
						{ label: '配送中', done: true },
						{ label: '已送达', done: true }
					]},
					cancelled: { text: '已取消', color: '#9CA3AF', progress: [] }
				}
				const typeMap = { delivery: '快递代取', food: '食堂代买', print: '打印', errand: '即时速递', other: '代办事务' }
				
				const localMapped = this.localOrders.map(o => {
					const proofsData = this._pickupProofsData?.[o._id] || null
					const pickupProofs = proofsData?.images || o.pickup_proofs || []
					return {
						_id: o._id,
						type: typeMap[o.category] || '其他',
						time: this.formatTime(o.created_at),
						status: statusMap[o.status]?.text || '未知',
						statusColor: statusMap[o.status]?.color || '#9CA3AF',
						progress: statusMap[o.status]?.progress || [],
						title: `${o.pickupAddress || '取货点'} → ${o.deliveryAddress || '送货点'}`,
						rider: o.rider_name || '待接单',
						riderPhone: o.rider_phone || '',
						price: o.price?.toFixed(2) || '0.00',
						primaryAction: o.status === 'completed' ? 'rate' : (o.status === 'delivered' ? 'confirm' : (o.status === 'pending_payment' ? 'pay' : (o.status === 'pending' ? 'track' : 'track'))),
						tab: o.status === 'completed' || o.status === 'cancelled' ? 2 : 1,
						hasPickupProofs: pickupProofs.length > 0,
						pickupProofsCount: pickupProofs.length,
						pickup_proofs: pickupProofs,
						proofsUploadedAt: o.proofs_uploaded_at
					}
				})
				
				return [...localMapped, ...this.orders]
			},
			filteredOrders() {
				if (this.currentTab === 0) return this.mergedOrders
				return this.mergedOrders.filter(o => o.tab === this.currentTab)
			},
			orderStatusColor() {
				if (!this.detailOrder) return '#9CA3AF'
				const colorMap = {
					pending: '#F59E0B',
					accepted: '#4A90D9',
					picking: '#4A90D9',
					delivering: '#4A90D9',
					delivered: '#10B981',
					completed: '#4ECDC4',
					cancelled: '#9CA3AF'
				}
				return colorMap[this.detailOrder.status] || '#9CA3AF'
			}
		},
		methods: {
			getStatusText(status) {
				const map = {
					pending: '待接单',
					accepted: '已接单',
					picking: '取货中',
					delivering: '配送中',
					delivered: '已送达',
					completed: '已完成',
					cancelled: '已取消'
				}
				return map[status] || status || '未知'
			},
			formatTime(timestamp) {
				if (!timestamp) return ''
				const d = new Date(timestamp)
				const pad = n => String(n).padStart(2, '0')
				return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
			},
			async loadLocalOrders() {
				try {
					const userInfo = uni.getStorageSync('userInfo') || {}
					const result = await orderService.list({ type: 'user', uid: userInfo.uid || 'local_user', pageSize: 50 })
					if (result.errCode === 0 && result.data) {
						this.localOrders = result.data.list || []
					}
					
					try {
						const statusRecords = uni.getStorageSync('order_status') || {}
						const changed = []
						
						this.localOrders.forEach((order, index) => {
							const storedStatus = statusRecords[order._id]
							if (storedStatus && storedStatus.status !== order.status) {
								this.localOrders[index].status = storedStatus.status
								if (storedStatus.status === 'completed') {
									this.localOrders[index].completed_at = storedStatus.updatedAt || Date.now()
								} else if (storedStatus.status === 'delivering') {
									this.localOrders[index].delivering_at = storedStatus.updatedAt || Date.now()
								} else if (storedStatus.status === 'picking') {
									this.localOrders[index].picking_at = storedStatus.updatedAt || Date.now()
								}
								changed.push(order._id)
							}
						})
						
						if (changed.length > 0) {
							uni.setStorageSync('local_orders', this.localOrders)
							console.log('[订单] 已同步', changed.length, '个订单的状态:', changed)
						}
					} catch (e) {
						console.warn('[订单] 同步状态失败:', e.message)
					}
				} catch (error) {
					console.error('加载本地订单失败:', error)
				}
			},
			callRider(phone) {
				if (!phone) {
					uni.showToast({ title: '暂无骑手电话', icon: 'none' })
					return
				}
				uni.makePhoneCall({
					phoneNumber: phone,
					fail: () => {
						uni.showToast({ title: '拨打失败', icon: 'none' })
					}
				})
			},
			async showDetail(order) {
				try {
					const result = await orderService.detail(order._id)
					if (result.errCode === 0 && result.data) {
						this.detailOrder = result.data
						this.detailOrder._id = order._id
						
						// 计算费用明细
						const price = Number(this.detailOrder.price || 0)
						this.detailOrder.platformFee = price * 0.02
						this.detailOrder.serviceFee = price * 0.1
						this.detailOrder.riderIncome = price - this.detailOrder.platformFee - this.detailOrder.serviceFee
						
						// 确保有pickup_proofs数据
						if (!this.detailOrder.pickup_proofs || this.detailOrder.pickup_proofs.length === 0) {
							try {
								const proofsData = uni.getStorageSync('pickup_proofs')
								if (proofsData && proofsData[order._id]) {
									this.detailOrder.pickup_proofs = proofsData[order._id].images || []
								}
							} catch (e) {}
						}
						
						this.showDetailModal = true
					}
				} catch (error) {
					uni.showToast({ title: '详情加载失败', icon: 'none' })
				}
			},
			
			closeDetailModal() {
				this.showDetailModal = false
				this.detailOrder = null
			},
			
			previewProofImages(proofs, currentIndex) {
				if (!proofs || proofs.length === 0) return
				const urls = proofs.map(p => p.url)
				uni.previewImage({
					current: urls[currentIndex],
					urls: urls
				})
			},
			
			viewPickupProofs(proofs) {
				if (!proofs || proofs.length === 0) {
					uni.showToast({ title: '暂无凭证', icon: 'none' })
					return
				}
				const urls = proofs.map(p => p.url)
				uni.previewImage({
					current: urls[0],
					urls: urls
				})
			},
			
			async confirmReceipt(order) {
				uni.showModal({
					title: '确认收货',
					content: '请确认已收到骑手配送的物品，确认后将进行评价。',
					confirmText: '确认收货',
					confirmColor: '#4A90D9',
					success: async (res) => {
						if (!res.confirm) return
						
						try {
							uni.showLoading({ title: '正在确认收货...' })
							
							const result = await orderService.confirmReceipt(order._id)
							
							if (result.errCode === 0) {
								this.settleRiderEarnings(order)
								
								try {
									const pendingSettlement = uni.getStorageSync('rider_pending_settlement') || []
									const filtered = pendingSettlement.filter(p => p.id !== order._id)
									uni.setStorageSync('rider_pending_settlement', filtered)
								} catch (e) {}
								
								uni.hideLoading()
								uni.showToast({
									title: '收货成功',
									icon: 'success'
								})
								
								setTimeout(() => {
									uni.navigateTo({
										url: '/pages/rate/index?orderId=' + order._id
									})
								}, 800)
								
								await this.loadLocalOrders()
							} else {
								uni.hideLoading()
								uni.showToast({
									title: result.errMsg || '确认失败',
									icon: 'none'
								})
							}
						} catch (error) {
							uni.hideLoading()
							uni.showToast({
								title: '操作失败，请重试',
								icon: 'none'
							})
						}
					}
				})
			},
			
			settleRiderEarnings(order) {
				try {
					const ordersData = uni.getStorageSync('orders_data') || []
					const dataIndex = ordersData.findIndex(o => String(o._id) === String(order._id))
					if (dataIndex !== -1) {
						const fee = ordersData[dataIndex].riderIncome || ordersData[dataIndex].price || 5
						const riderId = ordersData[dataIndex].rider_id || 'local_rider'
						
						try {
							const riderProfile = uni.getStorageSync('rider_profile') || {}
							const today = new Date().toDateString()
							const todayEarnings = riderProfile.todayEarnings || 0
							const totalEarnings = riderProfile.totalEarnings || 0
							const todayOrders = riderProfile.todayOrders || 0
							
							riderProfile.todayEarnings = todayEarnings + fee
							riderProfile.totalEarnings = totalEarnings + fee
							riderProfile.todayOrders = todayOrders + 1
							riderProfile.lastSettleDate = today
							
							uni.setStorageSync('rider_profile', riderProfile)
							
							const settledOrders = uni.getStorageSync('rider_settled_orders') || []
							if (!settledOrders.includes(order._id)) {
								settledOrders.push(order._id)
								uni.setStorageSync('rider_settled_orders', settledOrders)
							}
							
							console.log(`[确认收货] 骑手收益已结算: ¥${fee}`)
						} catch (e) {
							console.warn('[确认收货] 本地结算失败:', e.message)
						}
					}
				} catch (e) {
					console.warn('[确认收货] 结算处理失败:', e.message)
				}
			},
			
			async viewProofsForOrder(order) {
				try {
					const result = await orderService.detail(order._id)
					if (result.errCode === 0 && result.data && result.data.pickup_proofs) {
						this.viewPickupProofs(result.data.pickup_proofs)
					} else {
						uni.showToast({ title: '暂无凭证', icon: 'none' })
					}
				} catch (error) {
					uni.showToast({ title: '加载凭证失败', icon: 'none' })
				}
			},
			selectTab(index) {
				this.currentTab = index
			},
			_forceRefresh() {
				// 强制触发 Vue 重新计算 computed 属性
				const orders = this.localOrders
				this.localOrders = []
				this.$nextTick(() => {
					this.localOrders = orders
				})
			},
			getPrimaryStyle(order) {
				return order.primaryAction === 'track' ? 'secondary' : 'primary'
			},
			getActionLabel(order) {
				const labelMap = {
					track: '追踪',
					rate: '评价',
					reorder: '再来一单',
					confirm: '确认收货',
					pay: '去支付'
				}
				return labelMap[order.primaryAction] || '详情'
			},
			handleAction(action, order) {
				if (action === 'pay') {
					uni.navigateTo({
						url: '/pages/pay/index?orderId=' + order._id
					})
				} else if (action === 'reorder') {
					uni.navigateTo({
						url: '/pages/publish/index'
					})
				} else if (action === 'rate') {
					uni.navigateTo({
						url: '/pages/rate/index?orderId=' + order._id
					})
				} else if (action === 'confirm') {
					this.confirmReceipt(order)
				} else if (action === 'track') {
					if (order.riderPhone) {
						uni.showActionSheet({
							itemList: ['呼叫骑手', '查看配送进度'],
							success: (res) => {
								if (res.tapIndex === 0) {
									this.callRider(order.riderPhone)
								} else {
									this.showDetail(order)
								}
							}
						})
					} else {
						uni.showToast({
							title: '骑手接单中，请稍候',
							icon: 'none'
						})
					}
				}
			}
		},
		onShow() {
			this.loadLocalOrders()
			this._pickupProofsData = uni.getStorageSync('pickup_proofs') || {}
			this._forceRefresh()
			onOrderChanged(() => {
				this.loadLocalOrders()
				this._forceRefresh()
			})
		},
		onHide() {
			offOrderChanged()
		},
		onUnload() {
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
		padding-bottom: 140rpx;
	}

	.header {
		background-color: #4A90D9;
		height: 104rpx;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.header-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #FFFFFF;
		text-align: center;
		width: 100%;
	}

	.tab-bar {
		background-color: #FFFFFF;
		display: flex;
		border-bottom: 2rpx solid #F3F4F6;
		flex-shrink: 0;
	}

	.tab-item {
		flex: 1;
		padding: 28rpx 0;
		display: flex;
		justify-content: center;
		position: relative;

		&.active {
			.tab-text {
				color: #4A90D9;
				font-weight: 700;
			}

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 48rpx;
				height: 4rpx;
				background-color: #4A90D9;
				border-radius: 2rpx;
			}
		}
	}

	.tab-text {
		font-size: 28rpx;
		color: #9CA3AF;
	}

	.order-list {
		flex: 1;
		padding: 28rpx;
	}

	.order-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 32rpx;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.order-type {
		font-size: 24rpx;
		font-weight: 500;
		color: #9CA3AF;
	}

	.order-time {
		font-size: 22rpx;
		color: #D1D5DB;
	}

	.order-status {
		font-size: 24rpx;
		font-weight: 500;
	}

	.card-body {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.order-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.order-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.order-rider {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.rider-info-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-top: 8rpx;
	}

	.rider-avatar {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #4A90D9, #357ABD);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.avatar-text {
		font-size: 28rpx;
		font-weight: 600;
		color: #FFFFFF;
	}

	.rider-detail {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.rider-name {
		font-size: 26rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.rider-phone {
		font-size: 22rpx;
		color: #4A90D9;
		text-decoration: underline;
	}

	.delivery-progress {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin: 24rpx 0;
		padding: 20rpx 16rpx;
		background-color: #F8FAFC;
		border-radius: 16rpx;
	}

	.proofs-notice {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
		padding: 16rpx 24rpx;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		border: 2rpx solid #90CAF9;
	}

	.proofs-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
	}

	.proofs-text {
		flex: 1;
		font-size: 24rpx;
		color: #1565C0;
		font-weight: 500;
	}

	.proofs-view {
		background-color: #1976D2;
		padding: 10rpx 24rpx;
		border-radius: 20rpx;
	}

	.proofs-view-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: 500;
	}

	.progress-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 12rpx;
			left: 60%;
			right: -40%;
			height: 4rpx;
			background-color: #E5E7EB;
			z-index: 0;
		}

		&:last-child::after {
			display: none;
		}

		&.done::after {
			background-color: #4ECDC4;
		}

		&.active .progress-dot {
			background-color: #4A90D9;
			border-color: #4A90D9;
			box-shadow: 0 0 0 6rpx rgba(74, 144, 217, 0.2);
		}

		&.done .progress-dot {
			background-color: #4ECDC4;
			border-color: #4ECDC4;
		}

		&.done .progress-text {
			color: #4ECDC4;
		}

		&.active .progress-text {
			color: #4A90D9;
			font-weight: 600;
		}
	}

	.progress-dot {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		background-color: #FFFFFF;
		border: 4rpx solid #E5E7EB;
		z-index: 1;
		position: relative;
	}

	.progress-text {
		font-size: 20rpx;
		color: #9CA3AF;
		margin-top: 10rpx;
		white-space: nowrap;
	}

	.order-price {
		display: flex;
		align-items: baseline;
	}

	.price-symbol {
		font-size: 24rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.price-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.card-actions {
		display: flex;
		justify-content: flex-end;
		gap: 16rpx;
		margin-top: 28rpx;
		padding-top: 24rpx;
		border-top: 2rpx solid #F3F4F6;
	}

	.action-btn {
		padding: 14rpx 24rpx;
		border-radius: 16rpx;
		transition: all 0.2s;

		&:active {
			transform: scale(0.96);
		}

		&.secondary {
			background-color: #FFFFFF;
			border: 2rpx solid #E5E7EB;

			.action-text {
				color: #4B5563;
			}
		}

		&.primary {
			background-color: #4A90D9;

			.action-text {
				color: #FFFFFF;
			}
		}
	}

	.action-text {
		font-size: 24rpx;
		font-weight: 500;
	}

	.empty-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 160rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #9CA3AF;
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
		z-index: 1000;
		padding: 40rpx;
	}

	.modal-content {
		background: #fff;
		border-radius: 24rpx;
		width: 100%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 1rpx solid #F3F4F6;
		flex-shrink: 0;
	}

	.modal-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.close-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #F3F4F6;
		border-radius: 50%;
	}

	.close-text {
		font-size: 28rpx;
		color: #6B7280;
	}

	.modal-body {
		flex: 1;
		padding: 24rpx 32rpx;
		overflow: auto;
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #F3F4F6;

		&:last-child {
			border-bottom: none;
		}
	}

	.detail-label {
		font-size: 26rpx;
		color: #6B7280;
		flex-shrink: 0;
	}

	.detail-value {
		font-size: 26rpx;
		color: #1F2937;
		text-align: right;
		flex: 1;
		margin-left: 24rpx;

		&.price {
			font-weight: 600;
			font-size: 30rpx;
		}

		&.link {
			color: #4A90D9;
			text-decoration: underline;
		}
	}

	.proofs-section {
		margin-top: 16rpx;
		padding: 20rpx;
		background: #F8FAFC;
		border-radius: 16rpx;
	}

	.proofs-section-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #1F2937;
		margin-bottom: 16rpx;
		display: block;
	}

	.proofs-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.proof-image {
		width: calc(33.33% - 12rpx);
		height: 180rpx;
		border-radius: 12rpx;
		background: #E5E7EB;
	}

	.fee-breakdown {
		margin-top: 24rpx;
		padding: 24rpx;
		background: #F8FAFC;
		border-radius: 16rpx;
	}

	.fee-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2937;
		margin-bottom: 16rpx;
		display: block;
	}

	.fee-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12rpx 0;
		border-bottom: 1rpx solid #E5E7EB;

		&.total {
			border-bottom: none;
			padding-top: 16rpx;
			margin-top: 8rpx;
			border-top: 2rpx solid #4A90D9;
		}
	}

	.fee-label {
		font-size: 24rpx;
		color: #6B7280;
	}

	.fee-value {
		font-size: 24rpx;
		color: #1F2937;

		&.deduct {
			color: #EF4444;
		}

		&.income {
			color: #10B981;
			font-weight: 600;
			font-size: 28rpx;
		}
	}

	.modal-footer {
		display: flex;
		gap: 20rpx;
		padding: 24rpx 32rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #F3F4F6;
		flex-shrink: 0;
	}

	.modal-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.cancel {
			background: #F3F4F6;
		}

		&.primary {
			background: linear-gradient(135deg, #4A90D9, #357ABD);
		}
	}

	.modal-btn .btn-text {
		font-size: 30rpx;
		font-weight: 600;

		.cancel & {
			color: #6B7280;
		}

		.primary & {
			color: #fff;
		}
	}

	.proof-thumb {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		background: #E5E7EB;
	}

	.proofs-thumbs {
		display: flex;
		gap: 16rpx;
		margin-top: 16rpx;
		padding: 16rpx;
		background: #F8FAFC;
		border-radius: 12rpx;
	}
</style>