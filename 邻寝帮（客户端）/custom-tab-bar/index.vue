<template>
	<view class="tab-bar">
		<view class="tab-bar-inner">
			<view 
				class="tab-item" 
				:class="{ active: selected === 0 }"
				@click="switchTab(0)"
			>
				<view class="icon-wrapper">
					<view class="icon-home" :class="{ active: selected === 0 }"></view>
				</view>
				<text class="tab-text">首页</text>
			</view>
			
			<view 
				class="tab-item" 
				:class="{ active: selected === 1 }"
				@click="switchTab(1)"
			>
				<view class="icon-wrapper">
					<view class="icon-service" :class="{ active: selected === 1 }"></view>
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
				:class="{ active: selected === 2 }"
				@click="switchTab(2)"
			>
				<view class="icon-wrapper">
					<view class="icon-order" :class="{ active: selected === 2 }"></view>
				</view>
				<text class="tab-text">订单</text>
			</view>
			
			<view 
				class="tab-item" 
				:class="{ active: selected === 3 }"
				@click="switchTab(3)"
			>
				<view class="icon-wrapper">
					<view class="icon-profile" :class="{ active: selected === 3 }"></view>
				</view>
				<text class="tab-text">我的</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				selected: 0,
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
				if (this.selected === index) return;
				this.selected = index;
				uni.switchTab({
					url: '/' + this.tabList[index],
					fail: () => {
						uni.navigateTo({
							url: '/' + this.tabList[index]
						});
					}
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
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 110rpx;
		background-color: #FFFFFF;
		border-top: 1rpx solid #F1F5F9;
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 999;
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
		padding: 10rpx 0;
		
		&.active {
			.tab-text {
				color: #1E3A5F;
				font-weight: 600;
			}
		}
		
		&.center-btn {
			flex: 0 0 auto;
			width: 120rpx;
		}
	}

	.icon-wrapper {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4rpx;
	}

	.tab-text {
		font-size: 20rpx;
		color: #9CA3AF;
		transition: color 0.2s;
	}

	.center-button {
		width: 92rpx;
		height: 92rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: -50rpx;
		border: 6rpx solid #F5F8FA;
		box-shadow: 0 8rpx 20rpx rgba(30, 58, 95, 0.25);
		transition: transform 0.2s, box-shadow 0.2s;
		
		&:active {
			transform: scale(0.95);
		}
	}

	.plus-icon {
		font-size: 44rpx;
		color: #FFFFFF;
		font-weight: 300;
		line-height: 1;
	}

	.icon-home,
	.icon-service,
	.icon-order,
	.icon-profile {
		width: 44rpx;
		height: 44rpx;
		position: relative;
		
		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}

	.icon-home {
		&::before {
			width: 36rpx;
			height: 32rpx;
			border: 3rpx solid #9CA3AF;
			border-top: none;
			border-radius: 0 0 4rpx 4rpx;
		}
		
		&.active::before {
			border-color: #1E3A5F;
		}
	}

	.icon-service {
		&::before {
			width: 32rpx;
			height: 28rpx;
			border: 3rpx solid #9CA3AF;
			border-radius: 4rpx;
		}
		
		&.active::before {
			border-color: #1E3A5F;
		}
	}

	.icon-order {
		&::before {
			width: 30rpx;
			height: 34rpx;
			border: 3rpx solid #9CA3AF;
			border-radius: 4rpx;
		}
		
		&::after {
			content: '';
			position: absolute;
			top: 40%;
			left: 25%;
			width: 50%;
			height: 3rpx;
			background: #9CA3AF;
			box-shadow: 0 8rpx 0 #9CA3AF, 0 16rpx 0 #9CA3AF;
		}
		
		&.active::before {
			border-color: #1E3A5F;
		}
		
		&.active::after {
			background: #1E3A5F;
			box-shadow: 0 8rpx 0 #1E3A5F, 0 16rpx 0 #1E3A5F;
		}
	}

	.icon-profile {
		&::before {
			width: 24rpx;
			height: 24rpx;
			border: 3rpx solid #9CA3AF;
			border-radius: 50%;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 32rpx;
			height: 16rpx;
			border: 3rpx solid #9CA3AF;
			border-top: none;
			border-radius: 0 0 20rpx 20rpx;
		}
		
		&.active::before {
			border-color: #1E3A5F;
		}
		
		&.active::after {
			border-color: #1E3A5F;
			border-top-color: transparent;
		}
	}
</style>
