<template>
	<view class="tab-bar-wrapper">
		<view class="tab-bar">
			<view class="tab-bar-inner">
				<view 
					class="tab-item" 
					:class="{ active: current === 0 }"
					@click="switchTab(0)"
				>
					<view class="icon-svg home-icon" :class="{ active: current === 0 }">
						<view class="roof"></view>
						<view class="body"></view>
					</view>
					<text class="tab-text">首页</text>
				</view>
				
				<view 
					class="tab-item" 
					:class="{ active: current === 1 }"
					@click="switchTab(1)"
				>
					<view class="icon-svg service-icon" :class="{ active: current === 1 }">
						<view class="cart-body"></view>
						<view class="cart-wheel left"></view>
						<view class="cart-wheel right"></view>
					</view>
					<text class="tab-text">服务单</text>
				</view>
				
				<view class="tab-item center-btn" @click="goPublish">
					<view class="center-button">
						<text class="plus-icon">+</text>
					</view>
				</view>
				
				<view 
					class="tab-item" 
					:class="{ active: current === 2 }"
					@click="switchTab(2)"
				>
					<view class="icon-svg order-icon" :class="{ active: current === 2 }">
						<view class="doc-body"></view>
						<view class="doc-line line1"></view>
						<view class="doc-line line2"></view>
						<view class="doc-line line3"></view>
					</view>
					<text class="tab-text">订单</text>
				</view>
				
				<view 
					class="tab-item" 
					:class="{ active: current === 3 }"
					@click="switchTab(3)"
				>
					<view class="icon-svg profile-icon" :class="{ active: current === 3 }">
						<view class="head"></view>
						<view class="shoulder"></view>
					</view>
					<text class="tab-text">我的</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'AppTabBar',
		props: {
			current: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				tabList: [
					'pages/index/index',
					'pages/services/index',
					'pages/orders/index',
					'pages/profile/index'
				]
			}
		},
		methods: {
			switchTab(index) {
				if (this.current === index) return;
				uni.switchTab({
					url: '/' + this.tabList[index]
				});
			},
			goPublish() {
				uni.navigateTo({
					url: '/pages/publish/index'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tab-bar-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
	}

	.tab-bar {
		height: 110rpx;
		background-color: #FFFFFF;
		border-top: 1rpx solid #F1F5F9;
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
	}

	.tab-bar-inner {
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 100%;
		padding: 0 20rpx;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 8rpx 0;
		
		&.active {
			.tab-text {
				color: #4A90D9;
				font-weight: 600;
			}
			.icon-svg {
				filter: none;
			}
		}
		
		&.center-btn {
			flex: 0 0 auto;
			width: 140rpx;
		}
	}

	.tab-text {
		font-size: 20rpx;
		color: #9CA3AF;
		transition: color 0.2s;
		margin-top: 4rpx;
	}

	.center-button {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: -50rpx;
		border: 6rpx solid #F5F8FA;
		box-shadow: 0 8rpx 20rpx rgba(74, 144, 217, 0.25);
		transition: transform 0.2s, box-shadow 0.2s;
		
		&:active {
			transform: scale(0.95);
		}
	}

	.plus-icon {
		font-size: 48rpx;
		color: #FFFFFF;
		font-weight: 300;
		line-height: 1;
	}

	.icon-svg {
		width: 44rpx;
		height: 44rpx;
		position: relative;
		filter: grayscale(100%) opacity(0.4);
		transition: filter 0.2s;
	}

	.home-icon {
		.roof {
			position: absolute;
			top: 4rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 0;
			height: 0;
			border-left: 22rpx solid transparent;
			border-right: 22rpx solid transparent;
			border-bottom: 16rpx solid #9CA3AF;
		}
		.body {
			position: absolute;
			bottom: 2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 34rpx;
			height: 22rpx;
			background: #9CA3AF;
			border-radius: 0 0 4rpx 4rpx;
		}
		&.active {
			.roof { border-bottom-color: #4A90D9; }
			.body { background: #4A90D9; }
		}
	}

	.service-icon {
		.cart-body {
			position: absolute;
			top: 8rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 30rpx;
			height: 20rpx;
			border: 3rpx solid #9CA3AF;
			border-radius: 4rpx 4rpx 0 0;
			border-bottom: none;
		}
		.cart-wheel {
			position: absolute;
			bottom: 0;
			width: 8rpx;
			height: 8rpx;
			border-radius: 50%;
			background: #9CA3AF;
			&.left { left: 8rpx; }
			&.right { right: 8rpx; }
		}
		&.active {
			.cart-body { border-color: #4A90D9; }
			.cart-wheel { background: #4A90D9; }
		}
	}

	.order-icon {
		.doc-body {
			position: absolute;
			top: 2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 26rpx;
			height: 36rpx;
			border: 3rpx solid #9CA3AF;
			border-radius: 3rpx;
		}
		.doc-line {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			height: 3rpx;
			background: #9CA3AF;
			border-radius: 2rpx;
			&.line1 { top: 12rpx; width: 16rpx; }
			&.line2 { top: 20rpx; width: 14rpx; }
			&.line3 { top: 28rpx; width: 12rpx; }
		}
		&.active {
			.doc-body { border-color: #4A90D9; }
			.doc-line { background: #4A90D9; }
		}
	}

	.profile-icon {
		.head {
			position: absolute;
			top: 2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 18rpx;
			height: 18rpx;
			border: 3rpx solid #9CA3AF;
			border-radius: 50%;
		}
		.shoulder {
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 32rpx;
			height: 14rpx;
			border: 3rpx solid #9CA3AF;
			border-top: none;
			border-radius: 0 0 20rpx 20rpx;
		}
		&.active {
			.head { border-color: #4A90D9; }
			.shoulder { border-color: #4A90D9; border-top-color: transparent; }
		}
	}
</style>
