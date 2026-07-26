<template>
	<view class="page-container">
		<view class="header">
			<view class="header-back" @click="goBack">
				<view class="back-icon"></view>
			</view>
			<text class="header-title">下单成功</text>
			<view class="header-placeholder"></view>
		</view>

		<view class="content">
			<view class="success-icon-wrap">
				<view class="success-glow"></view>
				<view class="success-icon">
					<view class="check-circle"></view>
					<view class="check-mark"></view>
				</view>
				<view class="pulse-ring"></view>
				<view class="pulse-ring delay-1"></view>
				<view class="pulse-ring delay-2"></view>
			</view>

			<text class="success-title">订单发布成功!</text>
			<text class="success-subtitle">骑手正在赶来,请耐心等待</text>

			<view class="order-info-card">
				<view class="info-row">
					<text class="info-label">订单编号</text>
					<text class="info-value order-no">{{ orderNo }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">订单类型</text>
					<text class="info-value">{{ orderType }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">配送路径</text>
					<text class="info-value">{{ orderRoute }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">下单时间</text>
					<text class="info-value">{{ orderTime }}</text>
				</view>
				<view class="info-row" v-if="locationText">
					<text class="info-label">当前位置</text>
					<text class="info-value location">{{ locationText }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">支付金额</text>
					<text class="info-value price">¥{{ orderPrice }}</text>
				</view>
			</view>

			<view class="btn-group">
				<view class="btn-secondary" @click="goHome">
					<text class="btn-secondary-text">返回首页</text>
				</view>
				<view class="btn-primary" @click="goOrders">
					<text class="btn-primary-text">查看订单</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderNo: '',
				orderType: '帮我送',
				orderRoute: '',
				orderTime: '',
				locationText: '',
				orderPrice: '0.00'
			}
		},
		onLoad(options) {
			if (options && options.type) {
				this.orderType = this.mapOrderType(options.type)
			}
			if (options && options.orderId) {
				this.loadOrderDetail(options.orderId)
			}
		},
		methods: {
			async loadOrderDetail(orderId) {
				try {
					const orders = uni.getStorageSync('orders_data') || []
					const order = orders.find(o => o._id === orderId)
					if (order) {
						this.orderNo = order.orderNo || ''
						this.orderRoute = `${order.pickupAddress || '取货点'} → ${order.deliveryAddress || '送货点'}`
						this.orderTime = order.created_time || this.formatTime(order.created_at)
						this.orderPrice = (order.price || 0).toFixed(2)
						if (order.location) {
							this.locationText = `${order.location.latitude?.toFixed(4)}, ${order.location.longitude?.toFixed(4)}`
						}
					}
				} catch (e) {
					console.error('加载订单详情失败:', e)
				}
			},
			formatTime(timestamp) {
				if (!timestamp) return ''
				const d = new Date(timestamp)
				const pad = n => String(n).padStart(2, '0')
				return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
			},
			mapOrderType(type) {
				const typeMap = {
					'express': '快递代取',
					'food': '食堂代买',
					'task': '代办事务',
					'delivery': '即时速递',
					'sell': '帮我卖',
					'other': '其他'
				}
				return typeMap[type] || '帮我送'
			},
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}
				})
			},
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			goOrders() {
				uni.switchTab({
					url: '/pages/orders/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background: #F5F8FA;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 24rpx;
		background: #FFFFFF;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.header-back {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-icon {
		width: 20rpx;
		height: 20rpx;
		border-left: 4rpx solid #333;
		border-bottom: 4rpx solid #333;
		transform: rotate(45deg);
		margin-left: 8rpx;
	}

	.header-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.header-placeholder {
		width: 64rpx;
	}

	.content {
		flex: 1;
		padding: 80rpx 48rpx 48rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.success-icon-wrap {
		width: 260rpx;
		height: 260rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		margin-bottom: 48rpx;
	}

	.success-glow {
		position: absolute;
		width: 260rpx;
		height: 260rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(74, 144, 217, 0.35) 0%, transparent 70%);
		filter: blur(8rpx);
		animation: glow-pulse 2.5s ease-in-out infinite;
	}

	@keyframes glow-pulse {
		0%, 100% {
			opacity: 0.7;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.08);
		}
	}

	.success-icon {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 16rpx 48rpx rgba(74, 144, 217, 0.4),
			0 6rpx 16rpx rgba(74, 144, 217, 0.25),
			inset 0 4rpx 12rpx rgba(255, 255, 255, 0.25);
		position: relative;
		z-index: 2;
		animation: icon-pulse 2s ease-in-out infinite;
	}

	@keyframes icon-pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.06);
		}
	}

	.check-circle {
		position: absolute;
		width: 120rpx;
		height: 60rpx;
		border: 6rpx solid #fff;
		border-top: none;
		border-right: none;
		border-radius: 0 0 120rpx 120rpx;
		top: 36rpx;
		left: 28rpx;
		opacity: 0.4;
	}

	.check-mark {
		width: 64rpx;
		height: 36rpx;
		border-left: 10rpx solid #fff;
		border-bottom: 10rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -12rpx;
		margin-left: 10rpx;
		filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.15));
		animation: check-draw 0.8s ease-out 0.3s both;
	}

	@keyframes check-draw {
		0% {
			opacity: 0;
			transform: rotate(-45deg) scale(0.5);
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 1;
			transform: rotate(-45deg) scale(1);
		}
	}

	.pulse-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(74, 144, 217, 0.5);
		transform: translate(-50%, -50%);
		animation: ripple 2.5s ease-out infinite;

		&.delay-1 {
			animation-delay: 0.6s;
		}

		&.delay-2 {
			animation-delay: 1.2s;
		}
	}

	@keyframes ripple {
		0% {
			width: 160rpx;
			height: 160rpx;
			opacity: 0.8;
		}
		100% {
			width: 320rpx;
			height: 320rpx;
			opacity: 0;
		}
	}

	.success-title {
		font-size: 52rpx;
		font-weight: 800;
		color: #1F2937;
		margin-bottom: 16rpx;
		letter-spacing: 2rpx;
	}

	.success-subtitle {
		font-size: 28rpx;
		color: #6B7280;
		margin-bottom: 56rpx;
		text-align: center;
		line-height: 1.6;
	}

	.order-info-card {
		background: #fff;
		border-radius: 28rpx;
		padding: 40rpx 36rpx;
		width: 100%;
		box-shadow:
			0 8rpx 32rpx rgba(0, 0, 0, 0.06),
			0 2rpx 8rpx rgba(0, 0, 0, 0.03);
		margin-bottom: 56rpx;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 0;
		border-bottom: 2rpx solid #F3F4F6;

		&:last-child {
			border-bottom: none;
			padding-bottom: 8rpx;
		}

		&:first-child {
			padding-top: 8rpx;
		}
	}

	.info-label {
		font-size: 28rpx;
		color: #9CA3AF;
		font-weight: 500;
	}

	.info-value {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2937;
		word-break: break-all;
		text-align: right;

		&.price {
			font-weight: 800;
			color: #4A90D9;
			font-size: 34rpx;
		}

		&.order-no {
			font-family: monospace;
			font-size: 24rpx;
			color: #6B7280;
			background: #F3F4F6;
			padding: 8rpx 16rpx;
			border-radius: 8rpx;
		}

		&.location {
			font-size: 22rpx;
			color: #9CA3AF;
		}
	}

	.btn-group {
		display: flex;
		gap: 24rpx;
		width: 100%;
	}

	.btn-secondary {
		flex: 1;
		padding: 36rpx 0;
		background: #F3F4F6;
		border-radius: 28rpx;
		text-align: center;
		transition: all 0.2s ease;

		&:active {
			background: #E5E7EB;
			transform: scale(0.98);
		}
	}

	.btn-secondary-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #6B7280;
	}

	.btn-primary {
		flex: 1;
		padding: 36rpx 0;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 28rpx;
		text-align: center;
		box-shadow:
			0 12rpx 32rpx rgba(74, 144, 217, 0.35),
			0 4rpx 8rpx rgba(74, 144, 217, 0.2);
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.98);
			box-shadow:
				0 6rpx 16rpx rgba(74, 144, 217, 0.3),
				0 2rpx 4rpx rgba(74, 144, 217, 0.15);
		}
	}

	.btn-primary-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 2rpx;
	}
</style>