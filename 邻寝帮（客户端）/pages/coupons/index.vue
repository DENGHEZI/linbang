<template>
	<view class="page-container">
		<view class="header">
			<view class="header-bg"></view>
			<view class="header-content">
				<view class="back-btn" @click="goBack">
					<view class="icon-arrow-left"></view>
				</view>
				<text class="header-title">新用户体验券</text>
				<view class="header-placeholder"></view>
			</view>
		</view>

		<scroll-view scroll-y class="content" :show-scrollbar="false">
			<view class="promo-banner">
				<view class="promo-badge">
					<text class="promo-badge-text">新人专享</text>
				</view>
				<view class="promo-content">
					<text class="promo-title">前十单可免去服务费</text>
					<text class="promo-desc">新用户注册即享 10 单免服务费特权</text>
				</view>
				<view class="promo-decoration">
					<view class="promo-star promo-star-1"></view>
					<view class="promo-star promo-star-2"></view>
				</view>
			</view>

			<view class="tab-bar">
				<view
					class="tab-item"
					:class="{ active: currentTab === 'available' }"
					@click="switchTab('available')"
				>
					<text class="tab-text">可领取</text>
					<view class="tab-badge" v-if="availableCount > 0">
						<text class="tab-badge-text">{{ availableCount }}</text>
					</view>
				</view>
				<view
					class="tab-item"
					:class="{ active: currentTab === 'used' }"
					@click="switchTab('used')"
				>
					<text class="tab-text">已使用</text>
				</view>
				<view
					class="tab-item"
					:class="{ active: currentTab === 'expired' }"
					@click="switchTab('expired')"
				>
					<text class="tab-text">已过期</text>
				</view>
			</view>

			<view class="coupon-section" v-if="currentTab === 'available'">
				<view class="section-label">
					<view class="label-dot"></view>
					<text class="label-text">新人专属礼包</text>
				</view>

				<view
					class="coupon-card featured"
					v-for="(coupon, index) in featuredCoupons"
					:key="'featured-' + index"
					@click="handleCouponClick(coupon)"
				>
					<view class="coupon-glow"></view>
					<view class="coupon-bar" :style="{ background: coupon.color }"></view>
					<view class="coupon-amount-section">
						<view class="coupon-price">
							<text class="coupon-symbol">{{ coupon.symbol }}</text>
							<text class="coupon-value">{{ coupon.value }}</text>
						</view>
						<text class="coupon-condition">{{ coupon.condition }}</text>
						<view class="coupon-tag" v-if="coupon.tag">
							<text class="coupon-tag-text">{{ coupon.tag }}</text>
						</view>
					</view>
					<view class="coupon-divider"></view>
					<view class="coupon-info">
						<text class="coupon-name">{{ coupon.name }}</text>
						<text class="coupon-validity">{{ coupon.validity }}</text>
						<text class="coupon-scope">{{ coupon.scope }}</text>
						<view class="coupon-action-btn">
							<text class="coupon-action-text">{{ coupon.action }}</text>
						</view>
					</view>
				</view>

				<view class="section-label">
					<view class="label-dot label-dot-alt"></view>
					<text class="label-text">更多优惠</text>
				</view>

				<view
					class="coupon-card"
					:class="{ inactive: coupon.status !== 'available' }"
					v-for="(coupon, index) in otherCoupons"
					:key="'other-' + index"
					@click="handleCouponClick(coupon)"
				>
					<view class="coupon-bar"></view>
					<view class="coupon-amount-section">
						<view class="coupon-price">
							<text class="coupon-symbol">¥</text>
							<text class="coupon-value">{{ coupon.amount }}</text>
						</view>
						<text class="coupon-condition">{{ coupon.condition }}</text>
					</view>
					<view class="coupon-divider"></view>
					<view class="coupon-info">
						<text class="coupon-name">{{ coupon.name }}</text>
						<text class="coupon-validity">有效期：{{ coupon.date }}</text>
						<text class="coupon-scope">适用：{{ coupon.range }}</text>
						<view class="coupon-status-btn" :class="getStatusClass(coupon.status)">
							<text class="status-btn-text">{{ getStatusText(coupon.status) }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="coupon-section" v-else>
				<view
					class="coupon-card"
					:class="{ inactive: coupon.status !== currentTab }"
					v-for="(coupon, index) in filteredCoupons"
					:key="'list-' + index"
				>
					<view class="coupon-bar"></view>
					<view class="coupon-amount-section">
						<view class="coupon-price">
							<text class="coupon-symbol">¥</text>
							<text class="coupon-value">{{ coupon.amount }}</text>
						</view>
						<text class="coupon-condition">{{ coupon.condition }}</text>
					</view>
					<view class="coupon-divider"></view>
					<view class="coupon-info">
						<text class="coupon-name">{{ coupon.name }}</text>
						<text class="coupon-validity">有效期：{{ coupon.date }}</text>
						<text class="coupon-scope">适用：{{ coupon.range }}</text>
						<view class="coupon-status-btn" :class="getStatusClass(coupon.status)">
							<text class="status-btn-text">{{ getStatusText(coupon.status) }}</text>
						</view>
					</view>
				</view>

				<view class="empty-state" v-if="filteredCoupons.length === 0">
					<view class="empty-icon">
						<view class="empty-ticket">
							<view class="ticket-notch left"></view>
							<view class="ticket-notch right"></view>
							<view class="ticket-line"></view>
						</view>
					</view>
					<text class="empty-text">{{ currentTab === 'used' ? '暂无已使用的优惠券' : '暂无已过期的优惠券' }}</text>
				</view>
			</view>

			<view class="rules-section">
				<view class="rules-header">
					<view class="rules-icon"></view>
					<text class="rules-title">优惠券使用规则</text>
				</view>
				<view class="rules-list">
					<view class="rule-item">
						<text class="rule-num">1</text>
						<text class="rule-text">新用户体验券限注册后 30 天内使用，过期作废</text>
					</view>
					<view class="rule-item">
						<text class="rule-num">2</text>
						<text class="rule-text">前十单免服务费券每单限用一张，不可叠加使用</text>
					</view>
					<view class="rule-item">
						<text class="rule-num">3</text>
						<text class="rule-text">新人专享大礼包需完成实名认证后方可领取</text>
					</view>
					<view class="rule-item">
						<text class="rule-num">4</text>
						<text class="rule-text">优惠券仅限邻寝帮平台跑腿服务使用</text>
					</view>
					<view class="rule-item">
						<text class="rule-num">5</text>
						<text class="rule-text">优惠券不兑换现金，不可转赠他人使用</text>
					</view>
					<view class="rule-item">
						<text class="rule-num">6</text>
						<text class="rule-text">如有疑问请联系客服咨询</text>
					</view>
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
				currentTab: 'available',
				featuredCoupons: [
					{
						name: '首单免服务费券',
						value: '0',
						symbol: '首单',
						condition: '首单免服务费',
						validity: '有效期：注册后7天内',
						scope: '适用：全部跑腿服务',
						action: '立即领取',
						tag: '热门',
						color: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
					},
					{
						name: '新人专享大礼包',
						value: '5',
						symbol: '¥',
						condition: '满10元可用',
						validity: '有效期：注册后30天内',
						scope: '适用：全部跑腿服务',
						action: '立即领取',
						tag: '推荐',
						color: 'linear-gradient(135deg, #4A90D9 0%, #7C3AED 100%)'
					}
				],
				otherCoupons: [
					{ name: '新用户满减券', amount: 3, condition: '满5元可用', date: '2026.07.01 - 08.31', range: '全部跑腿服务', status: 'available' },
					{ name: '快递代取优惠券', amount: 2, condition: '满3元可用', date: '2026.07.01 - 08.15', range: '快递代取', status: 'available' },
					{ name: '食堂代买优惠券', amount: 1, condition: '无门槛', date: '2026.07.01 - 07.31', range: '食堂代买', status: 'available' },
					{ name: '邀请好友券', amount: 4, condition: '满8元可用', date: '2026.07.01 - 09.30', range: '全部跑腿服务', status: 'available' }
				],
				historyCoupons: [
					{ name: '开学大礼包', amount: 5, condition: '满20元可用', date: '2026.09.01', range: '全部', status: 'used' },
					{ name: '双十一回馈券', amount: 10, condition: '满50元可用', date: '已过期', range: '全部', status: 'expired' }
				]
			}
		},
		computed: {
			availableCount() {
				return this.featuredCoupons.length + this.otherCoupons.length
			},
			filteredCoupons() {
				if (this.currentTab === 'available') {
					return this.otherCoupons.filter(c => c.status === 'available')
				}
				return this.historyCoupons.filter(c => c.status === this.currentTab)
			}
		},
		methods: {
			switchTab(tab) {
				this.currentTab = tab
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
			getStatusClass(status) {
				return {
					available: 'status-active',
					used: 'status-inactive',
					expired: 'status-inactive'
				}[status]
			},
			getStatusText(status) {
				return {
					available: '立即使用',
					used: '已使用',
					expired: '已过期'
				}[status]
			},
			handleCouponClick(coupon) {
				uni.showToast({
					title: '领取成功',
					icon: 'success'
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
		position: relative;
		padding-top: 88rpx;
		flex-shrink: 0;
	}

	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 240rpx;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
	}

	.header-content {
		position: relative;
		z-index: 1;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 28rpx;
	}

	.back-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-arrow-left {
		width: 16rpx;
		height: 16rpx;
		border-left: 4rpx solid #FFFFFF;
		border-bottom: 4rpx solid #FFFFFF;
		transform: rotate(45deg);
		margin-left: 8rpx;
	}

	.header-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #FFFFFF;
	}

	.header-placeholder {
		width: 56rpx;
		height: 56rpx;
	}

	.content {
		flex: 1;
		position: relative;
		z-index: 2;
		margin-top: -152rpx;
		padding: 0 28rpx;
	}

	.promo-banner {
		background: linear-gradient(135deg, #FF6B6B 0%, #F59E0B 100%);
		border-radius: 28rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		gap: 24rpx;
		position: relative;
		overflow: hidden;
		box-shadow: 0 12rpx 32rpx rgba(245, 158, 11, 0.3);
		margin-bottom: 28rpx;
	}

	.promo-badge {
		background: rgba(255, 255, 255, 0.25);
		border-radius: 16rpx;
		padding: 12rpx 20rpx;
		flex-shrink: 0;
	}

	.promo-badge-text {
		font-size: 22rpx;
		font-weight: 700;
		color: #fff;
	}

	.promo-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.promo-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
	}

	.promo-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
	}

	.promo-decoration {
		position: absolute;
		top: 0;
		right: 0;
		width: 120rpx;
		height: 100%;
		pointer-events: none;
	}

	.promo-star {
		position: absolute;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
	}

	.promo-star-1 {
		width: 80rpx;
		height: 80rpx;
		top: -20rpx;
		right: -20rpx;
	}

	.promo-star-2 {
		width: 40rpx;
		height: 40rpx;
		bottom: -10rpx;
		right: 30rpx;
	}

	.tab-bar {
		background-color: #FFFFFF;
		display: flex;
		border-radius: 20rpx;
		padding: 8rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.tab-item {
		flex: 1;
		padding: 24rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		border-radius: 16rpx;
		transition: all 0.3s;

		&.active {
			background: #4A90D9;

			.tab-text {
				color: #FFFFFF;
				font-weight: 700;
			}

			.tab-badge {
				background: #fff;

				.tab-badge-text {
					color: #4A90D9;
				}
			}
		}
	}

	.tab-text {
		font-size: 28rpx;
		color: #6B7280;
		font-weight: 500;
	}

	.tab-badge {
		background: #EF4444;
		border-radius: 20rpx;
		padding: 2rpx 12rpx;
		margin-left: 10rpx;
	}

	.tab-badge-text {
		font-size: 20rpx;
		color: #fff;
		font-weight: 600;
	}

	.coupon-section {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.section-label {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 8rpx;
	}

	.label-dot {
		width: 8rpx;
		height: 32rpx;
		background: linear-gradient(to bottom, #4A90D9, #7C3AED);
		border-radius: 4rpx;
	}

	.label-dot-alt {
		background: linear-gradient(to bottom, #10B981, #4A90D9);
	}

	.label-text {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.coupon-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		display: flex;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
		}

		&.inactive {
			opacity: 0.6;
		}

		&.featured {
			position: relative;
			border: 2rpx solid #FEF3C7;

			.coupon-action-btn {
				background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
				align-self: flex-end;
				padding: 12rpx 28rpx;
				border-radius: 32rpx;
				margin-top: 12rpx;
				box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.3);
			}

			.coupon-action-text {
				font-size: 24rpx;
				font-weight: 700;
				color: #fff;
			}
		}
	}

	.coupon-glow {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 8rpx;
		background: linear-gradient(90deg, #F59E0B, #EF4444, #F59E0B);
		background-size: 200% 100%;
	}

	.coupon-bar {
		width: 8rpx;
		background-color: #F59E0B;
		flex-shrink: 0;
	}

	.coupon-amount-section {
		width: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 28rpx 20rpx;
		flex-shrink: 0;
	}

	.coupon-price {
		display: flex;
		align-items: baseline;
		color: #EF4444;
		font-weight: 700;
	}

	.coupon-symbol {
		font-size: 28rpx;
	}

	.coupon-value {
		font-size: 56rpx;
		line-height: 1;
	}

	.coupon-condition {
		font-size: 22rpx;
		color: #9CA3AF;
		margin-top: 8rpx;
	}

	.coupon-tag {
		margin-top: 8rpx;
		background: linear-gradient(135deg, #EF4444, #F59E0B);
		border-radius: 12rpx;
		padding: 4rpx 12rpx;
	}

	.coupon-tag-text {
		font-size: 20rpx;
		font-weight: 700;
		color: #fff;
	}

	.coupon-divider {
		width: 2rpx;
		background: repeating-linear-gradient(
			to bottom,
			#E5E7EB 0rpx,
			#E5E7EB 8rpx,
			transparent 8rpx,
			transparent 16rpx
		);
		margin: 20rpx 0;
		flex-shrink: 0;
	}

	.coupon-info {
		flex: 1;
		padding: 28rpx 28rpx 28rpx 28rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
	}

	.coupon-name {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.coupon-validity,
	.coupon-scope {
		font-size: 22rpx;
		color: #9CA3AF;
		margin-top: 6rpx;
	}

	.coupon-status-btn {
		align-self: flex-end;
		margin-top: 12rpx;
		padding: 12rpx 28rpx;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.15s;

		&:active {
			transform: scale(0.95);
		}

		&.status-active {
			background-color: #4A90D9;

			.status-btn-text {
				color: #FFFFFF;
			}
		}

		&.status-inactive {
			border: 2rpx solid #D1D5DB;
			background-color: #FFFFFF;

			.status-btn-text {
				color: #9CA3AF;
			}
		}
	}

	.status-btn-text {
		font-size: 24rpx;
		font-weight: 500;
	}

	.empty-state {
		padding-top: 120rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-icon {
		width: 160rpx;
		height: 120rpx;
		margin-bottom: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.empty-ticket {
		width: 140rpx;
		height: 96rpx;
		border: 4rpx solid #E5E7EB;
		border-radius: 12rpx;
		position: relative;
		background-color: #F9FAFB;
	}

	.ticket-notch {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 20rpx;
		height: 20rpx;
		background-color: #F5F8FA;
		border-radius: 50%;

		&.left {
			left: -10rpx;
		}

		&.right {
			right: -10rpx;
		}
	}

	.ticket-line {
		position: absolute;
		top: 50%;
		left: 16rpx;
		right: 16rpx;
		height: 2rpx;
		background: repeating-linear-gradient(
			to right,
			#D1D5DB 0rpx,
			#D1D5DB 6rpx,
			transparent 6rpx,
			transparent 12rpx
		);
		transform: translateY(-50%);
	}

	.empty-text {
		font-size: 26rpx;
		color: #9CA3AF;
	}

	.rules-section {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-top: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.rules-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.rules-icon {
		width: 32rpx;
		height: 32rpx;
		background: #4A90D9;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 22l4-4h10c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.rules-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.rules-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.rule-item {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
	}

	.rule-num {
		width: 36rpx;
		height: 36rpx;
		background: #EFF6FF;
		color: #4A90D9;
		font-size: 24rpx;
		font-weight: 700;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.rule-text {
		font-size: 26rpx;
		color: #4B5563;
		line-height: 1.6;
		flex: 1;
	}

	.bottom-space {
		height: 60rpx;
	}
</style>