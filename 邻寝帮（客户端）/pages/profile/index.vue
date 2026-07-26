<template>
	<view class="page-container">
		<view v-if="!isLoggedIn" class="logged-out-wrap">
			<view class="lock-icon-wrap">
				<view class="lock-icon">
					<view class="lock-ring"></view>
					<view class="lock-body"></view>
					<view class="lock-keyhole"></view>
				</view>
				<view class="key-icon">
					<view class="key-head"></view>
					<view class="key-shaft"></view>
					<view class="key-bit bit1"></view>
					<view class="key-bit bit2"></view>
				</view>
			</view>
			<text class="logout-title">请先登录</text>
			<text class="logout-subtitle">登录后即可使用全部功能</text>
			<view class="login-btn" @click="goLogin">
				<text class="login-btn-text">前往登录</text>
			</view>
			<view class="register-link" @click="goRegister">
				<text class="register-text">还没有账号？</text>
				<text class="register-link-text">立即注册</text>
			</view>
		</view>

		<view v-else class="logged-in-wrap">
			<view class="header">
				<view class="user-row">
					<view class="avatar" @click="openEditModal">
						<view class="avatar-inner"></view>
					</view>
					<view class="user-info" @click="openEditModal">
						<view class="name-row">
							<text class="user-name">{{ userProfile.nickname }}</text>
							<view class="verified-badge" v-if="userProfile.verified">
								<text class="verified-text">已认证</text>
							</view>
						</view>
						<text class="user-id">学号：{{ userProfile.studentId }} | {{ userProfile.school }}</text>
					</view>
					<view class="edit-profile-btn" @click="openEditModal">
						<text class="edit-btn-text">编辑资料</text>
					</view>
				</view>
			</view>

			<view class="data-card">
				<view class="data-item">
					<text class="data-value">{{ userProfile.orderCount }}</text>
					<text class="data-label">完成订单</text>
				</view>
				<view class="data-divider"></view>
				<view class="data-item">
					<text class="data-value">{{ (userProfile.balance || 0).toFixed(2) }}</text>
					<text class="data-label">账户余额</text>
				</view>
				<view class="data-divider"></view>
				<view class="data-item">
					<text class="data-value">{{ userProfile.verified ? '已认证' : '未认证' }}</text>
					<text class="data-label">认证状态</text>
				</view>
			</view>

			<scroll-view scroll-y class="menu-list" :show-scrollbar="false">
				<view class="menu-card">
					<view class="menu-item" @click="goWallet">
						<view class="menu-icon blue"><view class="icon-wallet"></view></view>
						<text class="menu-text">我的钱包</text>
						<text class="menu-value">¥{{ (userProfile.balance || 0).toFixed(2) }}</text>
						<view class="menu-arrow"></view>
					</view>
					<view class="menu-item" @click="goBankCards">
						<view class="menu-icon blue-dark"><view class="icon-wallet"></view></view>
						<text class="menu-text">我的银行卡</text>
						<view class="menu-arrow"></view>
					</view>
					<view class="menu-item" @click="goOrders">
						<view class="menu-icon purple"><view class="icon-orders"></view></view>
						<text class="menu-text">全部订单</text>
						<view class="menu-arrow"></view>
					</view>
					<view class="menu-item" @click="goCoupons">
						<view class="menu-icon pink"><view class="icon-ticket"></view></view>
						<text class="menu-text">优惠券</text>
						<view class="menu-arrow"></view>
					</view>
					<view class="menu-item" @click="goAddress">
						<view class="menu-icon orange"><view class="icon-location"></view></view>
						<text class="menu-text">收货地址</text>
						<view class="menu-arrow"></view>
					</view>
					<view class="menu-item" @click="goAIService">
						<view class="menu-icon purple"><view class="icon-service"></view></view>
						<text class="menu-text">AI智能客服</text>
						<view class="menu-arrow"></view>
					</view>
					<view class="menu-item" @click="goCustomerService">
						<view class="menu-icon green"><view class="icon-service"></view></view>
						<text class="menu-text">联系客服</text>
						<view class="menu-arrow"></view>
					</view>
					<view class="menu-item last" @click="goVerify">
						<view class="menu-icon blue-dark"><view class="icon-shield"></view></view>
						<text class="menu-text">认证中心</text>
						<view class="menu-arrow"></view>
					</view>
				</view>

				<view class="menu-item" @click="resetData">
					<view class="menu-icon red"><view class="icon-service"></view></view>
					<text class="menu-text">重置数据（恢复初始化）</text>
					<view class="menu-arrow"></view>
				</view>

				<view class="logout-btn" @click="doLogout">
					<text class="logout-text">退出登录</text>
				</view>

				<view class="list-bottom-space"></view>
			</scroll-view>
		</view>

		<view class="modal-overlay" v-if="showEditModal" @click="closeEditModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">编辑个人信息</text>
					<view class="close-btn" @click="closeEditModal">
						<view class="close-icon"></view>
					</view>
				</view>
				<view class="modal-body">
					<view class="form-item">
						<text class="form-label">昵称</text>
						<input class="form-input" v-model="editForm.nickname" placeholder="请输入昵称" />
					</view>
					<view class="form-item">
						<text class="form-label">手机号</text>
						<input class="form-input" v-model="editForm.phone" type="text" placeholder="请输入手机号" />
					</view>
					<view class="form-item">
						<text class="form-label">学校</text>
						<input class="form-input" v-model="editForm.school" placeholder="请输入学校名称" />
					</view>
					<view class="form-item">
						<text class="form-label">学号</text>
						<input class="form-input" v-model="editForm.studentId" placeholder="请输入学号" />
					</view>
				</view>
				<view class="modal-footer">
					<view class="modal-btn cancel" @click="closeEditModal">
						<text class="btn-text">取消</text>
					</view>
					<view class="modal-btn confirm" @click="saveEditModal">
						<text class="btn-text">保存</text>
					</view>
				</view>
			</view>
		</view>

		<AppTabBar :current="3" />
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
			const user = initService.getUser()
			return {
				isLoggedIn: true,
				userProfile: user,
				showEditModal: false,
				editForm: {
					nickname: '',
					phone: '',
					school: '',
					studentId: ''
				}
			}
		},
		onLoad() {
			this.checkLoginStatus()
		},
		onShow() {
			this.checkLoginStatus()
			this.loadUserProfile()
		},
		methods: {
			checkLoginStatus() {
				const logged = uni.getStorageSync('campus_user_logged_in')
				if (logged === true || logged === 'true') {
					this.isLoggedIn = true
				}
			},
			loadUserProfile() {
				try {
					this.userProfile = initService.getUser()
				} catch (e) {
					console.warn('[个人中心] 加载用户数据失败:', e.message)
				}
			},
			goLogin() {
				uni.navigateTo({
					url: '/pages/login/index'
				})
			},
			goRegister() {
				uni.navigateTo({
					url: '/pages/register/index'
				})
			},
			goWallet() {
				uni.navigateTo({
					url: '/pages/wallet/index'
				})
			},
			goBankCards() {
				uni.navigateTo({
					url: '/pages/bank-cards/index'
				})
			},
			goOrders() {
				uni.navigateTo({
					url: '/pages/orders/index'
				})
			},
			goCoupons() {
				uni.navigateTo({
					url: '/pages/coupons/index'
				})
			},
			goAddress() {
				uni.navigateTo({
					url: '/pages/address/index'
				})
			},
			goAIService() {
				uni.navigateTo({
					url: '/pages/ai-service/index'
				})
			},
			goCustomerService() {
				uni.navigateTo({
					url: '/pages/customer-service/index'
				})
			},
			openEditModal() {
				const user = initService.getUser()
				this.editForm = {
					nickname: user.nickname || '',
					phone: user.phone || '',
					school: user.school || '',
					studentId: user.studentId || ''
				}
				this.showEditModal = true
			},
			closeEditModal() {
				this.showEditModal = false
			},
			saveEditModal() {
				if (!this.editForm.nickname.trim()) {
					uni.showToast({ title: '请输入昵称', icon: 'none' })
					return
				}
				if (!this.editForm.school.trim()) {
					uni.showToast({ title: '请输入学校', icon: 'none' })
					return
				}
				const school = this.editForm.school.trim()
				const updated = initService.updateUser({
					nickname: this.editForm.nickname.trim(),
					phone: this.editForm.phone.trim(),
					school: school,
					studentId: this.editForm.studentId.trim()
				})
				if (updated) {
					this.userProfile = updated
					try {
						uni.setStorageSync('campus_custom_school', school)
						const savedSchools = uni.getStorageSync('campus_custom_schools') || []
						if (!savedSchools.includes(school)) {
							savedSchools.unshift(school)
							uni.setStorageSync('campus_custom_schools', savedSchools)
						}
					} catch (e) {}
					this.showEditModal = false
					uni.showToast({ title: '保存成功', icon: 'success' })
				} else {
					uni.showToast({ title: '保存失败', icon: 'none' })
				}
			},
			goVerify() {
				uni.navigateTo({
					url: '/pages/verify/index'
				})
			},
			resetData() {
				uni.showModal({
					title: '重置数据',
					content: '确定要重置所有数据吗？这将清除所有订单、钱包、骑手数据并恢复到初始状态。',
					confirmColor: '#EF4444',
					success: (res) => {
						if (res.confirm) {
							const result = initService.resetAll()
							if (result.errCode === 0) {
								initService.init()
								this.loadUserProfile()
								uni.showToast({
									title: '数据已重置',
									icon: 'success'
								})
							} else {
								uni.showToast({
									title: result.errMsg || '重置失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			doLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							uni.removeStorageSync('campus_user_logged_in')
							uni.removeStorageSync('campus_user_name')
							uni.removeStorageSync('campus_user_phone')
							this.isLoggedIn = false
							uni.showToast({
								title: '已退出登录',
								icon: 'none'
							})
						}
					}
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

	.logged-out-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 48rpx;
		background-color: #FFFFFF;
		padding-bottom: 200rpx;
	}

	.lock-icon-wrap {
		width: 160rpx;
		height: 160rpx;
		background: #FFF7ED;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 48rpx;
		position: relative;
	}

	.lock-icon {
		position: relative;
		width: 80rpx;
		height: 96rpx;
		margin-top: 16rpx;
	}

	.lock-body {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 72rpx;
		height: 56rpx;
		background: #F59E0B;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
	}

	.lock-ring {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 52rpx;
		height: 40rpx;
		border: 8rpx solid #F59E0B;
		border-bottom: none;
		border-radius: 26rpx 26rpx 0 0;
	}

	.lock-keyhole {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -60%);
		width: 12rpx;
		height: 12rpx;
		background: #FFFFFF;
		border-radius: 50%;
	}

	.key-icon {
		position: absolute;
		top: 28rpx;
		right: 24rpx;
		transform: rotate(35deg);
	}

	.key-head {
		width: 32rpx;
		height: 32rpx;
		border: 5rpx solid #A78BFA;
		border-radius: 50%;
		background: #FFF7ED;
		position: absolute;
		left: -12rpx;
		top: -10rpx;
	}

	.key-shaft {
		width: 48rpx;
		height: 6rpx;
		background: #A78BFA;
		border-radius: 3rpx;
		position: absolute;
		left: 12rpx;
		top: 14rpx;
	}

	.key-bit {
		width: 8rpx;
		height: 12rpx;
		background: #A78BFA;
		position: absolute;
		border-radius: 0 0 4rpx 4rpx;

		&.bit1 {
			right: 8rpx;
			top: 20rpx;
		}

		&.bit2 {
			right: 20rpx;
			top: 20rpx;
		}
	}

	.logout-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #1F2937;
		margin-bottom: 16rpx;
		letter-spacing: 2rpx;
	}

	.logout-subtitle {
		font-size: 28rpx;
		color: #9CA3AF;
		margin-bottom: 80rpx;
	}

	.login-btn {
		width: 100%;
		max-width: 480rpx;
		background: #4A90D9;
		padding: 32rpx 0;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s;

		&:active {
			transform: scale(0.95);
		}
	}

	.login-btn-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #FFFFFF;
	}

	.register-link {
		display: flex;
		align-items: center;
		margin-top: 64rpx;
	}

	.register-text {
		font-size: 28rpx;
		color: #9CA3AF;
	}

	.register-link-text {
		font-size: 28rpx;
		font-weight: 500;
		color: #4A90D9;
		margin-left: 8rpx;
	}

	.logged-in-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.header {
		background-color: #4A90D9;
		padding: 80rpx 28rpx 48rpx;
		border-radius: 0 0 64rpx 64rpx;
		flex-shrink: 0;
	}

	.user-row {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
		overflow: hidden;
	}

	.avatar-inner {
		width: 56rpx;
		height: 56rpx;
		border: 4rpx solid #FFFFFF;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: -28rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 88rpx;
			height: 44rpx;
			border: 4rpx solid #FFFFFF;
			border-top: none;
			border-radius: 44rpx 44rpx 0 0;
		}
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
	}

	.user-name {
		font-size: 36rpx;
		font-weight: 700;
		color: #FFFFFF;
	}

	.verified-badge {
		margin-left: 16rpx;
		background: rgba(255, 255, 255, 0.2);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		padding: 4rpx 16rpx;
		border-radius: 24rpx;
	}

	.verified-text {
		font-size: 20rpx;
		color: #FFFFFF;
	}

	.user-id {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.edit-profile-btn {
		background: rgba(255, 255, 255, 0.25);
		padding: 12rpx 24rpx;
		border-radius: 24rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.4);
	}

	.edit-btn-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: 500;
	}

	.setting-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-setting {
		width: 44rpx;
		height: 44rpx;
		border: 4rpx solid #FFFFFF;
		border-radius: 50%;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 16rpx;
			height: 16rpx;
			background: #FFFFFF;
			border-radius: 50%;
		}
	}

	.data-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 32rpx 28rpx;
		display: flex;
		justify-content: space-around;
		margin: -56rpx 28rpx 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		position: relative;
		z-index: 2;
	}

	.data-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.data-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.data-label {
		font-size: 22rpx;
		color: #6B7280;
	}

	.data-divider {
		width: 2rpx;
		background: #F3F4F6;
		margin-top: 16rpx;
	}

	.menu-list {
		flex: 1;
		padding: 0 28rpx;
	}

	.menu-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 28rpx;
		border-bottom: 2rpx solid #F9FAFB;
		transition: background 0.2s;

		&:active {
			background: #F9FAFB;
		}

		&.last {
			border-bottom: none;
		}
	}

	.menu-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;

		&.blue { background: #EFF6FF; }
		&.purple { background: #FAF5FF; }
		&.pink { background: #FDF2F8; }
		&.orange { background: #FFF7ED; }
		&.green { background: #F0FDF4; }
		&.blue-dark { background: #EFF6FF; }
		&.red { background: #FEF2F2; }
	}

	.icon-wallet {
		width: 32rpx;
		height: 24rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 4rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			right: 2rpx;
			top: 50%;
			transform: translateY(-50%);
			width: 6rpx;
			height: 6rpx;
			background: #4A90D9;
			border-radius: 50%;
		}
	}

	.icon-orders {
		width: 28rpx;
		height: 32rpx;
		border: 3rpx solid #A78BFA;
		border-radius: 4rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			left: 4rpx;
			right: 4rpx;
			height: 2rpx;
			background: #A78BFA;
			border-radius: 1rpx;
		}

		&::before { top: 8rpx; }
		&::after { bottom: 8rpx; }
	}

	.icon-ticket {
		width: 32rpx;
		height: 20rpx;
		border: 3rpx solid #EC4899;
		border-radius: 4rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			width: 4rpx;
			height: 8rpx;
			background: #FDF2F8;
			border-radius: 2rpx;
		}

		&::before { left: 6rpx; }
		&::after { right: 6rpx; }
	}

	.icon-location {
		width: 24rpx;
		height: 32rpx;
		border: 3rpx solid #F97316;
		border-radius: 12rpx 12rpx 12rpx 0;
		transform: rotate(-45deg);
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 6rpx;
			left: 6rpx;
			width: 8rpx;
			height: 8rpx;
			background: #F97316;
			border-radius: 50%;
		}
	}

	.icon-service {
		width: 32rpx;
		height: 32rpx;
		border: 3rpx solid #22C55E;
		border-radius: 50%;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 12rpx;
			height: 12rpx;
			border: 3rpx solid #22C55E;
			border-radius: 50%;
		}
	}

	.icon-shield {
		width: 28rpx;
		height: 34rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 6rpx 6rpx 4rpx 4rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -60%);
			width: 12rpx;
			height: 6rpx;
			border-left: 3rpx solid #4A90D9;
			border-bottom: 3rpx solid #4A90D9;
			transform: translate(-50%, -60%) rotate(-45deg);
		}
	}

	.menu-text {
		flex: 1;
		font-size: 28rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.menu-value {
		font-size: 24rpx;
		font-weight: 500;
		color: #9CA3AF;
	}

	.menu-arrow {
		width: 14rpx;
		height: 14rpx;
		border-right: 3rpx solid #E5E7EB;
		border-bottom: 3rpx solid #E5E7EB;
		transform: rotate(-45deg);
		margin-left: 16rpx;
	}

	.logout-btn {
		margin-top: 24rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 32rpx;
		text-align: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: background 0.2s;

		&:active {
			background: #FEF2F2;
		}
	}

	.logout-text {
		font-size: 28rpx;
		font-weight: 500;
		color: #EF4444;
	}

	.list-bottom-space {
		height: 40rpx;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		width: 600rpx;
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx;
		border-bottom: 1rpx solid #F3F4F6;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.close-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-icon {
		width: 28rpx;
		height: 28rpx;
		position: relative;
	}

	.close-icon::before,
	.close-icon::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 3rpx;
		background: #9CA3AF;
	}

	.close-icon::before {
		transform: translateY(-50%) rotate(45deg);
	}

	.close-icon::after {
		transform: translateY(-50%) rotate(-45deg);
	}

	.modal-body {
		padding: 32rpx;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.form-label {
		font-size: 26rpx;
		color: #6B7280;
	}

	.form-input {
		height: 80rpx;
		background: #F9FAFB;
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
		color: #1F2937;
	}

	.modal-footer {
		display: flex;
		gap: 24rpx;
		padding: 0 32rpx 32rpx;
	}

	.modal-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-btn.cancel {
		background: #F3F4F6;
	}

	.modal-btn.cancel .btn-text {
		color: #6B7280;
	}

	.modal-btn.confirm {
		background: #4A90D9;
	}

	.modal-btn.confirm .btn-text {
		color: #fff;
	}

	.btn-text {
		font-size: 30rpx;
		font-weight: 500;
	}
</style>