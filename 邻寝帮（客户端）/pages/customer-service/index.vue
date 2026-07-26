<template>
	<view class="page-container">
		<view class="header">
			<view class="header-content">
				<view class="back-btn" @click="goBack">
					<view class="icon-back"></view>
				</view>
				<text class="header-title">客服中心</text>
				<view class="header-placeholder"></view>
			</view>
		</view>

		<scroll-view scroll-y class="content-scroll" :show-scrollbar="false">
			<view class="content-inner">
				<view class="service-card">
					<view class="avatar-wrap">
						<view class="avatar">
							<view class="avatar-face"></view>
							<view class="avatar-body"></view>
						</view>
					</view>
					<text class="service-name">邻寝帮客服团队</text>
					<text class="service-desc">为您提供全方位的贴心服务</text>

					<view class="service-info-row">
						<view class="info-item">
							<text class="info-label">服务时间</text>
							<text class="info-value">9:00 - 22:00</text>
						</view>
						<view class="info-item clickable" @click="callPhone">
							<text class="info-label">创作者电话</text>
							<text class="info-value blue">19976889490</text>
						</view>
					</view>

					<view class="info-item full clickable" @click="copyWechat">
						<text class="info-label">创作者微信</text>
						<text class="info-value">zy1118dh</text>
						<text class="copy-hint">点击复制</text>
					</view>
				</view>

				<view class="section">
					<text class="section-title">常见问题分类</text>
					<view class="category-grid">
						<view class="category-item" v-for="(cat, idx) in categories" :key="idx" @click="goCategory(idx)">
							<view class="category-icon" :class="cat.bgClass">
								<view :class="cat.iconClass"></view>
							</view>
							<text class="category-name">{{ cat.name }}</text>
							<text class="category-desc">{{ cat.desc }}</text>
						</view>
					</view>
				</view>

				<view class="section">
					<text class="section-title">热门问题</text>
					<view class="faq-list">
						<view class="faq-item" v-for="(faq, idx) in faqs" :key="idx">
							<view class="faq-question" @click="toggleFaq(idx)">
								<text class="faq-q-text">{{ faq.question }}</text>
								<view class="faq-icon" :class="{ expanded: faq.expanded }"></view>
							</view>
							<view class="faq-answer" v-if="faq.expanded">
								<text class="faq-a-text">{{ faq.answer }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="bottom-space"></view>
			</view>
		</scroll-view>

		<view class="bottom-actions">
			<view class="btn btn-primary" @click="onlineService">
				<view class="icon-chat"></view>
				<text class="btn-text">在线客服</text>
			</view>
			<view class="btn btn-outline" @click="callPhone">
				<view class="icon-phone"></view>
				<text class="btn-text">电话客服</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				categories: [
					{ name: '跑腿服务', desc: '如何下单、范围等', bgClass: 'bg-blue', iconClass: 'icon-bike' },
					{ name: '费用相关', desc: '定价规则、退款等', bgClass: 'bg-green', iconClass: 'icon-money' },
					{ name: '账号相关', desc: '注册登录、认证等', bgClass: 'bg-purple', iconClass: 'icon-account' },
					{ name: '投诉建议', desc: '服务投诉、建议等', bgClass: 'bg-red', iconClass: 'icon-alert' }
				],
				faqs: [
					{ question: '如何发布跑腿订单？', answer: '点击首页底部"+"按钮，选择类目，填写取送地址和物品信息即可发布。', expanded: false },
					{ question: '配送范围是多大？', answer: '目前覆盖全校范围，包括所有宿舍楼、教学楼、食堂、图书馆和行政楼。', expanded: false },
					{ question: '如何申请退款？', answer: '在订单详情页点击"申请退款"，填写退款原因后提交，平台将在24小时内处理。如需人工帮助请联系创作者微信：zy1118dh', expanded: false },
					{ question: '优惠券怎么使用？', answer: '下单时系统自动匹配可用优惠券，也可在确认订单页面手动选择优惠券。', expanded: false },
					{ question: '骑手多久能送达？', answer: '通常30分钟内送达，具体时间视距离和物品类型而定。', expanded: false },
					{ question: '如何成为骑手？', answer: '在个人中心点击"切换到骑手端"，完成实名认证和学生认证即可开始接单。', expanded: false },
					{ question: '支付遇到问题怎么办？', answer: '如支付遇到问题，可拨打创作者电话19976889490，或添加创作者微信：zy1118dh 进行咨询。', expanded: false },
					{ question: '如何联系人工客服？', answer: '您可以拨打创作者电话19976889490，或添加创作者微信：zy1118dh（点击页面上的微信号可复制），我们将尽快为您服务。', expanded: false }
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
			toggleFaq(idx) {
				this.faqs[idx].expanded = !this.faqs[idx].expanded
			},
			goCategory(idx) {
				const names = ['跑腿服务', '费用相关', '账号相关', '投诉建议']
				uni.showToast({
					title: names[idx] + ' 开发中',
					icon: 'none'
				})
			},
			callPhone() {
				uni.makePhoneCall({
					phoneNumber: '19976889490',
					fail: () => {
						uni.showToast({
							title: '拨号失败',
							icon: 'none'
						})
					}
				})
			},
			copyWechat() {
				uni.setClipboardData({
					data: 'zy1118dh',
					success: () => {
						uni.showToast({
							title: '微信号已复制',
							icon: 'success'
						})
					}
				})
			},
			onlineService() {
				uni.navigateTo({
					url: '/pages/ai-service/index'
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
		padding: 100rpx 28rpx 40rpx;
		flex-shrink: 0;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.back-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-back {
		width: 20rpx;
		height: 20rpx;
		border-left: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(45deg);
		margin-right: 6rpx;
	}

	.header-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
	}

	.header-placeholder {
		width: 56rpx;
	}

	.content-scroll {
		flex: 1;
	}

	.content-inner {
		padding: 0 28rpx;
	}

	.service-card {
		background-color: #EFF6FF;
		border-radius: 32rpx;
		padding: 48rpx 32rpx;
		margin-top: 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.avatar-wrap {
		width: 128rpx;
		height: 128rpx;
		background-color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(74, 144, 217, 0.15);
		position: relative;
	}

	.avatar {
		position: relative;
		width: 80rpx;
		height: 96rpx;
	}

	.avatar-face {
		width: 48rpx;
		height: 48rpx;
		background: #4A90D9;
		border-radius: 50%;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.avatar-body {
		width: 72rpx;
		height: 36rpx;
		background: #4A90D9;
		border-radius: 36rpx 36rpx 0 0;
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.service-name {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.service-desc {
		font-size: 24rpx;
		color: #6B7280;
		margin-top: 8rpx;
	}

	.service-info-row {
		display: flex;
		gap: 16rpx;
		margin-top: 32rpx;
		width: 100%;
	}

	.info-item {
		flex: 1;
		background: #fff;
		border-radius: 16rpx;
		padding: 16rpx;
		text-align: left;

		&.clickable:active {
			background: #F9FAFB;
		}

		&.full {
			margin-top: 16rpx;
			width: 100%;
			flex: none;
		}
	}

	.info-label {
		font-size: 20rpx;
		color: #9CA3AF;
		display: block;
	}

	.info-value {
		font-size: 24rpx;
		font-weight: 500;
		color: #1F2937;
		margin-top: 4rpx;
		display: block;

		&.blue {
			color: #4A90D9;
		}
	}

	.copy-hint {
		font-size: 20rpx;
		color: #4A90D9;
		margin-top: 4rpx;
		display: block;
	}

	.info-item.clickable {
		cursor: pointer;

		&:active {
			opacity: 0.7;
		}
	}

	.section {
		margin-top: 48rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
		display: block;
		padding: 0 4rpx 24rpx;
	}

	.category-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.category-item {
		width: calc(50% - 10rpx);
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.97);
		}
	}

	.category-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;

		&.bg-blue { background: #EFF6FF; }
		&.bg-green { background: #F0FDF4; }
		&.bg-purple { background: #FAF5FF; }
		&.bg-red { background: #FEF2F2; }
	}

	.icon-bike {
		width: 40rpx;
		height: 40rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			width: 18rpx;
			height: 18rpx;
			border: 4rpx solid #3B82F6;
			border-radius: 50%;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			right: 0;
			width: 18rpx;
			height: 18rpx;
			border: 4rpx solid #3B82F6;
			border-radius: 50%;
		}
	}

	.icon-money {
		width: 40rpx;
		height: 28rpx;
		border: 4rpx solid #22C55E;
		border-radius: 6rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 16rpx;
			height: 16rpx;
			border: 3rpx solid #22C55E;
			border-radius: 50%;
		}
	}

	.icon-account {
		width: 36rpx;
		height: 40rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 20rpx;
			height: 20rpx;
			background: #A855F7;
			border-radius: 50%;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 34rpx;
			height: 16rpx;
			background: #A855F7;
			border-radius: 16rpx 16rpx 0 0;
		}
	}

	.icon-alert {
		width: 36rpx;
		height: 36rpx;
		border: 4rpx solid #EF4444;
		border-radius: 50%;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 4rpx;
			height: 16rpx;
			background: #EF4444;
			border-radius: 2rpx;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 6rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 6rpx;
			height: 6rpx;
			background: #EF4444;
			border-radius: 50%;
		}
	}

	.category-name {
		font-size: 26rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.category-desc {
		font-size: 20rpx;
		color: #9CA3AF;
		margin-top: 6rpx;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.faq-item {
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	.faq-question {
		padding: 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		&:active {
			background: #F9FAFB;
		}
	}

	.faq-q-text {
		font-size: 26rpx;
		color: #1F2937;
		flex: 1;
		font-weight: 500;
	}

	.faq-icon {
		width: 18rpx;
		height: 18rpx;
		border-right: 4rpx solid #D1D5DB;
		border-bottom: 4rpx solid #D1D5DB;
		transform: rotate(45deg);
		transition: transform 0.3s;
		margin-left: 16rpx;

		&.expanded {
			transform: rotate(-135deg);
		}
	}

	.faq-answer {
		padding: 0 28rpx 28rpx;
		border-top: 2rpx solid #F3F4F6;
		padding-top: 20rpx;
	}

	.faq-a-text {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.6;
	}

	.bottom-space {
		height: 180rpx;
	}

	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24rpx 28rpx;
		background: #F5F8FA;
		display: flex;
		gap: 20rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	}

	.btn {
		flex: 1;
		height: 96rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		transition: transform 0.2s;

		&:active {
			transform: scale(0.97);
		}

		&.btn-primary {
			background: #4A90D9;
			box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		}

		&.btn-outline {
			background: #fff;
			border: 2rpx solid #4A90D9;
		}
	}

	.btn-text {
		font-size: 28rpx;
		font-weight: 600;

		.btn-primary & {
			color: #fff;
		}

		.btn-outline & {
			color: #4A90D9;
		}
	}

	.icon-chat {
		width: 32rpx;
		height: 28rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 8rpx;
			background: #fff;
			border-radius: 6rpx;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 10rpx;
			width: 0;
			height: 0;
			border-left: 6rpx solid transparent;
			border-right: 6rpx solid transparent;
			border-top: 8rpx solid #fff;
		}
	}

	.icon-phone {
		width: 28rpx;
		height: 32rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 6rpx;
		position: relative;
		background: #fff;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 12rpx;
			height: 4rpx;
			background: #4A90D9;
			border-radius: 0 0 4rpx 4rpx;
		}
	}
</style>