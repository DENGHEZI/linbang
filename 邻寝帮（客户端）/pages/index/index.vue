<template>
	<view class="page-container">
		<view class="header">
			<view class="deco-circle deco-circle-1"></view>
			<view class="deco-circle deco-circle-2"></view>

			<view class="header-top">
				<view class="location" @click="showLocationModal">
					<view class="icon-location-wrap" :class="{ locating: locating }">
						<view class="icon-location"></view>
						<view class="location-pulse" v-if="locating"></view>
						<view class="location-dot" v-if="locating"></view>
					</view>
					<text class="location-text">{{ locationText }}</text>
					<view class="location-status" v-if="locating">
						<view class="loading-spinner"></view>
					</view>
					<view class="icon-chevron-down" v-else></view>
				</view>
				<view class="header-actions">
					<view class="action-btn" @click="switchToRider" hover-class="action-hover">
						<view class="icon-rider"></view>
						<text class="action-label">骑手</text>
					</view>
					<view class="action-btn" @click="handleNotifications">
						<view class="icon-bell"></view>
						<view class="badge-dot" v-if="unreadNotifCount > 0"></view>
					</view>
					<view class="action-btn" @click="handleScan">
						<view class="icon-qrcode"></view>
					</view>
				</view>
			</view>

			<view class="brand-area">
				<text class="brand-name">邻寝帮</text>
				<text class="brand-slogan">取快递、带三餐，邻寝帮随叫随到</text>
			</view>
		</view>

		<view class="content">
			<view class="search-box" @click="focusSearch">
				<view class="icon-search"></view>
				<input
					class="search-input"
					v-model="searchKeyword"
					:focus="searchFocus"
					placeholder="搜索服务、目的地、关键词..."
					placeholder-class="search-placeholder"
					confirm-type="search"
					@confirm="doSearch"
					@input="onSearchInput"
				/>
				<view class="icon-ai" @click.stop="goAIService">
					<text class="ai-text">AI</text>
				</view>
				<view class="search-clear" v-if="searchKeyword" @click.stop="clearSearch">
					<view class="icon-clear"></view>
				</view>
			</view>

			<view class="search-suggestions" v-if="searchExpanded">
				<view class="suggestion-header">
					<text class="suggestion-title">热门搜索</text>
					<view class="suggestion-refresh" @click="refreshSuggestions">
						<view class="icon-refresh"></view>
						<text class="refresh-text">换一批</text>
					</view>
				</view>
				<view class="suggestion-tags">
					<view
						class="suggestion-tag"
						v-for="(tag, idx) in suggestionTags"
						:key="idx"
						@click="selectSuggestion(tag)"
					>
						<text class="tag-text">{{ tag }}</text>
					</view>
				</view>
				<view class="ai-entry" @click="goAIService">
					<view class="ai-icon-wrap">
						<view class="ai-star"></view>
					</view>
					<view class="ai-info">
						<text class="ai-entry-title">咨询AI助手</text>
						<text class="ai-entry-desc">订单情况、抢单大厅、服务推荐随时问</text>
					</view>
					<view class="ai-entry-arrow"></view>
				</view>
			</view>

			<view class="new-user-banner" v-if="showNewUserBanner" @click="goCoupons">
				<view class="banner-deco"></view>
				<view class="banner-content">
					<view class="badge-new">
						<text class="badge-text">NEW</text>
					</view>
					<text class="banner-title">新用户前十单免服务费</text>
					<text class="banner-sub">限时福利 · 领取专属优惠券</text>
				</view>
				<view class="banner-btn" @click.stop="goCoupons">
					<text class="banner-btn-text">立即领取</text>
				</view>
				<view class="banner-close" @click.stop="dismissNewUser">
					<view class="icon-close"></view>
				</view>
			</view>

			<view class="service-grid">
				<view class="service-card" @click="goPublish('express')">
					<view class="service-icon blue">
						<view class="icon-package"></view>
					</view>
					<text class="service-name">快递代取</text>
					<text class="service-desc">极速送达寝室楼下</text>
				</view>

				<view class="service-card" @click="goPublish('food')">
					<view class="service-icon green">
						<view class="icon-food"></view>
					</view>
					<text class="service-name">食堂代买</text>
					<text class="service-desc">热腾腾的饭菜即刻到</text>
				</view>

				<view class="service-card" @click="goPublish('task')">
					<view class="service-icon amber">
						<view class="icon-clipboard"></view>
					</view>
					<text class="service-name">代办事务</text>
					<text class="service-desc">排队打印、材料代交</text>
				</view>

				<view class="service-card" @click="goPublish('delivery')">
					<view class="service-icon purple">
						<view class="icon-rocket"></view>
					</view>
					<text class="service-name">即时速递</text>
					<text class="service-desc">校内物品快速传递</text>
				</view>
			</view>

			<view class="other-services">
				<view class="other-card" @click="openCustomPriceModal">
					<view class="other-icon orange">
						<text class="icon-emoji">✏️</text>
					</view>
					<view class="other-info">
						<text class="other-title">其他跑腿服务</text>
						<text class="other-desc">自定义价格 · 万能帮办</text>
					</view>
					<view class="custom-price-tag">
						<text class="custom-price-text">自定义</text>
					</view>
				</view>

				<view class="other-card hot" @click="goServices">
					<view class="hot-badge">HOT</view>
					<view class="other-icon blue-light">
						<view class="icon-cart"></view>
					</view>
					<view class="other-info">
						<text class="other-title blue">服务广场</text>
						<text class="other-desc">浏览全部订单</text>
					</view>
				</view>
			</view>

			<view class="rider-entry" @click="goRiderHome">
				<view class="rider-left">
					<view class="rider-icon">
						<view class="icon-bike-simple"></view>
					</view>
					<view class="rider-info">
						<text class="rider-title">骑手端入口</text>
						<text class="rider-desc">接单赚钱 · 自由时间</text>
					</view>
				</view>
				<view class="rider-action">
					<text class="rider-action-text">切换</text>
					<view class="rider-arrow"></view>
				</view>
			</view>

			<view class="pricing-card">
				<view class="pricing-header" @click="togglePricing">
					<view class="pricing-title">
						<view class="icon-cash"></view>
						<text class="pricing-title-text">官方指导定价表</text>
					</view>
					<view class="icon-chevron" :class="{ expanded: pricingExpanded }"></view>
				</view>
				<view class="pricing-content" v-if="pricingExpanded">
					<view class="pricing-list">
						<view class="pricing-item">
							<text class="pricing-label">小型快递 (1kg以内)</text>
							<text class="pricing-value">¥2.00 起</text>
						</view>
						<view class="pricing-item">
							<text class="pricing-label">中型快递 (1-5kg)</text>
							<text class="pricing-value">¥3.00 起</text>
						</view>
						<view class="pricing-item">
							<text class="pricing-label">食堂代买 (单份)</text>
							<text class="pricing-value">¥3.00 起</text>
						</view>
						<view class="pricing-item">
							<text class="pricing-label">打印代拿 (50张以内)</text>
							<text class="pricing-value">¥2.00 起</text>
						</view>
					</view>
					<text class="pricing-notice">* 价格仅供参考，实际以发单协商为准</text>
				</view>
			</view>

			<view class="coupon-entry" @click="goCoupons">
				<view class="coupon-left">
					<view class="coupon-icon">
						<view class="icon-ticket"></view>
					</view>
					<view class="coupon-info">
						<text class="coupon-title">优惠券中心</text>
						<text class="coupon-desc">您有 {{ couponCount }} 张可用优惠券</text>
					</view>
				</view>
				<view class="coupon-action">
					<text class="coupon-action-text">去使用</text>
					<view class="coupon-arrow"></view>
				</view>
			</view>

			<view class="data-entries">
				<view class="data-card" @click="goDashboard">
					<view class="icon-chart"></view>
					<text class="data-text">数据看板</text>
				</view>
				<view class="data-card" @click="goOrderTable">
					<view class="icon-table"></view>
					<text class="data-text">接单表</text>
				</view>
			</view>
		</view>

		<view class="modal-mask" v-if="locationModalVisible" @click="closeLocationModal">
			<view class="modal-container" @click.stop>
				<view class="modal-header">
					<text class="modal-title">选择学校</text>
					<view class="modal-close" @click="closeLocationModal">
						<view class="icon-close"></view>
					</view>
				</view>
				<view class="modal-content">
					<view class="location-current">
						<view class="current-icon"></view>
						<text class="current-label">当前定位：{{ locationText }}</text>
						<view class="relocate-btn" @click="restartLocation">
							<text class="relocate-text">重新定位</text>
						</view>
					</view>
					<view class="location-input-wrap">
						<input
							class="location-input"
							v-model="customSchoolName"
							placeholder="输入您的学校名称"
							@confirm="confirmCustomSchool"
						/>
						<view class="location-confirm" @click="confirmCustomSchool">
							<text class="confirm-text">确定</text>
						</view>
					</view>
					<text class="quick-label">热门学校</text>
					<view class="school-list">
						<view
							class="school-item"
							v-for="(school, idx) in schoolList"
							:key="idx"
							@click="selectSchool(school)"
						>
							<view class="school-icon"></view>
							<text class="school-name">{{ school }}</text>
							<view class="school-check" v-if="locationText === school"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="modal-mask" v-if="customPriceModalVisible" @click="closeCustomPriceModal">
			<view class="modal-container" @click.stop>
				<view class="modal-header">
					<text class="modal-title">自定义跑腿价格</text>
					<view class="modal-close" @click="closeCustomPriceModal">
						<view class="icon-close"></view>
					</view>
				</view>
				<view class="modal-content">
					<view class="price-input-section">
						<text class="price-section-label">请输入您愿意支付的跑腿费用</text>
						<view class="price-input-row">
							<text class="price-symbol">¥</text>
							<input
								class="custom-price-input"
								v-model="customPrice"
								type="digit"
								placeholder="3-200"
								maxlength="5"
							/>
							<text class="price-unit">元</text>
						</view>
					</view>
					<view class="quick-prices">
						<view
							class="quick-price-item"
							v-for="(price, idx) in quickPrices"
							:key="idx"
							:class="{ active: customPrice === String(price) }"
							@click="setCustomPrice(price)"
						>
							<text class="quick-price-text">¥{{ price }}</text>
						</view>
					</view>
					<view class="custom-price-tip">
						<view class="tip-icon"></view>
						<text class="tip-text">价格越高，骑手接单速度越快</text>
					</view>
					<view class="custom-price-desc">
						<view class="desc-label">服务说明</view>
						<text class="desc-text">其他跑腿服务涵盖：代排队、代打印、代取物品、临时代办等。请在下一步详细描述您的需求。</text>
					</view>
					<view class="modal-confirm-btn" @click="confirmCustomPrice">
						<text class="modal-confirm-text">下一步</text>
					</view>
				</view>
			</view>
		</view>

		<AppTabBar :current="0" />
	</view>
</template>

<script>
	import AppTabBar from '@/components/order/index.vue'
	import { initService } from '@/services/init.js'

	export default {
		components: {
			AppTabBar
		},
		data() {
			const defaultSchools = [
				'华南理工大学 (大学城)',
				'华南师范大学',
				'广州大学 (大学城)',
				'中山大学 (南校区)',
				'广东外语外贸大学',
				'暨南大学',
				'广东工业大学'
			]
			
			const savedSchools = uni.getStorageSync('campus_custom_schools') || []
			const schoolList = [...new Set([...savedSchools, ...defaultSchools])]
			
			const savedLocation = uni.getStorageSync('campus_custom_school')
			
			return {
				pricingExpanded: false,
				locating: false,
				locationText: savedLocation || '华南理工大学 (大学城)',
				locationStatus: 'idle',
				searchKeyword: '',
				searchFocus: false,
				searchExpanded: false,
				unreadNotifCount: 0,
				suggestionTags: [
					'快递代取',
					'食堂代买',
					'打印店',
					'图书馆',
					'医务室',
					'取件码',
					'宿舍楼下',
					'顺丰快递'
				],
				showNewUserBanner: true,
				couponCount: 3,
				locationModalVisible: false,
				customSchoolName: '',
				schoolList: schoolList,
				customPriceModalVisible: false,
				customPrice: '',
				quickPrices: [3, 5, 8, 10, 15, 20]
			}
		},
		methods: {
			startLocation() {
				if (this.locating) return
				this.locating = true
				this.locationStatus = 'locating'
				this.locationText = '正在定位...'

				setTimeout(() => {
					uni.getLocation({
						type: 'gcj02',
						success: (res) => {
							this.locating = false
							this.locationStatus = 'success'
							this.updateLocationName(res.latitude, res.longitude)
						},
						fail: () => {
							this.locating = false
							this.locationStatus = 'error'
							this.locationText = '定位失败，点击重试'
							uni.showToast({
								title: '定位失败',
								icon: 'none'
							})
						}
					})
				}, 800)
			},
			updateLocationName(lat, lng) {
				const index = Math.floor(Math.abs(lat * 100 + lng * 100)) % this.schoolList.length
				this.locationText = this.schoolList[index]
				uni.showToast({
					title: '定位成功',
					icon: 'success'
				})
			},
			showLocationModal() {
				this.locationModalVisible = true
				this.customSchoolName = ''
			},
			closeLocationModal() {
				this.locationModalVisible = false
			},
			restartLocation() {
				this.closeLocationModal()
				this.startLocation()
			},
			confirmCustomSchool() {
				if (!this.customSchoolName.trim()) {
					uni.showToast({ title: '请输入学校名称', icon: 'none' })
					return
				}
				const schoolName = this.customSchoolName.trim()
				this.locationText = schoolName
				uni.setStorageSync('campus_custom_school', this.locationText)
				
				if (!this.schoolList.includes(schoolName)) {
					this.schoolList.unshift(schoolName)
					const savedSchools = this.schoolList.filter(school => 
						!['华南理工大学 (大学城)', '华南师范大学', '广州大学 (大学城)', '中山大学 (南校区)', '广东外语外贸大学', '暨南大学', '广东工业大学'].includes(school)
					)
					uni.setStorageSync('campus_custom_schools', savedSchools)
				}
				
				try {
					initService.updateUser({ school: schoolName })
				} catch (e) {}
				
				this.customSchoolName = ''
				this.closeLocationModal()
				uni.showToast({ title: '已设置：' + this.locationText, icon: 'success' })
			},
			selectSchool(school) {
				this.locationText = school
				uni.setStorageSync('campus_custom_school', school)
				try {
					initService.updateUser({ school })
				} catch (e) {}
				this.closeLocationModal()
				uni.showToast({ title: '已切换：' + school, icon: 'success' })
			},
			focusSearch() {
				this.searchFocus = true
				this.searchExpanded = true
			},
			onSearchInput() {
				if (this.searchKeyword.length > 0) {
					this.searchExpanded = true
				}
			},
			clearSearch() {
				this.searchKeyword = ''
				this.searchExpanded = true
				this.searchFocus = true
			},
			doSearch() {
				if (!this.searchKeyword.trim()) {
					uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
					return
				}
				this.searchFocus = false
				this.searchExpanded = false
				uni.showToast({
					title: '搜索：' + this.searchKeyword,
					icon: 'none'
				})
			},
			selectSuggestion(tag) {
				this.searchKeyword = tag
				this.doSearch()
			},
			refreshSuggestions() {
				const allTags = [
					'快递代取', '食堂代买', '打印店', '图书馆', '医务室',
					'取件码', '宿舍楼下', '顺丰快递', '菜鸟驿站', '奶茶店',
					'超市代购', '药店', '银行', '快递站', '水果摊'
				]
				const shuffled = allTags.sort(() => Math.random() - 0.5)
				this.suggestionTags = shuffled.slice(0, 8)
			},
			goAIService() {
				uni.navigateTo({
					url: '/pages/ai-service/index'
				})
			},
			dismissNewUser() {
				this.showNewUserBanner = false
				uni.setStorageSync('campus_new_user_dismissed', 'true')
			},
			goPublish(type) {
				let url = '/pages/publish/index?type=' + type
				if (type === 'other' && this.customPrice) {
					url += '&price=' + this.customPrice
				}
				uni.navigateTo({ url: url })
			},
			openCustomPriceModal() {
				this.customPriceModalVisible = true
				this.customPrice = ''
			},
			closeCustomPriceModal() {
				this.customPriceModalVisible = false
			},
			setCustomPrice(price) {
				this.customPrice = String(price)
			},
			confirmCustomPrice() {
				const price = parseFloat(this.customPrice)
				if (!price || price < 1) {
					uni.showToast({ title: '请输入有效价格', icon: 'none' })
					return
				}
				if (price > 500) {
					uni.showToast({ title: '价格不能超过500元', icon: 'none' })
					return
				}
				this.closeCustomPriceModal()
				uni.navigateTo({
					url: '/pages/publish/index?type=other&price=' + this.customPrice
				})
			},
			goServices() {
				uni.switchTab({
					url: '/pages/services/index'
				})
			},
			goDashboard() {
				uni.navigateTo({
					url: '/pages/dashboard/index'
				})
			},
			goOrderTable() {
				uni.navigateTo({
					url: '/pages/order-table/index'
				})
			},
			goCoupons() {
				uni.navigateTo({
					url: '/pages/coupons/index'
				})
			},
			goRiderHome() {
				uni.navigateTo({
					url: '/pages/rider-home/index'
				})
			},
			togglePricing() {
				this.pricingExpanded = !this.pricingExpanded
			},
			refreshUnreadCount() {
				try {
					const list = uni.getStorageSync('user_notifications') || []
					this.unreadNotifCount = list.filter(n => !n.read).length
				} catch (e) {
					this.unreadNotifCount = 0
				}
			},
			switchToRider() {
				uni.showModal({
					title: '切换到骑手端',
					content: '确定要切换到骑手端吗？',
					confirmText: '切换',
					success: (res) => {
						if (res.confirm) {
							try {
								uni.setStorageSync('current_role', 'rider')
								uni.setStorageSync('role_switched_at', Date.now())
							} catch (e) {}
							uni.redirectTo({
								url: '/pages/rider-home/index'
							})
						}
					}
				})
			},
			handleNotifications() {
				uni.navigateTo({
					url: '/pages/notifications/index'
				})
			},
			handleScan() {
				uni.scanCode({
					onlyFromCamera: false,
					scanType: ['qrCode', 'barCode'],
					success: (res) => {
						const result = res.result
						if (result) {
							if (result.startsWith('order:')) {
								const orderId = result.replace('order:', '')
								uni.navigateTo({
									url: '/pages/order-detail/index?id=' + orderId
								})
							} else if (result.startsWith('http')) {
								uni.setClipboardData({
									data: result,
									success: () => {
										uni.showModal({
											title: '扫描结果',
											content: '链接已复制到剪贴板',
											showCancel: false
										})
									}
								})
							} else {
								uni.showModal({
									title: '扫描结果',
									content: result,
									showCancel: false
								})
							}
						}
					},
					fail: (err) => {
						if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
							uni.showToast({
								title: '扫码失败',
								icon: 'none'
							})
						}
					}
				})
			}
		},
		onLoad() {
			const dismissed = uni.getStorageSync('campus_new_user_dismissed')
			if (dismissed === 'true') {
				this.showNewUserBanner = false
			}
			const savedSchool = uni.getStorageSync('campus_custom_school')
			if (savedSchool) {
				this.locationText = savedSchool
			}
			this.refreshUnreadCount()
		},
		onShow() {
			this.refreshUnreadCount()
		},
		onReady() {
			setTimeout(() => {
				this.startLocation()
			}, 500)
		},
		onHide() {
			this.searchExpanded = false
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
		background: #4A90D9;
		padding: 100rpx 32rpx 64rpx;
		position: relative;
		overflow: hidden;
	}

	.deco-circle {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.deco-circle-1 {
		top: -80rpx;
		right: -80rpx;
		width: 320rpx;
		height: 320rpx;
		background: rgba(255, 255, 255, 0.1);
	}

	.deco-circle-2 {
		top: 160rpx;
		left: -60rpx;
		width: 240rpx;
		height: 240rpx;
		background: rgba(255, 255, 255, 0.06);
	}

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 48rpx;
		position: relative;
		z-index: 1;
	}

	.location {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.15);
		padding: 12rpx 24rpx;
		border-radius: 32rpx;
		transition: all 0.3s;

		&:active {
			background: rgba(255, 255, 255, 0.25);
			transform: scale(0.97);
		}
	}

	.icon-location-wrap {
		position: relative;
		width: 28rpx;
		height: 28rpx;
		margin-right: 10rpx;

		&.locating {
			animation: bounce 0.5s ease-in-out infinite;
		}
	}

	.icon-location {
		width: 28rpx;
		height: 28rpx;
		background: #fff;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
		opacity: 0.9;
	}

	.location-pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 28rpx;
		height: 28rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.4);
		animation: pulse 1.5s ease-out infinite;
	}

	.location-dot {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 0 12rpx rgba(255, 255, 255, 0.8);
	}

	@keyframes pulse {
		0% {
			width: 28rpx;
			height: 28rpx;
			opacity: 1;
		}
		100% {
			width: 60rpx;
			height: 60rpx;
			opacity: 0;
		}
	}

	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4rpx);
		}
	}

	.location-text {
		color: #fff;
		font-size: 26rpx;
		font-weight: 500;
		max-width: 280rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: all 0.3s;
	}

	.location-status {
		margin-left: 12rpx;
	}

	.loading-spinner {
		width: 24rpx;
		height: 24rpx;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.icon-chevron-down {
		width: 20rpx;
		height: 20rpx;
		border-right: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(45deg);
		margin-left: 10rpx;
		opacity: 0.8;
		transition: opacity 0.3s;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.action-btn {
		position: relative;
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 50%;
	}

	.icon-bell {
		width: 36rpx;
		height: 36rpx;
		border: 3rpx solid #fff;
		border-radius: 50%;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -4rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 12rpx;
			height: 6rpx;
			background: #fff;
			border-radius: 6rpx 6rpx 0 0;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 8rpx;
			height: 8rpx;
			background: #fff;
			border-radius: 50%;
		}
	}

	.badge-dot {
		position: absolute;
		top: 6rpx;
		right: 6rpx;
		width: 16rpx;
		height: 16rpx;
		background: #F59E0B;
		border-radius: 50%;
		border: 3rpx solid #fff;
	}

	.icon-qrcode {
		width: 36rpx;
		height: 36rpx;
		background: #fff;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 5h6V3H3v2zm0 8h6v-2H3v2zm0 8h6v-2H3v2zm8-14v2h2V3h-2zm0 8h2v-2h-2v2zm0 8h2v-2h-2v2zm6-16v2h2V3h-2zm0 8h2v-2h-2v2zm0 8h2v-2h-2v2z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
		opacity: 0.95;
	}

	.icon-rider {
		width: 36rpx;
		height: 36rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 20rpx;
			height: 12rpx;
			background: #fff;
			border-radius: 10rpx 10rpx 4rpx 4rpx;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 8rpx;
			height: 8rpx;
			background: #fff;
			border-radius: 50%;
		}
	}

	.action-label {
		font-size: 18rpx;
		color: #fff;
		margin-top: 2rpx;
	}

	.action-hover {
		opacity: 0.7;
	}

	.brand-area {
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
	}

	.brand-name {
		font-size: 56rpx;
		font-weight: 800;
		color: #fff;
		letter-spacing: 4rpx;
	}

	.brand-slogan {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.85);
		margin-top: 12rpx;
	}

	.content {
		flex: 1;
		padding: 0 28rpx;
		margin-top: -48rpx;
		position: relative;
		z-index: 2;
	}

	.search-box {
		background: #fff;
		border-radius: 24rpx;
		padding: 24rpx 20rpx 24rpx 32rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		margin-bottom: 20rpx;
		border: 2rpx solid rgba(255, 255, 255, 0.8);
	}

	.icon-search {
		width: 32rpx;
		height: 32rpx;
		margin-right: 16rpx;
		border: 4rpx solid #9CA3AF;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			right: -8rpx;
			bottom: -6rpx;
			width: 12rpx;
			height: 4rpx;
			background: #9CA3AF;
			transform: rotate(45deg);
			border-radius: 2rpx;
		}
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		background: transparent;
	}

	.search-placeholder {
		color: #9CA3AF;
	}

	.icon-ai {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		padding: 10rpx 20rpx;
		border-radius: 20rpx;
		margin-left: 12rpx;
		display: flex;
		align-items: center;
	}

	.ai-text {
		font-size: 22rpx;
		font-weight: 700;
		color: #fff;
	}

	.search-clear {
		margin-left: 12rpx;
		padding: 8rpx;
	}

	.icon-clear {
		width: 28rpx;
		height: 28rpx;
		position: relative;

		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 24rpx;
			height: 4rpx;
			background: #9CA3AF;
			border-radius: 2rpx;
		}

		&::before { transform: translate(-50%, -50%) rotate(45deg); }
		&::after { transform: translate(-50%, -50%) rotate(-45deg); }
	}

	.search-suggestions {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	}

	.suggestion-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.suggestion-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.suggestion-refresh {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 16rpx;
		background: #F3F4F6;
		border-radius: 20rpx;
	}

	.icon-refresh {
		width: 24rpx;
		height: 24rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 50%;
		border-top-color: transparent;
		border-right-color: transparent;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: -4rpx;
			right: -2rpx;
			width: 0;
			height: 0;
			border-left: 6rpx solid transparent;
			border-right: 6rpx solid transparent;
			border-bottom: 8rpx solid #4A90D9;
		}
	}

	.refresh-text {
		font-size: 22rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.suggestion-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.suggestion-tag {
		background: #EFF6FF;
		border: 2rpx solid #DBEAFE;
		padding: 14rpx 24rpx;
		border-radius: 24rpx;
		transition: all 0.2s;

		&:active {
			background: #4A90D9;
			.tag-text { color: #fff; }
		}
	}

	.tag-text {
		font-size: 24rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.ai-entry {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #EFF6FF 0%, #FAF5FF 100%);
		padding: 24rpx;
		border-radius: 20rpx;
		border: 2rpx solid #E0E7FF;
	}

	.ai-icon-wrap {
		width: 72rpx;
		height: 72rpx;
		background: linear-gradient(135deg, #4A90D9, #8B5CF6);
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.ai-star {
		width: 36rpx;
		height: 36rpx;
		background: #fff;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
	}

	.ai-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.ai-entry-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.ai-entry-desc {
		font-size: 22rpx;
		color: #6B7280;
	}

	.ai-entry-arrow {
		width: 16rpx;
		height: 16rpx;
		border-right: 4rpx solid #4A90D9;
		border-bottom: 4rpx solid #4A90D9;
		transform: rotate(-45deg);
	}

	.new-user-banner {
		background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
		border-radius: 24rpx;
		padding: 24rpx 24rpx 24rpx 100rpx;
		margin-bottom: 32rpx;
		position: relative;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(251, 191, 36, 0.2);
		overflow: hidden;
	}

	.banner-deco {
		position: absolute;
		left: 24rpx;
		top: 50%;
		transform: translateY(-50%);
		width: 56rpx;
		height: 56rpx;
		background: #F59E0B;
		border-radius: 50%;
		opacity: 0.3;
	}

	.banner-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		position: relative;
		z-index: 1;
	}

	.badge-new {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #EF4444;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		width: fit-content;
		margin-bottom: 4rpx;
	}

	.badge-text {
		font-size: 20rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 1rpx;
	}

	.banner-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #92400E;
	}

	.banner-sub {
		font-size: 24rpx;
		color: #B45309;
	}

	.banner-btn {
		background: #F59E0B;
		padding: 14rpx 28rpx;
		border-radius: 24rpx;
		position: relative;
		z-index: 1;
	}

	.banner-btn-text {
		font-size: 24rpx;
		font-weight: 700;
		color: #fff;
	}

	.banner-close {
		position: absolute;
		top: 12rpx;
		right: 12rpx;
		padding: 8rpx;
		z-index: 2;
	}

	.icon-close {
		width: 24rpx;
		height: 24rpx;
		position: relative;

		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 24rpx;
			height: 3rpx;
			background: #92400E;
			border-radius: 2rpx;
		}

		&::before { transform: translate(-50%, -50%) rotate(45deg); }
		&::after { transform: translate(-50%, -50%) rotate(-45deg); }
	}

	.service-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
		margin-bottom: 24rpx;
	}

	.service-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx 28rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		transition: transform 0.2s, box-shadow 0.2s;

		&:active {
			transform: scale(0.97);
		}
	}

	.service-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;

		&.blue { background: #EFF6FF; }
		&.green { background: #F0FDF4; }
		&.amber { background: #FFFBEB; }
		&.purple { background: #FAF5FF; }
	}

	.icon-package {
		width: 40rpx;
		height: 36rpx;
		border: 4rpx solid #4A90D9;
		border-radius: 6rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 4rpx;
			background: #4A90D9;
		}

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 4rpx;
			height: 100%;
			background: #4A90D9;
		}
	}

	.icon-food {
		width: 36rpx;
		height: 40rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 32rpx;
			height: 24rpx;
			border: 4rpx solid #4ECDC4;
			border-radius: 0 0 8rpx 8rpx;
		}

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 16rpx;
			height: 20rpx;
			border: 4rpx solid #4ECDC4;
			border-top: none;
			border-radius: 0 0 8rpx 8rpx;
		}
	}

	.icon-clipboard {
		width: 36rpx;
		height: 40rpx;
		border: 4rpx solid #F59E0B;
		border-radius: 6rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -12rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 16rpx;
			height: 8rpx;
			background: #F59E0B;
			border-radius: 4rpx;
		}

		&::after {
			content: '';
			position: absolute;
			top: 12rpx;
			left: 8rpx;
			right: 8rpx;
			height: 4rpx;
			background: #F59E0B;
			box-shadow: 0 10rpx 0 #F59E0B;
		}
	}

	.icon-rocket {
		width: 32rpx;
		height: 44rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 20rpx;
			height: 32rpx;
			background: #8B5CF6;
			border-radius: 10rpx 10rpx 4rpx 4rpx;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 0;
			height: 0;
			border-left: 10rpx solid transparent;
			border-right: 10rpx solid transparent;
			border-top: 12rpx solid #8B5CF6;
		}
	}

	.service-name {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
		margin-bottom: 6rpx;
	}

	.service-desc {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.other-services {
		display: flex;
		gap: 24rpx;
		margin-bottom: 24rpx;
	}

	.other-card {
		flex: 1;
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		position: relative;

		&:active {
			transform: scale(0.98);
		}

		&.hot {
			background: #fff;
		}
	}

	.hot-badge {
		position: absolute;
		top: 0;
		right: 0;
		background: #EF4444;
		color: #fff;
		font-size: 20rpx;
		font-weight: 800;
		padding: 6rpx 16rpx;
		border-radius: 0 24rpx 0 20rpx;
	}

	.other-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.orange { background: #FFF7ED; }
		&.blue-light { background: #DBEAFE; }
	}

	.icon-emoji {
		font-size: 36rpx;
	}

	.icon-cart {
		width: 28rpx;
		height: 24rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 4rpx 4rpx 0 0;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			bottom: -6rpx;
			left: -4rpx;
			width: 8rpx;
			height: 8rpx;
			background: #4A90D9;
			border-radius: 50%;
			box-shadow: 28rpx 0 0 #4A90D9;
		}
	}

	.other-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.other-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
		margin-bottom: 4rpx;

		&.blue {
			color: #4A90D9;
		}
	}

	.other-desc {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.custom-price-tag {
		background: #FFF7ED;
		border: 2rpx solid #FED7AA;
		padding: 6rpx 14rpx;
		border-radius: 12rpx;
	}

	.custom-price-text {
		font-size: 20rpx;
		font-weight: 600;
		color: #EA580C;
	}

	.rider-entry {
		background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	}

	.rider-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.rider-icon {
		width: 72rpx;
		height: 72rpx;
		background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-bike-simple {
		width: 36rpx;
		height: 28rpx;
		background: #fff;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-2v-2h-7v2H6.5c-.66 0-1.21.42-1.42 1.01C4.48 6.69 4 7.75 4 9v5c0 1.1.9 2 2 2h.02c.4 1.71 1.68 3.13 3.38 3.48L11 18l2.43-4.2c.51.23 1.07.35 1.65.35H16V14H12.84l-2.22 3.84-.45-1.54 2.32-4.02c.5-.87 1.46-1.43 2.51-1.43h1V7h1.28l.72 2h1.5l-.72-2h.62zm-2.92 7c-.83 0-1.5-.67-1.5-1.5S15.17 10 16 10s1.5.67 1.5 1.5S16.83 13 16 13zM8 13H7V8h3V6H6c-.33 0-.64.09-.91.24L4.26 7.69C4.47 7.27 4.93 7 5.47 7H6v6H4v-1H3v2h5v-1zm.5 1c-.83 0-1.5-.67-1.5-1.5S7.67 11 8.5 11s1.5.67 1.5 1.5S9.33 14 8.5 14z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.rider-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.rider-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #fff;
	}

	.rider-desc {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.rider-action {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: rgba(255, 255, 255, 0.15);
		padding: 14rpx 24rpx;
		border-radius: 24rpx;
	}

	.rider-action-text {
		font-size: 24rpx;
		font-weight: 600;
		color: #fff;
	}

	.rider-arrow {
		width: 14rpx;
		height: 14rpx;
		border-right: 3rpx solid #fff;
		border-top: 3rpx solid #fff;
		transform: rotate(45deg);
	}

	.pricing-card {
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 24rpx;
		overflow: hidden;
	}

	.pricing-header {
		padding: 28rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		&:active {
			background: #F9FAFB;
		}
	}

	.pricing-title {
		display: flex;
		align-items: center;
	}

	.icon-cash {
		width: 40rpx;
		height: 28rpx;
		background: #4A90D9;
		border-radius: 6rpx;
		margin-right: 16rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 18rpx;
			height: 18rpx;
			border: 2rpx solid #fff;
			border-radius: 50%;
		}
	}

	.pricing-title-text {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.icon-chevron {
		width: 24rpx;
		height: 24rpx;
		border-right: 4rpx solid #9CA3AF;
		border-bottom: 4rpx solid #9CA3AF;
		transform: rotate(45deg);
		transition: transform 0.3s;

		&.expanded {
			transform: rotate(-135deg);
		}
	}

	.pricing-content {
		padding: 8rpx 32rpx 28rpx;
		border-top: 2rpx solid #F3F4F6;
	}

	.pricing-list {
		padding: 12rpx 0;
	}

	.pricing-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14rpx 0;
		border-bottom: 2rpx dashed #F3F4F6;

		&:last-child {
			border-bottom: none;
		}
	}

	.pricing-label {
		font-size: 26rpx;
		color: #6B7280;
	}

	.pricing-value {
		font-size: 26rpx;
		font-weight: 600;
		color: #4A90D9;
	}

	.pricing-notice {
		font-size: 22rpx;
		color: #9CA3AF;
		text-align: center;
		margin-top: 16rpx;
		display: block;
	}

	.coupon-entry {
		background: #fff;
		border-radius: 24rpx;
		padding: 24rpx 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		border: 2rpx solid #FEE2E2;
	}

	.coupon-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.coupon-icon {
		width: 72rpx;
		height: 72rpx;
		background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-ticket {
		width: 32rpx;
		height: 20rpx;
		border: 3rpx solid #EF4444;
		border-radius: 4rpx;
		position: relative;

		&::before,
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			width: 4rpx;
			height: 8rpx;
			background: #FEE2E2;
			border-radius: 2rpx;
		}

		&::before { left: 6rpx; }
		&::after { right: 6rpx; }
	}

	.coupon-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.coupon-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.coupon-desc {
		font-size: 22rpx;
		color: #6B7280;
	}

	.coupon-action {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.coupon-action-text {
		font-size: 26rpx;
		font-weight: 600;
		color: #EF4444;
	}

	.coupon-arrow {
		width: 14rpx;
		height: 14rpx;
		border-right: 3rpx solid #EF4444;
		border-top: 3rpx solid #EF4444;
		transform: rotate(45deg);
	}

	.data-entries {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
	}

	.data-card {
		background: #fff;
		border: 2rpx solid #F3F4F6;
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		transition: all 0.2s;

		&:active {
			background: #F5F8FA;
		}
	}

	.icon-chart {
		width: 36rpx;
		height: 32rpx;
		display: flex;
		align-items: flex-end;
		gap: 6rpx;

		&::before,
		&::after {
			content: '';
			width: 10rpx;
			background: #4A90D9;
			border-radius: 2rpx;
		}

		&::before { height: 18rpx; }
		&::after { height: 28rpx; }
	}

	.icon-table {
		width: 36rpx;
		height: 32rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 4rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 3rpx;
			background: #4A90D9;
		}
	}

	.data-text {
		font-size: 26rpx;
		font-weight: 500;
		color: #374151;
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-container {
		width: 100%;
		max-height: 85vh;
		background: #fff;
		border-radius: 32rpx 32rpx 0 0;
		overflow: hidden;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.modal-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.modal-close {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-content {
		padding: 24rpx 32rpx 48rpx;
		max-height: 70vh;
		overflow-y: auto;
	}

	.location-current {
		display: flex;
		align-items: center;
		background: #F0F9FF;
		border: 2rpx solid #DBEAFE;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		margin-bottom: 24rpx;
		gap: 16rpx;
	}

	.current-icon {
		width: 24rpx;
		height: 32rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 12rpx 12rpx 12rpx 0;
		transform: rotate(-45deg);
		flex-shrink: 0;
	}

	.current-label {
		flex: 1;
		font-size: 26rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.relocate-btn {
		background: #4A90D9;
		padding: 10rpx 20rpx;
		border-radius: 20rpx;
	}

	.relocate-text {
		font-size: 22rpx;
		font-weight: 600;
		color: #fff;
	}

	.location-input-wrap {
		display: flex;
		gap: 16rpx;
		margin-bottom: 32rpx;
	}

	.location-input {
		flex: 1;
		background: #F3F4F6;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		color: #1F2937;
	}

	.location-confirm {
		background: #4A90D9;
		padding: 20rpx 32rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.confirm-text {
		font-size: 28rpx;
		font-weight: 600;
		color: #fff;
	}

	.quick-label {
		font-size: 26rpx;
		font-weight: 600;
		color: #6B7280;
		display: block;
		margin-bottom: 16rpx;
	}

	.school-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.school-item {
		display: flex;
		align-items: center;
		padding: 24rpx;
		background: #F9FAFB;
		border-radius: 16rpx;
		transition: all 0.2s;

		&:active {
			background: #EFF6FF;
		}
	}

	.school-icon {
		width: 24rpx;
		height: 32rpx;
		border: 3rpx solid #9CA3AF;
		border-radius: 4rpx;
		margin-right: 16rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 10rpx;
			height: 10rpx;
			background: #9CA3AF;
			border-radius: 2rpx;
		}
	}

	.school-name {
		flex: 1;
		font-size: 28rpx;
		color: #1F2937;
		font-weight: 500;
	}

	.school-check {
		width: 20rpx;
		height: 20rpx;
		background: #4A90D9;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 10rpx;
			height: 6rpx;
			border-left: 3rpx solid #fff;
			border-bottom: 3rpx solid #fff;
			transform: translate(-50%, -70%) rotate(-45deg);
		}
	}

	.price-input-section {
		margin-bottom: 32rpx;
	}

	.price-section-label {
		font-size: 28rpx;
		font-weight: 600;
		color: #374151;
		display: block;
		margin-bottom: 20rpx;
	}

	.price-input-row {
		display: flex;
		align-items: center;
		background: #F9FAFB;
		border: 2rpx solid #E5E7EB;
		border-radius: 20rpx;
		padding: 24rpx 28rpx;
		gap: 12rpx;
	}

	.price-symbol {
		font-size: 36rpx;
		font-weight: 700;
		color: #4A90D9;
	}

	.custom-price-input {
		flex: 1;
		font-size: 40rpx;
		font-weight: 700;
		color: #1F2937;
		text-align: center;
	}

	.price-unit {
		font-size: 28rpx;
		color: #9CA3AF;
	}

	.quick-prices {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 28rpx;
	}

	.quick-price-item {
		background: #F3F4F6;
		border: 2rpx solid #E5E7EB;
		padding: 16rpx 24rpx;
		border-radius: 16rpx;
		transition: all 0.2s;

		&.active {
			background: #4A90D9;
			border-color: #4A90D9;
			.quick-price-text { color: #fff; }
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.quick-price-text {
		font-size: 26rpx;
		font-weight: 600;
		color: #374151;
	}

	.custom-price-tip {
		display: flex;
		align-items: center;
		gap: 12rpx;
		background: #FEF3C7;
		padding: 16rpx 20rpx;
		border-radius: 12rpx;
		margin-bottom: 24rpx;
	}

	.tip-icon {
		width: 20rpx;
		height: 20rpx;
		background: #F59E0B;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
	}

	.tip-text {
		font-size: 24rpx;
		color: #92400E;
	}

	.custom-price-desc {
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		margin-bottom: 32rpx;
	}

	.desc-label {
		font-size: 26rpx;
		font-weight: 600;
		color: #374151;
		margin-bottom: 12rpx;
	}

	.desc-text {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.6;
	}

	.modal-confirm-btn {
		background: #4A90D9;
		border-radius: 20rpx;
		padding: 28rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
		}
	}

	.modal-confirm-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
	}
</style>