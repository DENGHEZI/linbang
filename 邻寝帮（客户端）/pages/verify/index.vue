<template>
	<view class="page-container">
		<view class="header">
			<view class="header-bg"></view>
			<view class="header-inner">
				<view class="back-btn" @click="goBack">
					<view class="icon-back"></view>
				</view>
				<text class="header-title">实名认证</text>
				<view class="header-placeholder"></view>
			</view>
		</view>

		<scroll-view scroll-y class="content" :show-scrollbar="false" v-if="!submitted">
			<view class="status-banner pending">
				<view class="status-icon">
					<view class="icon-shield"></view>
				</view>
				<view class="status-info">
					<text class="status-title">未完成实名认证</text>
					<text class="status-desc">完成认证后方可享受全部服务权益</text>
				</view>
			</view>

			<view class="card">
				<view class="card-header">
					<view class="card-icon"></view>
					<text class="card-title">个人信息</text>
				</view>

				<view class="form-item">
					<text class="form-label">姓名</text>
					<view class="input-wrap">
						<input class="form-input" v-model="form.name" placeholder="请输入真实姓名" placeholder-class="input-placeholder" />
						<view class="input-icon icon-user"></view>
					</view>
				</view>

				<view class="form-item">
					<text class="form-label">学号</text>
					<view class="input-wrap">
						<input class="form-input" v-model="form.studentId" placeholder="请输入学号" placeholder-class="input-placeholder" type="number" />
						<view class="input-icon icon-id"></view>
					</view>
				</view>

				<view class="form-item" @click="openSchoolPicker">
					<text class="form-label">学校</text>
					<view class="selector" :class="{ active: form.school }">
						<text class="selector-text">{{ form.school || '请选择所属学校' }}</text>
						<view class="icon-arrow-right"></view>
					</view>
				</view>

				<view class="form-item">
					<text class="form-label">身份证号</text>
					<view class="input-wrap">
						<input class="form-input" v-model="form.idNumber" placeholder="请输入18位身份证号" placeholder-class="input-placeholder" maxlength="18" />
						<view class="input-icon icon-id-card"></view>
					</view>
				</view>
			</view>

			<view class="card">
				<view class="card-header">
					<view class="card-icon card-icon-upload"></view>
					<text class="card-title">上传证件照</text>
					<view class="card-tip">
						<text class="card-tip-text">清晰、无反光</text>
					</view>
				</view>

				<view class="upload-tips">
					<view class="tip-item">
						<view class="tip-dot"></view>
						<text class="tip-text">照片需清晰可辨</text>
					</view>
					<view class="tip-item">
						<view class="tip-dot"></view>
						<text class="tip-text">四角完整无裁切</text>
					</view>
					<view class="tip-item">
						<view class="tip-dot"></view>
						<text class="tip-text">支持拍照和相册</text>
					</view>
				</view>

				<view class="upload-grid">
					<view class="upload-item" @click="chooseImage('front')">
						<image v-if="photos.front" class="upload-image" :src="photos.front" mode="aspectFill" />
						<view v-else class="upload-placeholder">
							<view class="upload-bg-icon">
								<view class="id-card-sim">
									<view class="id-chip"></view>
									<view class="id-line id-line-1"></view>
									<view class="id-line id-line-2"></view>
									<view class="id-line id-line-3"></view>
								</view>
							</view>
							<text class="upload-hint">身份证正面</text>
							<text class="upload-sub">人像面</text>
						</view>
						<view class="upload-action" v-if="photos.front">
							<text class="upload-action-text">重新上传</text>
						</view>
					</view>
					<view class="upload-item" @click="chooseImage('back')">
						<image v-if="photos.back" class="upload-image" :src="photos.back" mode="aspectFill" />
						<view v-else class="upload-placeholder">
							<view class="upload-bg-icon">
								<view class="id-card-sim id-card-sim-back">
									<view class="id emblem"></view>
									<view class="id-line id-line-1"></view>
									<view class="id-line id-line-2"></view>
									<view class="id-line id-line-3"></view>
								</view>
							</view>
							<text class="upload-hint">身份证背面</text>
							<text class="upload-sub">国徽面</text>
						</view>
						<view class="upload-action" v-if="photos.back">
							<text class="upload-action-text">重新上传</text>
						</view>
					</view>
				</view>

				<view class="source-tabs">
					<view class="source-tab" @click="chooseImageFromSource('front', 'camera')">
						<view class="source-icon source-camera"></view>
						<text class="source-text">拍照</text>
					</view>
					<view class="source-tab" @click="chooseImageFromSource('front', 'album')">
						<view class="source-icon source-album"></view>
						<text class="source-text">相册</text>
					</view>
				</view>
			</view>

			<view class="agreement-row">
				<view class="checkbox" :class="{ checked: agreed }" @click="toggleAgree">
					<view class="checkbox-inner" v-if="agreed"></view>
				</view>
				<text class="agreement-text">
					我确认所提交的信息真实有效，同意
					<text class="agreement-link" @click.stop="showToast('认证协议')">《实名认证协议》</text>
				</text>
			</view>

			<view class="submit-btn" @click="handleSubmit">
				<text class="submit-text">提交审核</text>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<scroll-view scroll-y class="content" :show-scrollbar="false" v-else>
			<view class="review-status">
				<view class="status-animation">
					<view class="check-circle">
						<view class="check-icon"></view>
					</view>
					<view class="check-pulse"></view>
				</view>
				<text class="review-title">资料已提交</text>
				<text class="review-desc">预计 1-2 个工作日完成审核</text>
			</view>

			<view class="review-card">
				<view class="review-card-header">
					<text class="review-card-title">审核进度</text>
					<view class="review-badge">
						<text class="review-badge-text">审核中</text>
					</view>
				</view>

				<view class="timeline">
					<view class="timeline-item done">
						<view class="timeline-dot"></view>
						<view class="timeline-info">
							<text class="timeline-title">提交成功</text>
							<text class="timeline-time">{{ submitTime }}</text>
						</view>
					</view>
					<view class="timeline-item active">
						<view class="timeline-dot"></view>
						<view class="timeline-info">
							<text class="timeline-title">信息审核中</text>
							<text class="timeline-time">预计 1-2 个工作日</text>
						</view>
					</view>
					<view class="timeline-item">
						<view class="timeline-dot"></view>
						<view class="timeline-info">
							<text class="timeline-title">审核完成</text>
							<text class="timeline-time">等待中</text>
						</view>
					</view>
				</view>

				<view class="review-info">
					<view class="info-row">
						<text class="info-label">认证姓名</text>
						<text class="info-value">{{ form.name }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">学号</text>
						<text class="info-value">{{ form.studentId }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">所属学校</text>
						<text class="info-value">{{ form.school }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">身份证号</text>
						<text class="info-value id-mask">{{ maskedIdNumber }}</text>
					</view>
				</view>
			</view>

			<view class="tips-card">
				<view class="tips-header">
					<view class="tips-icon"></view>
					<text class="tips-title">温馨提示</text>
				</view>
				<view class="tips-list">
					<text class="tips-item">• 审核结果将通过站内消息通知您</text>
					<text class="tips-item">• 审核期间请勿修改认证信息</text>
					<text class="tips-item">• 如有疑问请联系客服咨询</text>
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<view class="modal-mask" v-if="schoolModalVisible" @click="closeSchoolModal">
			<view class="modal-container" @click.stop>
				<view class="modal-header">
					<text class="modal-title">选择学校</text>
					<view class="modal-close" @click="closeSchoolModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-content">
					<view class="custom-input-section">
						<text class="section-label">自定义学校</text>
						<view class="input-row">
							<input
								class="school-input"
								v-model="customSchoolInput"
								placeholder="输入您的学校名称"
								@confirm="confirmCustomSchool"
							/>
							<view class="confirm-btn" @click="confirmCustomSchool">
								<text class="confirm-btn-text">确定</text>
							</view>
						</view>
					</view>
					<view class="divider">
						<view class="divider-line"></view>
						<text class="divider-text">或选择常用学校</text>
						<view class="divider-line"></view>
					</view>
					<view class="school-list">
						<view
							class="school-item"
							v-for="(school, idx) in schoolList"
							:key="idx"
							:class="{ active: form.school === school }"
							@click="selectSchool(school)"
						>
							<text class="school-name">{{ school }}</text>
							<view class="school-check" v-if="form.school === school">
								<text class="check-icon">✓</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { initService } from '@/services/init.js'
	
	export default {
		data() {
			const defaultSchools = [
				'北京大学',
				'清华大学',
				'复旦大学',
				'浙江大学',
				'武汉大学',
				'中山大学',
				'南京大学',
				'华中科技大学',
				'四川大学',
				'上海交通大学'
			]
			
			const savedSchools = uni.getStorageSync('campus_custom_schools') || []
			const schoolList = [...new Set([...savedSchools, ...defaultSchools])]
			
			const user = initService.getUser()
			
			return {
				form: {
					name: user.nickname || '',
					studentId: user.studentId || '',
					school: user.school || '',
					idNumber: ''
				},
				photos: {
					front: '',
					back: ''
				},
				schoolList: schoolList,
				schoolModalVisible: false,
				customSchoolInput: '',
				agreed: true,
				submitted: false,
				submitTime: ''
			}
		},
		computed: {
			maskedIdNumber() {
				const id = this.form.idNumber
				if (!id || id.length < 10) return id
				return id.substring(0, 4) + '**********' + id.substring(id.length - 4)
			}
		},
		methods: {
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/profile/index'
						})
					}
				})
			},
			openSchoolPicker() {
				this.schoolModalVisible = true
				this.customSchoolInput = ''
			},
			closeSchoolModal() {
				this.schoolModalVisible = false
				this.customSchoolInput = ''
			},
			selectSchool(school) {
				this.form.school = school
				this.closeSchoolModal()
				uni.showToast({ title: '已选择：' + school, icon: 'success' })
			},
			confirmCustomSchool() {
				if (!this.customSchoolInput.trim()) {
					uni.showToast({ title: '请输入学校名称', icon: 'none' })
					return
				}
				const schoolName = this.customSchoolInput.trim()
				this.form.school = schoolName
				
				if (!this.schoolList.includes(schoolName)) {
					this.schoolList.unshift(schoolName)
					const defaultSchools = ['北京大学', '清华大学', '复旦大学', '浙江大学', '武汉大学', '中山大学', '南京大学', '华中科技大学', '四川大学', '上海交通大学']
					const savedSchools = this.schoolList.filter(school => !defaultSchools.includes(school))
					uni.setStorageSync('campus_custom_schools', savedSchools)
				}
				
				this.closeSchoolModal()
				uni.showToast({ title: '已设置：' + schoolName, icon: 'success' })
			},
			chooseImage(type) {
				uni.showActionSheet({
					itemList: ['拍照', '从相册选择'],
					success: (res) => {
						const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
						this.doChooseImage(type, sourceType)
					}
				})
			},
			chooseImageFromSource(type, source) {
				this.doChooseImage(type, [source])
			},
			doChooseImage(type, sourceType) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: sourceType,
					success: (res) => {
						const tempPath = res.tempFilePaths[0]
						this.photos[type] = tempPath
					},
					fail: () => {
						uni.showToast({ title: '已取消', icon: 'none' })
					}
				})
			},
			toggleAgree() {
				this.agreed = !this.agreed
			},
			validateIdCard(id) {
				if (!/^\d{17}[\dXx]$/.test(id)) {
					return false
				}
				return true
			},
			handleSubmit() {
				if (!this.agreed) {
					uni.showToast({ title: '请先同意认证协议', icon: 'none' })
					return
				}
				if (!this.form.name || this.form.name.trim().length < 2) {
					uni.showToast({ title: '请输入真实姓名', icon: 'none' })
					return
				}
				if (!this.form.studentId) {
					uni.showToast({ title: '请输入学号', icon: 'none' })
					return
				}
				if (!this.form.school) {
					uni.showToast({ title: '请选择学校', icon: 'none' })
					return
				}
				if (!this.form.idNumber) {
					uni.showToast({ title: '请输入身份证号', icon: 'none' })
					return
				}
				if (!this.validateIdCard(this.form.idNumber)) {
					uni.showToast({ title: '身份证号格式不正确', icon: 'none' })
					return
				}
				if (!this.photos.front) {
					uni.showToast({ title: '请上传身份证正面', icon: 'none' })
					return
				}
				if (!this.photos.back) {
					uni.showToast({ title: '请上传身份证反面', icon: 'none' })
					return
				}

				uni.showLoading({ title: '提交中...' })
				setTimeout(() => {
					uni.hideLoading()
					const now = new Date()
					const pad = (n) => n.toString().padStart(2, '0')
					this.submitTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
					this.submitted = true
				}, 1000)
			},
			showToast(msg) {
				uni.showToast({
					title: msg,
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
		position: relative;
		padding-top: 88rpx;
		flex-shrink: 0;
	}

	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 200rpx;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
	}

	.header-inner {
		position: relative;
		z-index: 1;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 28rpx;
	}

	.back-btn {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-back {
		width: 20rpx;
		height: 20rpx;
		border-left: 4rpx solid #FFFFFF;
		border-bottom: 4rpx solid #FFFFFF;
		transform: rotate(45deg);
		margin-left: 8rpx;
	}

	.header-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #FFFFFF;
	}

	.header-placeholder {
		width: 72rpx;
		height: 72rpx;
	}

	.content {
		flex: 1;
		padding: 0 28rpx 28rpx;
		box-sizing: border-box;
		margin-top: -112rpx;
		position: relative;
		z-index: 2;
	}

	.status-banner {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		gap: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 24rpx;

		&.pending {
			background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
		}
	}

	.status-icon {
		width: 88rpx;
		height: 88rpx;
		background: #F59E0B;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 6rpx 16rpx rgba(245, 158, 11, 0.3);
	}

	.icon-shield {
		width: 44rpx;
		height: 44rpx;
		background: #fff;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.status-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.status-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #92400E;
	}

	.status-desc {
		font-size: 24rpx;
		color: #B45309;
	}

	.card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 24rpx;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.card-icon {
		width: 36rpx;
		height: 36rpx;
		background: #4A90D9;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.card-icon-upload {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
		flex: 1;
	}

	.card-tip {
		background: #EFF6FF;
		border-radius: 16rpx;
		padding: 6rpx 16rpx;
	}

	.card-tip-text {
		font-size: 22rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.form-item {
		margin-bottom: 24rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.form-label {
		font-size: 26rpx;
		color: #6B7280;
		margin-bottom: 12rpx;
		display: block;
		font-weight: 500;
	}

	.input-wrap {
		background: #F5F8FA;
		border-radius: 16rpx;
		padding: 24rpx 28rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&:focus-within {
			border-color: #4A90D9;
			background: #fff;
		}
	}

	.input-icon {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0;
		background: #9CA3AF;
	}

	.icon-user {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-id {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 22l4-4h10c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-id-card {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 4H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.11-.9-2-2-2zm0 14H4V8h16v10z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.form-input {
		flex: 1;
		font-size: 28rpx;
		color: #1F2937;
	}

	.input-placeholder {
		color: #9CA3AF;
		font-size: 28rpx;
	}

	.selector {
		background: #F5F8FA;
		border-radius: 16rpx;
		padding: 24rpx 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: all 0.2s;

		&.active {
			.selector-text {
				color: #1F2937;
			}
		}
	}

	.selector-text {
		font-size: 28rpx;
		color: #9CA3AF;
	}

	.icon-arrow-right {
		width: 14rpx;
		height: 14rpx;
		border-right: 4rpx solid #9CA3AF;
		border-top: 4rpx solid #9CA3AF;
		transform: rotate(45deg);
	}

	.upload-tips {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 24rpx;
		padding: 20rpx;
		background: #F0F9FF;
		border-radius: 16rpx;
	}

	.tip-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.tip-dot {
		width: 8rpx;
		height: 8rpx;
		background: #4A90D9;
		border-radius: 50%;
	}

	.tip-text {
		font-size: 22rpx;
		color: #4B5563;
	}

	.upload-grid {
		display: flex;
		gap: 24rpx;
	}

	.upload-item {
		flex: 1;
		aspect-ratio: 16 / 10;
		background: #F5F8FA;
		border-radius: 20rpx;
		border: 4rpx dashed #D1D5DB;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;
		transition: all 0.2s;

		&:active {
			border-color: #4A90D9;
		}
	}

	.upload-image {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	.upload-bg-icon {
		width: 100rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.id-card-sim {
		width: 90rpx;
		height: 56rpx;
		background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
		border-radius: 8rpx;
		position: relative;
		padding: 8rpx;

		&.id-card-sim-back {
			background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
		}
	}

	.id-chip {
		width: 20rpx;
		height: 20rpx;
		background: #F59E0B;
		border-radius: 4rpx;
		margin-bottom: 6rpx;
	}

	.id-line {
		height: 4rpx;
		background: #9CA3AF;
		border-radius: 2rpx;
		margin-bottom: 4rpx;
	}

	.id-line-1 {
		width: 60%;
	}

	.id-line-2 {
		width: 80%;
	}

	.id-line-3 {
		width: 40%;
	}

	.idemblem {
		width: 16rpx;
		height: 16rpx;
		background: #EF4444;
		border-radius: 50%;
		margin: 0 auto 6rpx;
	}

	.upload-hint {
		font-size: 24rpx;
		color: #4B5563;
		font-weight: 500;
	}

	.upload-sub {
		font-size: 20rpx;
		color: #9CA3AF;
	}

	.upload-action {
		position: absolute;
		bottom: 12rpx;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.6);
		border-radius: 20rpx;
		padding: 6rpx 20rpx;
	}

	.upload-action-text {
		font-size: 22rpx;
		color: #fff;
	}

	.source-tabs {
		display: flex;
		gap: 20rpx;
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 2rpx solid #F3F4F6;
	}

	.source-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		padding: 20rpx;
		background: #F5F8FA;
		border-radius: 16rpx;
		transition: all 0.2s;

		&:active {
			background: #EFF6FF;
			transform: scale(0.96);
		}
	}

	.source-icon {
		width: 32rpx;
		height: 32rpx;
		background: #4A90D9;
	}

	.source-camera {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.source-album {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.source-text {
		font-size: 26rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.agreement-row {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}

	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #D1D5DB;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s;

		&.checked {
			background: #4A90D9;
			border-color: #4A90D9;
		}
	}

	.checkbox-inner {
		width: 14rpx;
		height: 8rpx;
		border-left: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.agreement-text {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.6;
	}

	.agreement-link {
		color: #4A90D9;
		font-weight: 500;
	}

	.submit-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		padding: 32rpx;
		text-align: center;
		box-shadow: 0 10rpx 28rpx rgba(74, 144, 217, 0.3);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}
	}

	.submit-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #FFFFFF;
		letter-spacing: 4rpx;
	}

	.bottom-space {
		height: 60rpx;
	}

	.review-status {
		background: #fff;
		border-radius: 24rpx;
		padding: 48rpx 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 24rpx;
	}

	.status-animation {
		position: relative;
		width: 120rpx;
		height: 120rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
	}

	.check-circle {
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #10B981 0%, #059669 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.3);
		z-index: 1;
	}

	.check-icon {
		width: 40rpx;
		height: 20rpx;
		border-left: 6rpx solid #fff;
		border-bottom: 6rpx solid #fff;
		transform: rotate(-45deg) translate(4rpx, -4rpx);
	}

	.check-pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 4rpx solid #10B981;
		opacity: 0.6;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.6;
		}
		100% {
			transform: translate(-50%, -50%) scale(1.8);
			opacity: 0;
		}
	}

	.review-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.review-desc {
		font-size: 26rpx;
		color: #6B7280;
		margin-top: 12rpx;
	}

	.review-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 24rpx;
	}

	.review-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 28rpx;
	}

	.review-card-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.review-badge {
		background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
		border-radius: 20rpx;
		padding: 8rpx 20rpx;
	}

	.review-badge-text {
		font-size: 22rpx;
		font-weight: 700;
		color: #92400E;
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
		padding-left: 12rpx;
		margin-bottom: 28rpx;
	}

	.timeline-item {
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
		position: relative;

		&.done {
			.timeline-dot {
				background: #10B981;
				border-color: #10B981;
			}

			.timeline-title {
				color: #10B981;
				font-weight: 700;
			}
		}

		&.active {
			.timeline-dot {
				background: #4A90D9;
				border-color: #4A90D9;
				box-shadow: 0 0 0 8rpx rgba(74, 144, 217, 0.2);
			}

			.timeline-title {
				color: #4A90D9;
				font-weight: 700;
			}
		}

		&::before {
			content: '';
			position: absolute;
			left: 15rpx;
			top: 40rpx;
			bottom: -32rpx;
			width: 4rpx;
			background: #E5E7EB;
		}

		&:last-child::before {
			display: none;
		}
	}

	.timeline-dot {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background: #fff;
		border: 4rpx solid #D1D5DB;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
	}

	.timeline-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		padding-top: 4rpx;
	}

	.timeline-title {
		font-size: 28rpx;
		color: #9CA3AF;
	}

	.timeline-time {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.review-info {
		background: #F5F8FA;
		border-radius: 16rpx;
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: 26rpx;
		color: #6B7280;
	}

	.info-value {
		font-size: 26rpx;
		color: #1F2937;
		font-weight: 500;

		&.id-mask {
			font-family: monospace;
		}
	}

	.tips-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.tips-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 20rpx;
	}

	.tips-icon {
		width: 28rpx;
		height: 28rpx;
		background: #F59E0B;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.tips-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.tips-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.tips-item {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.6;
	}

	.modal-mask {
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

	.modal-container {
		width: 640rpx;
		background: #fff;
		border-radius: 32rpx;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 1rpx solid #F3F4F6;
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
		background: #F3F4F6;
		border-radius: 50%;
	}

	.close-icon {
		font-size: 36rpx;
		color: #6B7280;
		line-height: 1;
	}

	.modal-content {
		padding: 32rpx;
		max-height: 600rpx;
		overflow-y: auto;
	}

	.custom-input-section {
		margin-bottom: 24rpx;
	}

	.section-label {
		font-size: 26rpx;
		color: #6B7280;
		margin-bottom: 16rpx;
		display: block;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.school-input {
		flex: 1;
		height: 80rpx;
		background: #F5F8FA;
		border-radius: 16rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
		color: #1F2937;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 16rpx;
		padding: 0 32rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.confirm-btn-text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 600;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.divider-line {
		flex: 1;
		height: 1rpx;
		background: #E5E7EB;
	}

	.divider-text {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.school-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.school-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx;
		background: #F5F8FA;
		border-radius: 16rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&.active {
			background: #EFF6FF;
			border-color: #4A90D9;
		}
	}

	.school-name {
		font-size: 28rpx;
		color: #1F2937;
	}

	.school-check {
		width: 40rpx;
		height: 40rpx;
		background: #4A90D9;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		font-size: 24rpx;
		color: #fff;
		font-weight: 700;
	}
</style>