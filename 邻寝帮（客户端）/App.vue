<script>
	import { initService } from '@/services/init.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			try {
				initService.init()
				console.log('[App] 本地初始化完成')
				this.syncToCloud()
			} catch (e) {
				console.warn('[App] 初始化失败:', e.message)
			}
		},
		methods: {
			async syncToCloud() {
				try {
					const user = initService.getUser()
					await initService.syncUserToCloud(user)
					console.log('[App] 用户数据云端同步完成')
				} catch (e) {
					console.warn('[App] 云端同步失败，将使用本地数据:', e.message)
				}
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #F5F8FA;
		font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
		color: #1F2937;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-size: 28rpx;
		line-height: 1.6;
		font-weight: 400;
	}

	view, text {
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
	}

	image {
		-webkit-transform: translateZ(0);
		transform: translateZ(0);
	}

	.bg-main-blue {
		background-color: #4A90D9;
	}

	.text-main-blue {
		color: #4A90D9;
	}

	.card-shadow {
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	.card-shadow-lg {
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	}

	.hide-scrollbar {
		&::-webkit-scrollbar {
			display: none;
			width: 0;
			height: 0;
		}
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.3s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}

	.scale-enter-active,
	.scale-leave-active {
		transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.scale-enter-from,
	.scale-leave-to {
		opacity: 0;
		transform: scale(0.95);
	}
</style>