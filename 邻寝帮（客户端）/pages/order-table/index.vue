<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="header-title">接单数据表</text>
			<view class="header-placeholder"></view>
		</view>

		<scroll-view scroll-y class="table-wrapper" :show-scrollbar="false">
			<view class="table">
				<view class="table-row table-head">
					<view class="table-cell col-no">
						<text class="head-text">编号</text>
					</view>
					<view class="table-cell col-category">
						<text class="head-text">类目</text>
					</view>
					<view class="table-cell col-amount">
						<text class="head-text">金额</text>
					</view>
					<view class="table-cell col-commission">
						<text class="head-text">抽成</text>
					</view>
					<view class="table-cell col-status">
						<text class="head-text">状态</text>
					</view>
				</view>

				<view
					class="table-row table-body"
					v-for="(order, index) in orders"
					:key="index"
					@click="showDetail(order)"
				>
					<view class="table-cell col-no">
						<text class="cell-text">{{ order.no }}</text>
					</view>
					<view class="table-cell col-category">
						<text class="cell-text">{{ order.category }}</text>
					</view>
					<view class="table-cell col-amount">
						<text class="cell-text font-medium">¥{{ order.amount }}</text>
					</view>
					<view class="table-cell col-commission">
						<text class="cell-text commission">¥{{ order.commission }}</text>
					</view>
					<view class="table-cell col-status">
						<text class="cell-text" :style="{ color: getStatusColor(order.status) }">{{ order.status }}</text>
					</view>
				</view>
			</view>

			<view class="list-bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orders: [
					{
						no: '...001',
						category: '快递',
						amount: '5.00',
						commission: '0.60',
						status: '进行中'
					},
					{
						no: '...002',
						category: '外卖',
						amount: '8.50',
						commission: '1.02',
						status: '进行中'
					},
					{
						no: '...003',
						category: '打印',
						amount: '3.00',
						commission: '0.36',
						status: '已完成'
					},
					{
						no: '...004',
						category: '跑腿',
						amount: '12.00',
						commission: '1.44',
						status: '进行中'
					},
					{
						no: '...005',
						category: '食堂',
						amount: '3.00',
						commission: '0.36',
						status: '已完成'
					},
					{
						no: '...006',
						category: '快递',
						amount: '6.00',
						commission: '0.72',
						status: '已完成'
					},
					{
						no: '...007',
						category: '代购',
						amount: '15.00',
						commission: '1.80',
						status: '进行中'
					},
					{
						no: '...008',
						category: '代取',
						amount: '4.50',
						commission: '0.54',
						status: '已完成'
					},
					{
						no: '...009',
						category: '外卖',
						amount: '9.20',
						commission: '1.10',
						status: '已完成'
					},
					{
						no: '...010',
						category: '代办',
						amount: '20.00',
						commission: '2.40',
						status: '进行中'
					}
				]
			}
		},
		methods: {
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}
				})
			},
			getStatusColor(status) {
				if (status === '进行中') return '#4A90D9'
				if (status === '已完成') return '#4ECDC4'
				return '#9CA3AF'
			},
			showDetail(order) {
				uni.showToast({
					title: '订单详情 ' + order.no,
					icon: 'none',
					duration: 1500
				})
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
		margin-left: -12rpx;
	}

	.back-icon {
		font-size: 48rpx;
		color: #FFFFFF;
		font-weight: 300;
		line-height: 1;
	}

	.header-title {
		flex: 1;
		font-size: 36rpx;
		font-weight: 700;
		color: #FFFFFF;
		text-align: center;
		margin-right: 56rpx;
	}

	.header-placeholder {
		width: 56rpx;
	}

	.table-wrapper {
		flex: 1;
		padding-top: 16rpx;
	}

	.table {
		background-color: #FFFFFF;
	}

	.table-row {
		display: flex;
		width: 100%;
		box-sizing: border-box;
	}

	.table-head {
		background-color: #F9FAFB;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.table-body {
		border-bottom: 2rpx solid #F3F4F6;

		&:last-child {
			border-bottom: none;
		}

		&:active {
			background-color: #F9FAFB;
		}
	}

	.table-cell {
		padding: 24rpx 12rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.col-no {
		flex: 1.4;
		padding-left: 24rpx;
	}

	.col-category {
		flex: 1;
	}

	.col-amount {
		flex: 1.2;
		justify-content: flex-end;
	}

	.col-commission {
		flex: 1.2;
		justify-content: flex-end;
	}

	.col-status {
		flex: 1.2;
		justify-content: flex-end;
		padding-right: 24rpx;
	}

	.head-text {
		font-size: 24rpx;
		font-weight: 500;
		color: #9CA3AF;
	}

	.cell-text {
		font-size: 24rpx;
		color: #374151;

		&.font-medium {
			font-weight: 500;
		}

		&.commission {
			color: #F59E0B;
		}
	}

	.list-bottom-space {
		height: 40rpx;
	}
</style>
