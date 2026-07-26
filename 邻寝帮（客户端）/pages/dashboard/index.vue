<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-arrow-left"></view>
			</view>
			<text class="header-title">数据概览</text>
			<view class="header-right"></view>
		</view>

		<scroll-view scroll-y class="content" :show-scrollbar="false">
			<view class="stats-grid">
				<view class="stat-card" @click="showDetail('orders')">
					<text class="stat-label">总订单量</text>
					<text class="stat-value">{{ dashboardData.totalOrders.toLocaleString() }}</text>
					<text class="stat-sub">已完成 {{ dashboardData.completedOrders }}</text>
				</view>
				<view class="stat-card" @click="showDetail('riders')">
					<text class="stat-label">活跃骑手</text>
					<text class="stat-value">{{ dashboardData.activeRiders }}</text>
					<text class="stat-sub">本周在线</text>
				</view>
				<view class="stat-card" @click="showDetail('revenue')">
					<text class="stat-label">平台流水</text>
					<text class="stat-value">¥{{ formatMoney(dashboardData.totalRevenue) }}</text>
					<text class="stat-sub">7日累计</text>
				</view>
				<view class="stat-card" @click="showDetail('rating')">
					<text class="stat-label">好评率</text>
					<text class="stat-value">{{ formatPercent(dashboardData.goodRate) }}</text>
					<text class="stat-sub">{{ dashboardData.completedOrders }}单评价</text>
				</view>
			</view>

			<view class="card">
				<view class="card-title">
					<view class="icon-finance"></view>
					<text class="card-title-text">平台抽成统计</text>
				</view>
				<view class="commission-summary">
					<view class="summary-item">
						<text class="summary-value">¥{{ formatMoney(dashboardData.platformRevenue) }}</text>
						<text class="summary-label">平台抽成</text>
					</view>
					<view class="summary-divider"></view>
					<view class="summary-item">
						<text class="summary-value">¥{{ formatMoney(dashboardData.serviceFee) }}</text>
						<text class="summary-label">服务费收入</text>
					</view>
					<view class="summary-divider"></view>
					<view class="summary-item">
						<text class="summary-value">¥{{ formatMoney(dashboardData.riderIncome) }}</text>
						<text class="summary-label">骑手收入</text>
					</view>
				</view>
				<view class="commission-list">
					<view class="commission-item" v-for="(item, index) in commissionData" :key="index">
						<text class="commission-label">{{ item.label }}</text>
						<view class="commission-bar-bg">
							<view class="commission-bar-fill" :style="{ width: item.percent + '%', backgroundColor: item.color }"></view>
						</view>
						<text class="commission-percent">{{ item.percent }}%</text>
					</view>
				</view>
			</view>

			<view class="card" @click="showDetail('trend')">
				<text class="card-title-text no-icon">订单趋势 (近7日)</text>
				<view class="trend-chart" v-if="dashboardData.dailyStats.length > 0">
					<view class="trend-bar" v-for="(item, index) in dashboardData.dailyStats" :key="index">
						<view class="bar-fill" :style="{ height: getBarHeight(item.count) + '%', backgroundColor: index === dashboardData.dailyStats.length - 1 ? '#4A90D9' : '#93C5FD' }"></view>
					</view>
				</view>
				<view class="trend-chart" v-else>
					<view class="trend-bar" v-for="(item, index) in trendData" :key="index">
						<view class="bar-fill" :style="{ height: item.height + '%', backgroundColor: item.color }"></view>
					</view>
				</view>
				<view class="trend-labels">
					<text class="trend-label" v-for="(day, index) in dashboardData.dailyStats.length > 0 ? dashboardData.dailyStats : weekDays" :key="index">
						{{ day.date || day }}
					</text>
				</view>
			</view>

			<view class="card" v-if="dashboardData.topRiders && dashboardData.topRiders.length > 0">
				<text class="card-title-text no-icon">TOP 骑手收入榜</text>
				<view class="rider-list">
					<view class="rider-item" v-for="(rider, index) in dashboardData.topRiders.slice(0, 5)" :key="index">
						<view class="rider-rank">{{ index + 1 }}</view>
						<view class="rider-info">
							<text class="rider-id">骑手 #{{ rider.rider_id ? rider.rider_id.slice(-4) : '未知' }}</text>
							<text class="rider-order-count">订单数: {{ rider.order_id ? 1 : 0 }}</text>
						</view>
						<text class="rider-income">¥{{ formatMoney(rider.amount || 0) }}</text>
					</view>
				</view>
			</view>

			<view class="refresh-btn" @click="loadDashboard">
				<text class="refresh-text">{{ loading ? '加载中...' : '刷新数据' }}</text>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { orderService } from '@/services/order.js'
	
	export default {
		data() {
			return {
				loading: false,
				dashboardData: {
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
				},
				commissionData: [
					{ label: '平台抽成(2%)', percent: 2, color: '#3B82F6' },
					{ label: '服务费(10%)', percent: 10, color: '#60A5FA' },
					{ label: '骑手收入(88%)', percent: 88, color: '#93C5FD' }
				],
				trendData: [
					{ height: 60, color: '#DBEAFE' },
					{ height: 40, color: '#DBEAFE' },
					{ height: 80, color: '#DBEAFE' },
					{ height: 100, color: '#60A5FA' },
					{ height: 70, color: '#DBEAFE' },
					{ height: 50, color: '#DBEAFE' },
					{ height: 65, color: '#DBEAFE' }
				],
				weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
			}
		},
		maxCount: 10,
		methods: {
			async loadDashboard() {
				this.loading = true
				try {
					const result = await orderService.getDashboard({ days: 7 })
					
					if (result.errCode === 0 && result.data) {
						this.dashboardData = result.data
						
				this.commissionData = [
							{ label: '平台抽成(2%)', percent: 2, color: '#3B82F6' },
							{ label: '服务费(10%)', percent: 10, color: '#60A5FA' },
							{ label: '骑手收入(88%)', percent: 88, color: '#93C5FD' }
						]
						
						this.maxCount = Math.max(...result.data.dailyStats.map(d => d.count), 1)
					}
				} catch (error) {
					console.error('加载统计数据失败:', error)
					this.loadMockData()
				} finally {
					this.loading = false
				}
			},
			loadMockData() {
				this.dashboardData = {
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
				this.maxCount = 1
			},
			getBarHeight(count) {
				if (!this.maxCount) return 10
				return Math.max(10, (count / this.maxCount) * 100)
			},
			formatMoney(value) {
				return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
			},
			formatPercent(value) {
				return ((value || 1) * 100).toFixed(1) + '%'
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
			showDetail(type) {
				const messages = {
					orders: `总订单: ${this.dashboardData.totalOrders}单`,
					riders: `活跃骑手: ${this.dashboardData.activeRiders}人`,
					revenue: `平台流水: ¥${this.formatMoney(this.dashboardData.totalRevenue)}`,
					rating: `好评率: ${this.formatPercent(this.dashboardData.goodRate)}`,
					trend: '订单趋势图表详情'
				}
				uni.showToast({
					title: messages[type] || '详情',
					icon: 'none'
				})
			}
		},
		onLoad() {
			this.loadDashboard()
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
		background-color: #4A90D9;
		height: 104rpx;
		display: flex;
		align-items: center;
		padding: 0 28rpx;
		flex-shrink: 0;
	}

	.back-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 8rpx;
	}

	.icon-arrow-left {
		width: 20rpx;
		height: 20rpx;
		border-left: 4rpx solid #FFFFFF;
		border-bottom: 4rpx solid #FFFFFF;
		transform: rotate(45deg);
	}

	.header-title {
		flex: 1;
		font-size: 36rpx;
		font-weight: 700;
		color: #FFFFFF;
		text-align: center;
		margin-right: 56rpx;
	}

	.header-right {
		width: 56rpx;
	}

	.content {
		flex: 1;
		padding: 28rpx;
		box-sizing: border-box;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		margin-bottom: 32rpx;
	}

	.stat-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;

		&:active {
			transform: scale(0.97);
		}
	}

	.stat-label {
		font-size: 22rpx;
		color: #9CA3AF;
		margin-bottom: 6rpx;
	}

	.stat-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.stat-sub {
		font-size: 20rpx;
		color: #9CA3AF;
		margin-top: 8rpx;
	}

	.card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 32rpx;
	}

	.card-title {
		display: flex;
		align-items: center;
		margin-bottom: 28rpx;
	}

	.icon-finance {
		width: 32rpx;
		height: 28rpx;
		margin-right: 16rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			width: 6rpx;
			height: 100%;
			background: #4A90D9;
			border-radius: 2rpx;
			box-shadow: 10rpx -12rpx 0 #93C5FD, 20rpx -6rpx 0 #60A5FA;
		}
	}

	.card-title-text {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2937;

		&.no-icon {
			display: block;
			margin-bottom: 28rpx;
		}
	}

	.commission-summary {
		display: flex;
		align-items: center;
		justify-content: space-around;
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 28rpx;
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.summary-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
		margin-bottom: 8rpx;
	}

	.summary-label {
		font-size: 20rpx;
		color: #6B7280;
	}

	.summary-divider {
		width: 2rpx;
		height: 60rpx;
		background: #E5E7EB;
	}

	.commission-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.commission-item {
		display: flex;
		align-items: center;
	}

	.commission-label {
		font-size: 22rpx;
		color: #6B7280;
		width: 200rpx;
		flex-shrink: 0;
	}

	.commission-bar-bg {
		flex: 1;
		height: 16rpx;
		background-color: #F3F4F6;
		border-radius: 8rpx;
		overflow: hidden;
		margin: 0 20rpx;
	}

	.commission-bar-fill {
		height: 100%;
		border-radius: 8rpx;
		transition: width 0.5s ease;
	}

	.commission-percent {
		font-size: 22rpx;
		font-weight: 700;
		color: #1F2937;
		width: 80rpx;
		text-align: right;
	}

	.trend-chart {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		height: 192rpx;
		gap: 12rpx;
	}

	.trend-bar {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		height: 100%;
	}

	.bar-fill {
		width: 100%;
		border-radius: 12rpx 12rpx 0 0;
		min-height: 8rpx;
		transition: height 0.5s ease;
	}

	.trend-labels {
		display: flex;
		justify-content: space-between;
		margin-top: 16rpx;
		gap: 12rpx;
	}

	.trend-label {
		flex: 1;
		text-align: center;
		font-size: 20rpx;
		color: #9CA3AF;
	}

	.rider-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.rider-item {
		display: flex;
		align-items: center;
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 20rpx;
	}

	.rider-rank {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #4A90D9;
		border-radius: 50%;
		font-size: 24rpx;
		font-weight: 700;
		color: #fff;
		margin-right: 20rpx;
	}

	.rider-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.rider-id {
		font-size: 26rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.rider-order-count {
		font-size: 22rpx;
		color: #6B7280;
	}

	.rider-income {
		font-size: 32rpx;
		font-weight: 700;
		color: #EF4444;
	}

	.refresh-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		margin-bottom: 32rpx;

		&:active {
			transform: scale(0.98);
		}
	}

	.refresh-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #fff;
	}

	.bottom-space {
		height: 40rpx;
	}
</style>
