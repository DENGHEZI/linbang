<template>
	<view class="page-container">
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="nav-title">上传订单凭证</text>
			<view class="nav-right" @click="showTip">
				<view class="icon-info"></view>
			</view>
		</view>

		<view class="order-info" v-if="orderId">
			<view class="info-badge">
				<text class="info-badge-text">订单 #{{ orderId }}</text>
			</view>
		</view>

		<view class="upload-section">
			<view class="upload-area" @click="chooseImage">
				<view class="upload-icon">
					<view class="icon-camera"></view>
				</view>
				<text class="upload-title">上传取货凭证</text>
				<text class="upload-desc">请拍摄或扫描快递单号/取货凭证</text>
				<view class="upload-btn" @click.stop="chooseImage">
					<view class="icon-upload"></view>
					<text class="upload-btn-text">选择图片</text>
				</view>
			</view>

			<view class="upload-tips">
				<view class="tip-item">
					<view class="tip-icon clear"></view>
					<text class="tip-text">图片清晰可辨</text>
				</view>
				<view class="tip-item">
					<view class="tip-icon bright"></view>
					<text class="tip-text">光线充足</text>
				</view>
				<view class="tip-item">
					<view class="tip-icon complete"></view>
					<text class="tip-text">信息完整</text>
				</view>
			</view>
		</view>

		<view class="preview-section" v-if="imageList.length > 0">
			<view class="section-header">
				<text class="section-title">已上传图片 ({{ imageList.length }}/{{ maxImages }})</text>
				<view class="clear-btn" @click="clearImages">
					<view class="icon-trash"></view>
					<text class="clear-text">清空</text>
				</view>
			</view>

			<view class="image-grid">
				<view class="image-item" v-for="(img, index) in imageList" :key="index">
					<view class="image-preview" @click="previewImage(index)">
						<image class="image-thumb" :src="img" mode="aspectFill" />
						<view class="image-overlay">
							<view class="icon-view"></view>
						</view>
					</view>
					<view class="image-delete" @click="removeImage(index)">
						<view class="icon-minus"></view>
					</view>
					<view class="image-badge">
						<text class="badge-text">{{ index + 1 }}</text>
					</view>
				</view>

				<view class="image-item add-more" v-if="imageList.length < maxImages" @click="chooseImage">
					<view class="add-icon">
						<view class="icon-plus"></view>
					</view>
					<text class="add-text">添加图片</text>
				</view>
			</view>

			<view class="image-actions">
				<view class="action-btn secondary" @click="retake">
					<view class="icon-refresh"></view>
					<text class="action-btn-text">重新拍摄</text>
				</view>
				<view class="action-btn primary" @click="confirmUpload">
					<view class="icon-check"></view>
					<text class="action-btn-text">确认上传</text>
				</view>
			</view>
		</view>

		<view class="scan-option-section" v-if="imageList.length === 0">
			<view class="divider-row">
				<view class="divider-line"></view>
				<text class="divider-text">或选择以下方式</text>
				<view class="divider-line"></view>
			</view>

			<view class="option-list">
				<view class="option-item" @click="takePhoto">
					<view class="option-icon camera">
						<view class="icon-camera-2"></view>
					</view>
					<text class="option-title">拍照上传</text>
					<text class="option-desc">使用相机拍摄凭证</text>
				</view>

				<view class="option-item" @click="scanQRCode">
					<view class="option-icon scan">
						<view class="icon-qr-scan"></view>
					</view>
					<text class="option-title">扫码识别</text>
					<text class="option-desc">扫描快递单号条形码</text>
				</view>

				<view class="option-item" @click="chooseFromAlbum">
					<view class="option-icon album">
						<view class="icon-image"></view>
					</view>
					<text class="option-title">相册选择</text>
					<text class="option-desc">从手机相册选择</text>
				</view>
			</view>
		</view>

		<view class="result-section" v-if="uploadResult">
			<view class="result-card" :class="{ success: uploadResult.success }">
				<view class="result-icon-wrap">
					<view class="result-icon" :class="uploadResult.success ? 'success' : 'fail'">
						<view class="icon-result" v-if="uploadResult.success"></view>
						<view class="icon-fail" v-else></view>
					</view>
				</view>
				<text class="result-title">{{ uploadResult.title }}</text>
				<text class="result-desc">{{ uploadResult.desc }}</text>
				
				<view class="result-preview" v-if="uploadResult.success && imageList.length > 0">
					<text class="preview-label">已上传凭证：</text>
					<scroll-view scroll-x class="preview-scroll">
						<image 
							class="preview-thumb" 
							v-for="(img, idx) in imageList" 
							:key="idx"
							:src="img" 
							mode="aspectFill"
							@click="previewImage(idx)"
						/>
					</scroll-view>
				</view>
				
				<view class="cloud-status" v-if="uploadResult.cloudStatus">
					<view class="status-dot" :class="uploadResult.cloudStatus === 'success' ? 'green' : 'orange'"></view>
					<text class="status-text">{{ uploadResult.cloudStatusText }}</text>
				</view>
				
				<view class="result-actions">
					<view class="result-btn" @click="handleResult" v-if="uploadResult.success">
						<text class="result-btn-text">完成并返回</text>
					</view>
					<view class="result-btn retry" @click="retryUpload" v-else>
						<text class="result-btn-text">重新上传</text>
					</view>
				</view>
			</view>
		</view>

		<view class="processing-overlay" v-if="isProcessing">
			<view class="processing-card">
				<view class="processing-icon">
					<view class="spinner"></view>
				</view>
				<text class="processing-text">正在识别中...</text>
				<text class="processing-hint">请稍候</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { orderService } from '@/services/order.js'
	
	export default {
		data() {
			return {
				orderId: '',
				imageList: [],
				maxImages: 6,
				isProcessing: false,
				uploadResult: null,
				uploadProgress: 0,
				uploadStatus: 'idle'
			}
		},
		onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId
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
			showTip() {
				uni.showModal({
					title: '上传说明',
					content: '请上传清晰的取货凭证照片，建议包含：\n1. 快递单号\n2. 包裹外观\n3. 取货时间',
					showCancel: false,
					confirmText: '知道了'
				})
			},
			chooseImage() {
				if (this.imageList.length >= this.maxImages) {
					uni.showToast({
						title: `最多上传${this.maxImages}张图片`,
						icon: 'none'
					})
					return
				}

				uni.chooseImage({
					count: this.maxImages - this.imageList.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.imageList = this.imageList.concat(res.tempFilePaths)
						uni.showToast({
							title: '已选择' + res.tempFilePaths.length + '张图片',
							icon: 'none'
						})
					},
					fail: (err) => {
						console.warn('[扫码] 选择图片失败:', err)
						if (this.imageList.length === 0) {
							uni.showToast({
								title: '请授权相册权限',
								icon: 'none'
							})
						}
					}
				})
			},
			takePhoto() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['camera'],
					success: (res) => {
						this.imageList = this.imageList.concat(res.tempFilePaths)
					},
					fail: (err) => {
						console.warn('[扫码] 拍照失败:', err)
						uni.showToast({
							title: '拍照失败',
							icon: 'none'
						})
					}
				})
			},
			chooseFromAlbum() {
				uni.chooseImage({
					count: this.maxImages - this.imageList.length,
					sizeType: ['compressed'],
					sourceType: ['album'],
					success: (res) => {
						this.imageList = this.imageList.concat(res.tempFilePaths)
					},
					fail: (err) => {
						console.warn('[扫码] 选择图片失败:', err)
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						})
					}
				})
			},
			scanQRCode() {
				uni.scanCode({
					success: (res) => {
						uni.showToast({
							title: '识别成功：' + (res.result || '订单凭证'),
							icon: 'success'
						})
						// 扫码成功后提示用户上传凭证
						uni.showModal({
							title: '扫码成功',
							content: '请继续上传取货凭证照片',
							showCancel: false
						})
					},
					fail: (err) => {
						console.warn('[扫码] 扫码失败:', err)
						uni.showToast({
							title: '扫码失败，请手动上传',
							icon: 'none'
						})
					}
				})
			},
			removeImage(index) {
				this.imageList.splice(index, 1)
			},
			previewImage(index) {
				uni.previewImage({
					current: this.imageList[index],
					urls: this.imageList
				})
			},
			clearImages() {
				uni.showModal({
					title: '提示',
					content: '确定要清空所有图片吗？',
					success: (res) => {
						if (res.confirm) {
							this.imageList = []
						}
					}
				})
			},
			retake() {
				this.imageList = []
				this.uploadResult = null
			},
			async uploadToCloud(tempPaths) {
				if (!tempPaths || tempPaths.length === 0) return []
				
				const uploadedFileIDs = []
				
				for (let i = 0; i < tempPaths.length; i++) {
					const filePath = tempPaths[i]
					
					try {
						if (typeof uniCloud !== 'undefined' && uniCloud.uploadFile) {
							const result = await new Promise((resolve, reject) => {
								setTimeout(() => reject(new Error('上传超时')), 15000)
								uniCloud.uploadFile({
									filePath: filePath,
									cloudPath: `pickup/${Date.now()}_${i}.jpg`,
									success: (res) => resolve(res),
									fail: (err) => reject(err)
								})
							})
							
							if (result && result.fileID) {
								uploadedFileIDs.push(result.fileID)
								console.log('[扫码] 上传成功:', result.fileID)
							} else {
								uploadedFileIDs.push(filePath)
							}
						} else {
							uploadedFileIDs.push(filePath)
						}
					} catch (err) {
						console.warn('[扫码] 上传失败，使用本地路径:', err.message)
						uploadedFileIDs.push(filePath)
					}
					
					uni.showLoading({ 
						title: `上传中 ${uploadedFileIDs.length}/${tempPaths.length}`,
						mask: true 
					})
				}
				
				return uploadedFileIDs
			},
			async confirmUpload() {
				if (this.imageList.length === 0) {
					uni.showToast({
						title: '请先上传图片',
						icon: 'none'
					})
					return
				}

				this.isProcessing = true
				this.uploadProgress = 0
				this.uploadStatus = 'uploading'

				try {
					console.log('[扫码] 开始上传凭证图片，共', this.imageList.length, '张')
					
					const uploadedImages = await this.uploadToCloud(this.imageList)
					
					console.log('[扫码] 凭证上传完成:', uploadedImages.length, '张')
					
					let cloudStatus = 'pending'
					let cloudStatusText = '正在同步到云数据库...'
					
					try {
						const saveResult = await this.savePickupProofToCloud(uploadedImages)
						console.log('[扫码] 云数据库保存结果:', saveResult)
						
						if (saveResult.errCode === 0) {
							cloudStatus = 'success'
							cloudStatusText = '✓ 凭证已同步到云端'
							console.log('[扫码] 凭证已成功保存到云数据库')
						} else {
							cloudStatus = 'failed'
							cloudStatusText = '⚠ 云端保存失败，凭证已保存到本地'
							console.warn('[扫码] 云数据库保存失败:', saveResult.errMsg)
						}
					} catch (cloudErr) {
						cloudStatus = 'failed'
						cloudStatusText = '⚠ 云服务不可用，凭证已保存到本地'
						console.warn('[扫码] 云函数调用失败:', cloudErr.message)
					}
					
					try {
						const records = uni.getStorageSync('pickup_proofs') || {}
						records[this.orderId] = {
							images: uploadedImages,
							status: 'uploaded',
							uploadedAt: Date.now(),
							syncedToCloud: cloudStatus === 'success'
						}
						uni.setStorageSync('pickup_proofs', records)
					} catch (e) {
						console.warn('[扫码] 保存上传记录失败:', e.message)
					}
					
					this.uploadResult = {
						success: true,
						title: '上传成功',
						desc: `已成功上传${uploadedImages.length}张取货凭证`,
						cloudStatus: cloudStatus === 'success' ? 'success' : 'warning',
						cloudStatusText: cloudStatusText
					}
					
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('[扫码] 上传失败:', error)
					this.uploadResult = {
						success: false,
						title: '上传失败',
						desc: '图片上传失败，请检查网络后重试',
						cloudStatus: 'failed',
						cloudStatusText: error.message || '未知错误'
					}
				} finally {
					this.isProcessing = false
					uni.hideLoading()
				}
			},
			
			async savePickupProofToCloud(images) {
				if (!this.orderId || !images || images.length === 0) {
					return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
				}
				
				try {
					if (typeof uniCloud !== 'undefined' && uniCloud.callFunction) {
						const result = await uniCloud.callFunction({
							name: 'orderProxy',
							data: {
								action: 'savePickupProof',
								orderId: this.orderId,
								images: images
							}
						})
						
						if (result && result.result) {
							return result.result
						}
						return { errCode: 'SYSTEM_ERROR', errMsg: '云函数返回数据异常' }
					} else {
						return { errCode: 'NO_CLOUD', errMsg: '云服务未初始化' }
					}
				} catch (err) {
					console.warn('[扫码] savePickupProof 云函数调用失败:', err.message)
					throw err
				}
			},
			async handleResult() {
				this.uploadResult = null
				
				try {
					if (this.orderId) {
						await orderService.updateStatus(this.orderId, 'picking', {
							proofsUploaded: true,
							proofsCount: this.imageList.length
						})
						console.log('[扫码] 订单状态已通过orderService更新为picking')
						
						try {
							const ordersData = uni.getStorageSync('orders_data') || []
							const idx = ordersData.findIndex(o => String(o._id) === String(this.orderId))
							if (idx !== -1) {
								ordersData[idx].status = 'picking'
								ordersData[idx].picking_at = Date.now()
								ordersData[idx].proofsUploaded = true
								ordersData[idx].proofsCount = this.imageList.length
								ordersData[idx].updated_at = Date.now()
								uni.setStorageSync('orders_data', ordersData)
								console.log('[扫码] orders_data已更新')
							}
						} catch (e) {
							console.warn('[扫码] 更新orders_data失败:', e.message)
						}
						
						try {
							const records = uni.getStorageSync('order_status') || {}
							records[this.orderId] = {
								status: 'picking',
								proofsUploaded: true,
								proofsCount: this.imageList.length,
								updatedAt: Date.now()
							}
							uni.setStorageSync('order_status', records)
						} catch (e) {
							console.warn('[扫码] 本地状态保存失败:', e.message)
						}
						
						try {
							const pendingOrders = uni.getStorageSync('rider_pending_orders') || []
							const orderIndex = pendingOrders.findIndex(o => String(o.id) === String(this.orderId))
							if (orderIndex !== -1) {
								pendingOrders[orderIndex].status = 'picking'
								pendingOrders[orderIndex].statusText = '配送中'
								pendingOrders[orderIndex].statusClass = 'delivering'
								pendingOrders[orderIndex].actionText = '去送达'
								uni.setStorageSync('rider_pending_orders', pendingOrders)
								console.log('[扫码] 骑手订单状态已更新为配送中')
							}
						} catch (e) {
							console.warn('[扫码] 更新骑手订单失败:', e.message)
						}

						try {
							uni.setStorageSync('order_events', Date.now())
						} catch (e) {}
					}
				} catch (err) {
					console.warn('[扫码] 订单状态更新失败:', err.message)
				}
				
				uni.showToast({
					title: '凭证已提交',
					icon: 'success'
				})
				
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			},
			retryUpload() {
				this.uploadResult = null
				this.imageList = []
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
		padding-bottom: 48rpx;
	}

	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 88rpx 28rpx 24rpx;
		background: #fff;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.nav-back, .nav-right {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-back {
		width: 24rpx;
		height: 24rpx;
		border-left: 4rpx solid #1F2937;
		border-bottom: 4rpx solid #1F2937;
		transform: rotate(45deg);
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.icon-info {
		width: 32rpx;
		height: 32rpx;
		border: 3rpx solid #9CA3AF;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 4rpx;
			height: 4rpx;
			background: #9CA3AF;
			border-radius: 50%;
			box-shadow: 0 -10rpx 0 #9CA3AF;
		}
	}

	.order-info {
		padding: 20rpx 28rpx;
		background: #EFF6FF;
	}

	.info-badge {
		display: inline-flex;
		background: #fff;
		padding: 10rpx 24rpx;
		border-radius: 20rpx;
		border: 2rpx solid #BFDBFE;
	}

	.info-badge-text {
		font-size: 24rpx;
		font-weight: 600;
		color: #4A90D9;
	}

	.upload-section {
		padding: 28rpx;
	}

	.upload-area {
		background: #fff;
		border-radius: 32rpx;
		padding: 64rpx 48rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
		border: 4rpx dashed #BFDBFE;
		transition: all 0.2s;

		&:active {
			background: #F9FAFB;
		}
	}

	.upload-icon {
		width: 120rpx;
		height: 120rpx;
		background: #EFF6FF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8rpx;
	}

	.icon-camera {
		width: 56rpx;
		height: 44rpx;
		border: 4rpx solid #4A90D9;
		border-radius: 10rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -12rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 28rpx;
			height: 12rpx;
			background: #4A90D9;
			border-radius: 6rpx 6rpx 0 0;
		}

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 20rpx;
			height: 20rpx;
			border: 4rpx solid #4A90D9;
			border-radius: 50%;
		}
	}

	.upload-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.upload-desc {
		font-size: 26rpx;
		color: #9CA3AF;
		text-align: center;
	}

	.upload-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		padding: 20rpx 48rpx;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-top: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.25);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
		}
	}

	.icon-upload {
		width: 24rpx;
		height: 24rpx;
		background: #fff;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.upload-btn-text {
		font-size: 28rpx;
		font-weight: 700;
		color: #fff;
	}

	.upload-tips {
		display: flex;
		justify-content: center;
		gap: 48rpx;
		margin-top: 32rpx;
	}

	.tip-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.tip-icon {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 8rpx;
			height: 4rpx;
			background: #fff;
			border-radius: 2rpx;
		}

		&.clear {
			background: #22C55E;
		}
		&.bright {
			background: #F59E0B;
		}
		&.complete {
			background: #4A90D9;
		}
	}

	.tip-text {
		font-size: 22rpx;
		color: #6B7280;
	}

	.preview-section {
		padding: 0 28rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.clear-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;

		&:active {
			opacity: 0.7;
		}
	}

	.icon-trash {
		width: 24rpx;
		height: 28rpx;
		border: 3rpx solid #EF4444;
		border-radius: 4rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -8rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 20rpx;
			height: 6rpx;
			background: #EF4444;
			border-radius: 3rpx;
		}
	}

	.clear-text {
		font-size: 24rpx;
		color: #EF4444;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;
		margin-bottom: 32rpx;
	}

	.image-item {
		position: relative;
		aspect-ratio: 1;
	}

	.image-preview {
		width: 100%;
		height: 100%;
		border-radius: 16rpx;
		overflow: hidden;
		position: relative;
		background: #F3F4F6;
	}

	.image-thumb {
		width: 100%;
		height: 100%;
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.image-preview:active .image-overlay {
		opacity: 1;
	}

	.icon-view {
		width: 32rpx;
		height: 20rpx;
		border: 3rpx solid #fff;
		border-radius: 20rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 12rpx;
			height: 6rpx;
			background: #fff;
			border-radius: 3rpx;
		}
	}

	.image-delete {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		width: 40rpx;
		height: 40rpx;
		background: #EF4444;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.3);
	}

	.icon-minus {
		width: 16rpx;
		height: 4rpx;
		background: #fff;
		border-radius: 2rpx;
	}

	.image-badge {
		position: absolute;
		bottom: -6rpx;
		left: -6rpx;
		background: #4A90D9;
		padding: 4rpx 12rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(74, 144, 217, 0.3);
	}

	.badge-text {
		font-size: 20rpx;
		font-weight: 700;
		color: #fff;
	}

	.image-item.add-more {
		background: #fff;
		border: 3rpx dashed #BFDBFE;
		border-radius: 16rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		transition: all 0.2s;

		&:active {
			background: #EFF6FF;
		}
	}

	.add-icon {
		width: 64rpx;
		height: 64rpx;
		background: #EFF6FF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-plus {
		width: 28rpx;
		height: 28rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			background: #4A90D9;
			border-radius: 2rpx;
		}
		&::before {
			top: 50%;
			left: 0;
			right: 0;
			height: 4rpx;
			transform: translateY(-50%);
		}
		&::after {
			left: 50%;
			top: 0;
			bottom: 0;
			width: 4rpx;
			transform: translateX(-50%);
		}
	}

	.add-text {
		font-size: 24rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.image-actions {
		display: flex;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		padding: 28rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		transition: all 0.2s;

		&.primary {
			background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
			box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.25);

			.action-btn-text {
				color: #fff;
			}
		}

		&.secondary {
			background: #fff;
			border: 2rpx solid #E5E7EB;

			.action-btn-text {
				color: #6B7280;
			}
		}

		&:active {
			transform: scale(0.98);
		}
	}

	.icon-refresh {
		width: 32rpx;
		height: 32rpx;
		border: 4rpx solid #6B7280;
		border-radius: 50%;
		border-top-color: transparent;
		border-right-color: transparent;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: -8rpx;
			right: -4rpx;
			width: 0;
			height: 0;
			border-left: 8rpx solid transparent;
			border-bottom: 12rpx solid #6B7280;
		}
	}

	.action-btn-text {
		font-size: 28rpx;
		font-weight: 700;
	}

	.icon-check {
		width: 20rpx;
		height: 10rpx;
		border-left: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.scan-option-section {
		padding: 0 28rpx;
	}

	.divider-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
		margin-bottom: 32rpx;
	}

	.divider-line {
		flex: 1;
		height: 2rpx;
		background: #E5E7EB;
	}

	.divider-text {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.option-list {
		display: flex;
		gap: 20rpx;
	}

	.option-item {
		flex: 1;
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: all 0.2s;

		&:active {
			transform: scale(0.97);
			background: #F9FAFB;
		}
	}

	.option-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.camera { background: #EFF6FF; }
		&.scan { background: #F0FDF4; }
		&.album { background: #FFF7ED; }
	}

	.icon-camera-2 {
		width: 36rpx;
		height: 28rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 6rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -6rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 18rpx;
			height: 8rpx;
			background: #4A90D9;
			border-radius: 4rpx 4rpx 0 0;
		}
	}

	.icon-qr-scan {
		width: 32rpx;
		height: 32rpx;
		background: #22C55E;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 2L7 4h2v2H5V4l-2 2v4h2V6h2v2h2V6h2V4h-2L9 2zm10 4v2h-2v2h2V6h-2V4h2l-2-2h-2l2 2h2zm-4 10v2h2v-2h-2zm4 0h-2v2h2v-2zm0 2v2h2v-2h-2zm-8-4H5v2h2v2h2v-2h2v-2H7v-2h2v2zm8 2h2v-2h-2v2zm0 2h-2v2h2v-2zm-4 0h-2v2h2v-2z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-image {
		width: 32rpx;
		height: 24rpx;
		border: 3rpx solid #F97316;
		border-radius: 4rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 6rpx;
			left: 6rpx;
			width: 8rpx;
			height: 8rpx;
			background: #F97316;
			border-radius: 50%;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 2rpx;
			right: 2rpx;
			width: 16rpx;
			height: 8rpx;
			border: 3rpx solid #F97316;
			border-top: none;
			border-radius: 0 0 12rpx 12rpx;
			transform: rotate(-15deg);
		}
	}

	.option-title {
		font-size: 26rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.option-desc {
		font-size: 20rpx;
		color: #9CA3AF;
		text-align: center;
	}

	.result-section {
		padding: 28rpx;
	}

	.result-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 48rpx 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
		text-align: center;
		animation: resultPop 0.4s ease;

		&.success {
			.result-icon {
				background: #22C55E;
			}
			.result-title {
				color: #22C55E;
			}
		}
	}

	@keyframes resultPop {
		0% { transform: scale(0.9); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}

	.result-icon-wrap {
		margin-bottom: 16rpx;
	}

	.result-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		background: #EF4444;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: iconBounce 0.5s ease;
	}

	@keyframes iconBounce {
		0% { transform: scale(0); }
		50% { transform: scale(1.15); }
		100% { transform: scale(1); }
	}

	.icon-result {
		width: 36rpx;
		height: 18rpx;
		border-left: 6rpx solid #fff;
		border-bottom: 6rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -6rpx;
	}

	.icon-fail {
		width: 40rpx;
		height: 40rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 32rpx;
			height: 6rpx;
			background: #fff;
			border-radius: 3rpx;
		}
		&::before { transform: translate(-50%, -50%) rotate(45deg); }
		&::after { transform: translate(-50%, -50%) rotate(-45deg); }
	}

	.result-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #EF4444;
	}

	.result-desc {
		font-size: 26rpx;
		color: #6B7280;
		line-height: 1.6;
	}

	.result-actions {
		margin-top: 16rpx;
	}

	.result-btn {
		background: #4A90D9;
		padding: 24rpx 64rpx;
		border-radius: 24rpx;

		&.retry {
			background: #F9FAFB;
			border: 2rpx solid #E5E7EB;

			.result-btn-text {
				color: #6B7280;
			}
		}

		&:active {
			opacity: 0.9;
		}
	}

	.result-btn-text {
		font-size: 28rpx;
		font-weight: 700;
		color: #fff;
	}

	.result-preview {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		margin: 20rpx 0 12rpx;
		padding: 20rpx;
		background: #F8FAFC;
		border-radius: 16rpx;
	}

	.preview-label {
		font-size: 24rpx;
		color: #6B7280;
		margin-bottom: 12rpx;
	}

	.preview-scroll {
		width: 100%;
		white-space: nowrap;
	}

	.preview-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		margin-right: 12rpx;
		display: inline-block;
	}

	.cloud-status {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-top: 12rpx;
		padding: 12rpx 20rpx;
		background: #F0FDF4;
		border-radius: 12rpx;
		width: 100%;
		justify-content: center;
	}

	.cloud-status .status-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;

		&.green {
			background: #22C55E;
			box-shadow: 0 0 8rpx rgba(34, 197, 94, 0.5);
		}

		&.orange {
			background: #F59E0B;
			box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.5);
		}
	}

	.cloud-status .status-text {
		font-size: 24rpx;
		color: #166534;
		font-weight: 500;
	}

	.processing-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.processing-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 48rpx 64rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}

	.processing-icon {
		width: 88rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spinner {
		width: 64rpx;
		height: 64rpx;
		border: 6rpx solid #E5E7EB;
		border-top-color: #4A90D9;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.processing-text {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.processing-hint {
		font-size: 24rpx;
		color: #9CA3AF;
	}
</style>
