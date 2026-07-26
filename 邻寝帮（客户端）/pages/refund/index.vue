<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="header-title">售后评价</text>
			<view class="header-placeholder"></view>
		</view>

		<view class="tab-bar">
			<view
				class="tab-item"
				:class="{ active: currentTab === 0 }"
				@click="switchTab(0)"
			>
				<text class="tab-text">退款申请</text>
			</view>
			<view
				class="tab-item"
				:class="{ active: currentTab === 1 }"
				@click="switchTab(1)"
			>
				<text class="tab-text">我的评价</text>
			</view>
		</view>

		<scroll-view
			scroll-y
			class="content-area"
			:show-scrollbar="false"
		>
			<view class="section" v-if="currentTab === 0">
				<view class="card">
					<text class="card-title">订单选择</text>
					<view class="order-selector" @click="chooseOrder">
						<text class="order-text">{{ selectedOrder || '请选择订单' }}</text>
						<text class="arrow-icon">›</text>
					</view>
				</view>

				<view class="card">
					<text class="card-title">退款原因</text>
					<view class="checkbox-grid">
						<view
							class="checkbox-item"
							:class="{ checked: refundReasons.indexOf(0) !== -1 }"
							@click="toggleReason(0)"
						>
							<view class="checkbox-box">
								<text v-if="refundReasons.indexOf(0) !== -1" class="check-mark">✓</text>
							</view>
							<text class="checkbox-label">未按时送达</text>
						</view>
						<view
							class="checkbox-item"
							:class="{ checked: refundReasons.indexOf(1) !== -1 }"
							@click="toggleReason(1)"
						>
							<view class="checkbox-box">
								<text v-if="refundReasons.indexOf(1) !== -1" class="check-mark">✓</text>
							</view>
							<text class="checkbox-label">物品损坏</text>
						</view>
						<view
							class="checkbox-item"
							:class="{ checked: refundReasons.indexOf(2) !== -1 }"
							@click="toggleReason(2)"
						>
							<view class="checkbox-box">
								<text v-if="refundReasons.indexOf(2) !== -1" class="check-mark">✓</text>
							</view>
							<text class="checkbox-label">服务态度差</text>
						</view>
						<view
							class="checkbox-item"
							:class="{ checked: refundReasons.indexOf(3) !== -1 }"
							@click="toggleReason(3)"
						>
							<view class="checkbox-box">
								<text v-if="refundReasons.indexOf(3) !== -1" class="check-mark">✓</text>
							</view>
							<text class="checkbox-label">其他原因</text>
						</view>
					</view>
					<textarea
						class="desc-textarea"
						v-model="refundDesc"
						placeholder="详细描述..."
						placeholder-class="textarea-placeholder"
						:maxlength="200"
					/>
				</view>

				<view class="submit-btn" @click="handleSubmit">
					<text class="submit-text">提交申请</text>
				</view>

				<view class="records-section">
					<text class="records-title">申请记录</text>
					<view
						class="record-card"
						v-for="(record, index) in applicationRecords"
						:key="index"
						@click="viewRecord(record)"
					>
						<text class="record-id">{{ record.id }}</text>
						<text
							class="record-status"
							:style="{ color: record.statusColor }"
						>{{ record.status }}</text>
					</view>
				</view>
			</view>

			<view class="section" v-else>
				<view
					class="review-card"
					v-for="(review, index) in myReviews"
					:key="index"
				>
					<view class="review-header">
						<text class="review-order-id">{{ review.orderId }}</text>
						<text class="review-rating">{{ review.rating }} 星</text>
					</view>
					<text class="review-content">{{ review.content }}</text>
					<text class="review-time">{{ review.time }}</text>
				</view>
				<view class="empty-tip" v-if="myReviews.length === 0">
					<text class="empty-text">暂无评价记录</text>
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 0,
				selectedOrder: 'ER20260723005 - 食堂代买',
				refundReasons: [],
				refundDesc: '',
				applicationRecords: [
					{
						id: 'ER20240720112',
						status: '退款中',
						statusColor: '#F59E0B'
					},
					{
						id: 'ER20240718089',
						status: '已退款',
						statusColor: '#4ECDC4'
					}
				],
				myReviews: [
					{
						orderId: 'ER20240715067',
						rating: 5,
						content: '骑手非常准时，物品完好无损，服务态度很好！',
						time: '2024-07-15 12:30'
					},
					{
						orderId: 'ER20240712045',
						rating: 4,
						content: '配送速度还可以，就是少了一件商品，希望下次注意。',
						time: '2024-07-12 18:45'
					}
				]
			}
		},
		methods: {
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/orders/index'
						})
					}
				})
			},
			switchTab(index) {
				this.currentTab = index
			},
			chooseOrder() {
				uni.showActionSheet({
					itemList: [
						'ER20260723005 - 食堂代买',
						'ER20260722088 - 快递代取',
						'ER20260721056 - 即时速递'
					],
					success: (res) => {
						const options = [
							'ER20260723005 - 食堂代买',
							'ER20260722088 - 快递代取',
							'ER20260721056 - 即时速递'
						]
						this.selectedOrder = options[res.tapIndex]
					}
				})
			},
			toggleReason(index) {
				const pos = this.refundReasons.indexOf(index)
				if (pos === -1) {
					this.refundReasons.push(index)
				} else {
					this.refundReasons.splice(pos, 1)
				}
			},
			handleSubmit() {
				if (!this.selectedOrder) {
					uni.showToast({ title: '请选择订单', icon: 'none' })
					return
				}
				if (this.refundReasons.length === 0) {
					uni.showToast({ title: '请选择退款原因', icon: 'none' })
					return
				}
				if (!this.refundDesc.trim()) {
					uni.showToast({ title: '请填写详细描述', icon: 'none' })
					return
				}
				uni.showToast({
					title: '提交成功，我们将尽快处理',
					icon: 'none',
					duration: 1500
				})
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			},
			viewRecord(record) {
				uni.showToast({
					title: `${record.status}`,
					icon: 'none'
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
		justify-content: space-between;
		padding: 0 28rpx;
		flex-shrink: 0;
	}

	.back-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-icon {
		font-size: 48rpx;
		color: #FFFFFF;
		font-weight: 300;
		line-height: 1;
	}

	.header-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #FFFFFF;
	}

	.header-placeholder {
		width: 56rpx;
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

	.content-area {
		flex: 1;
		padding: 28rpx;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	.card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	}

	.card-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #1F2937;
		margin-bottom: 24rpx;
	}

	.order-selector {
		background-color: #F9FAFB;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.order-text {
		font-size: 24rpx;
		color: #4B5563;
	}

	.arrow-icon {
		font-size: 32rpx;
		color: #9CA3AF;
		font-weight: 300;
	}

	.checkbox-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		padding: 16rpx;
		border: 2rpx solid #F3F4F6;
		border-radius: 16rpx;
		font-size: 24rpx;
		color: #4B5563;
		transition: all 0.2s;

		&.checked {
			border-color: #4A90D9;
			background-color: #F0F7FF;
		}
	}

	.checkbox-box {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #D1D5DB;
		border-radius: 8rpx;
		margin-right: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #FFFFFF;

		.checked & {
			border-color: #4A90D9;
			background-color: #4A90D9;
		}
	}

	.check-mark {
		font-size: 20rpx;
		color: #FFFFFF;
		line-height: 1;
	}

	.checkbox-label {
		font-size: 24rpx;
		color: #4B5563;
	}

	.desc-textarea {
		width: 100%;
		font-size: 24rpx;
		color: #1F2937;
		background-color: #F9FAFB;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-top: 24rpx;
		box-sizing: border-box;
		min-height: 160rpx;
		line-height: 1.5;
	}

	.textarea-placeholder {
		color: #9CA3AF;
		font-size: 24rpx;
	}

	.submit-btn {
		background-color: #4A90D9;
		border-radius: 16rpx;
		padding: 28rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;

		&:active {
			transform: scale(0.97);
			opacity: 0.9;
		}
	}

	.submit-text {
		font-size: 32rpx;
		font-weight: 500;
		color: #FFFFFF;
	}

	.records-section {
		margin-top: 16rpx;
	}

	.records-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #9CA3AF;
		margin-bottom: 24rpx;
		display: block;
	}

	.record-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
		}
	}

	.record-id {
		font-size: 24rpx;
		color: #4B5563;
	}

	.record-status {
		font-size: 24rpx;
		font-weight: 500;
	}

	.review-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 16rpx;
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.review-order-id {
		font-size: 24rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.review-rating {
		font-size: 24rpx;
		color: #F59E0B;
	}

	.review-content {
		font-size: 26rpx;
		color: #4B5563;
		line-height: 1.6;
		margin-bottom: 12rpx;
	}

	.review-time {
		font-size: 22rpx;
		color: #9CA3AF;
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

	.bottom-space {
		height: 40rpx;
	}
</style>