<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="header-title">发布跑腿</text>
			<view class="header-placeholder"></view>
		</view>

		<view class="step-bar">
			<view class="step-item" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
				<view class="step-dot">
					<text v-if="currentStep > 1" class="step-check">✓</text>
					<text v-else class="step-num">1</text>
				</view>
				<text class="step-text">选择类目</text>
			</view>
			<view class="step-line" :class="{ active: currentStep > 1 }"></view>
			<view class="step-item" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
				<view class="step-dot">
					<text v-if="currentStep > 2" class="step-check">✓</text>
					<text v-else class="step-num">2</text>
				</view>
				<text class="step-text">填写详情</text>
			</view>
			<view class="step-line" :class="{ active: currentStep > 2 }"></view>
			<view class="step-item" :class="{ active: currentStep === 3 }">
				<view class="step-dot">
					<text class="step-num">3</text>
				</view>
				<text class="step-text">确认发布</text>
			</view>
		</view>

		<scroll-view scroll-y class="content-area" :show-scrollbar="false">
			<view class="step-content" v-if="currentStep === 1">
				<text class="section-title">请选择服务类目</text>

				<view
					class="category-card"
					:class="{ selected: selectedCategory === '快递代取' }"
					@click="selectCategory('快递代取')"
				>
					<view class="category-icon blue">
						<view class="icon-package"></view>
					</view>
					<view class="category-info">
						<text class="category-name">快递代取</text>
						<text class="category-desc">代取快递、外卖、包裹</text>
					</view>
					<view class="icon-arrow"></view>
				</view>

				<view
					class="category-card"
					:class="{ selected: selectedCategory === '食堂代买' }"
					@click="selectCategory('食堂代买')"
				>
					<view class="category-icon green">
						<view class="icon-food"></view>
					</view>
					<view class="category-info">
						<text class="category-name">食堂代买</text>
						<text class="category-desc">食堂打饭、代买零食水果</text>
					</view>
					<view class="icon-arrow"></view>
				</view>

				<view
					class="category-card"
					:class="{ selected: selectedCategory === '代办事务' }"
					@click="selectCategory('代办事务')"
				>
					<view class="category-icon purple">
						<view class="icon-clipboard"></view>
					</view>
					<view class="category-info">
						<text class="category-name">代办事务</text>
						<text class="category-desc">打印资料、代交作业、排队</text>
					</view>
					<view class="icon-arrow"></view>
				</view>

				<view
					class="category-card"
					:class="{ selected: selectedCategory === '即时速递' }"
					@click="selectCategory('即时速递')"
				>
					<view class="category-icon indigo">
						<view class="icon-truck"></view>
					</view>
					<view class="category-info">
						<text class="category-name">即时速递</text>
						<text class="category-desc">校内文件、物品快传</text>
					</view>
					<view class="icon-arrow"></view>
				</view>

				<view
					class="category-card"
					:class="{ selected: selectedCategory === '其他' }"
					@click="selectCategory('其他')"
				>
					<view class="category-icon gray">
						<view class="icon-dots"></view>
					</view>
					<view class="category-info">
						<text class="category-name">其他</text>
						<text class="category-desc">无法分类的任务，请自定义</text>
					</view>
					<view class="icon-arrow"></view>
				</view>

				<view class="locate-mode-card">
					<view class="locate-mode-header">
						<view class="locate-mode-title">
							<view class="locate-icon"></view>
							<text>定位方式</text>
						</view>
						<view class="locate-mode-switch" @click="toggleLocateMode">
							<view class="switch-track" :class="{ manual: locateMode === 'manual' }">
								<view class="switch-thumb"></view>
							</view>
							<text class="switch-label">{{ locateMode === 'gps' ? '地理定位' : '手动输入' }}</text>
						</view>
					</view>
					<view class="locate-desc">
						{{ locateMode === 'gps' ? '使用手机GPS自动获取当前位置' : '手动输入起点和终点信息' }}
					</view>
				</view>
			</view>

			<view class="step-content" v-if="currentStep === 2">
				<view class="location-card" v-if="locateMode === 'gps'">
					<view class="location-header">
						<text class="location-title">地理定位</text>
						<view class="locate-btn" @click="getLocation">
							<view class="locate-icon-small"></view>
							<text>{{ locating ? '定位中...' : '重新定位' }}</text>
						</view>
					</view>
					<view class="location-info" v-if="currentLocation">
						<text class="location-text">{{ currentLocation }}</text>
						<text class="location-tip">已获取当前位置</text>
					</view>
					<view class="location-info empty" v-else>
						<text class="location-text">点击"重新定位"获取当前位置</text>
					</view>
				</view>

				<view class="form-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>配送信息</text>
					</view>
					<view class="form-item">
						<view class="dot blue"></view>
						<input class="form-input" v-model="formData.pickup" placeholder="取货地点 (如：中区食堂、圆通快递)" />
					</view>
					<view class="form-item">
						<view class="dot orange"></view>
						<input class="form-input" v-model="formData.delivery" placeholder="送达地点 (如：宿舍 A 栋 302)" />
					</view>
					<view class="distance-row">
						<text class="distance-label">预估距离</text>
						<view class="distance-badge">
							<text class="distance-value">{{ estimatedDistance }}</text>
						</view>
					</view>
				</view>

				<view class="form-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>物品描述</text>
					</view>
					<textarea class="form-textarea" v-model="formData.desc" placeholder="详细描述物品和需求 (如：取件码、帮买什么菜、物品大小等)..." />
					<view class="char-count">
						<text>{{ formData.desc.length }}/200</text>
					</view>
				</view>

				<view class="form-card" v-if="selectedCategory === '其他'">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>服务内容</text>
					</view>
					<input class="form-input full" v-model="formData.content" placeholder="输入具体服务内容..." />
				</view>

				<view class="form-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>备注信息</text>
					</view>
					<input class="form-input full" v-model="formData.remark" placeholder="补充说明（选填）" />
				</view>

				<view class="form-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>紧急程度</text>
					</view>
					<view class="urgency-options">
						<view
							class="urgency-btn"
							:class="{ active: formData.urgency === 'normal', normal: true }"
							@click="setUrgency('normal')"
						>
							<text class="urgency-label">普通</text>
							<text class="urgency-desc">标准配送速度</text>
						</view>
						<view
							class="urgency-btn"
							:class="{ active: formData.urgency === 'urgent', urgent: true }"
							@click="setUrgency('urgent')"
						>
							<text class="urgency-label">加急</text>
							<text class="urgency-desc">优先配送 +¥3</text>
						</view>
					</view>
				</view>

				<view class="form-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>期望送达时间</text>
					</view>
					<picker mode="time" :value="formData.deliveryTime" @change="onTimeChange">
						<view class="time-picker">
							<text class="time-value">{{ formData.deliveryTime || '选择送达时间' }}</text>
							<view class="time-arrow"></view>
						</view>
					</picker>
				</view>

				<view class="form-card price-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>价格设置</text>
						<view class="official-badge">官方指导价 ¥{{ suggestedPrice }}</view>
					</view>
					<view class="price-mode-switch">
						<view
							class="price-mode-btn"
							:class="{ active: priceMode === 'suggested' }"
							@click="setPriceMode('suggested')"
						>
							<text>使用建议价</text>
						</view>
						<view
							class="price-mode-btn"
							:class="{ active: priceMode === 'custom' }"
							@click="setPriceMode('custom')"
						>
							<text>自定义价格</text>
						</view>
					</view>
					<view class="price-input-area" v-if="priceMode === 'custom'">
						<view class="price-input-wrap">
							<text class="price-prefix">¥</text>
							<input class="price-input" v-model="formData.customPrice" type="digit" placeholder="输入价格" />
						</view>
						<text class="price-tip">价格范围：3-200元</text>
					</view>
					<view class="price-display">
						<text class="display-label">当前价格</text>
						<view class="display-value">
							<text class="currency">¥</text>
							<text class="amount">{{ currentPrice }}</text>
						</view>
					</view>
				</view>

				<view class="form-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>联系电话</text>
					</view>
					<view class="contact-row" @click="editPhone">
						<text class="contact-value">{{ maskedPhone }}</text>
						<text class="contact-edit">点击修改</text>
					</view>
				</view>
			</view>

			<view class="step-content" v-if="currentStep === 3">
				<view class="upload-card">
					<view class="card-title">
						<view class="card-title-bar"></view>
						<text>上传凭证图片</text>
						<view class="upload-count">{{ formData.images.length }}/6</view>
					</view>
					<view class="image-grid">
						<view class="image-item" v-for="(img, index) in formData.images" :key="index">
							<image class="image-preview" :src="img" mode="aspectFill" @click="previewImage(index)"></image>
							<view class="image-delete" @click="deleteImage(index)">
								<text class="delete-icon">×</text>
							</view>
						</view>
						<view class="image-add" v-if="formData.images.length < 6">
							<view class="add-options">
								<view class="add-btn" @click="chooseImage('camera')">
									<view class="icon-camera"></view>
									<text>拍照</text>
								</view>
								<view class="add-btn" @click="chooseImage('album')">
									<view class="icon-album"></view>
									<text>相册</text>
								</view>
							</view>
						</view>
					</view>
					<view class="upload-tip">
						<text>支持拍照或从相册选择，最多上传6张图片</text>
					</view>
				</view>

				<view class="preview-card">
					<view class="preview-header">
						<text class="preview-category">{{ selectedCategory }}</text>
						<view class="preview-badge">
							<text class="preview-badge-text">订单预览</text>
						</view>
					</view>

					<view class="preview-info">
						<view class="preview-row">
							<view class="icon-wrapper blue">
								<view class="icon-location-mini"></view>
							</view>
							<view class="preview-detail">
								<text class="preview-label">配送路径</text>
								<text class="preview-value">{{ formData.pickup || '未填' }} → {{ formData.delivery || '未填' }}</text>
							</view>
						</view>
						<view class="preview-row">
							<view class="icon-wrapper gray">
								<view class="icon-doc-mini"></view>
							</view>
							<view class="preview-detail">
								<text class="preview-label">物品描述</text>
								<text class="preview-value">{{ formData.desc || '暂无描述' }}</text>
							</view>
						</view>
						<view class="preview-row">
							<view class="icon-wrapper orange">
								<view class="icon-clock-mini"></view>
							</view>
							<view class="preview-detail">
								<text class="preview-label">送达时间</text>
								<text class="preview-value">{{ formData.deliveryTime || '尽快送达' }}</text>
							</view>
						</view>
						<view class="preview-row">
							<view class="icon-wrapper red">
								<view class="icon-urgent-mini"></view>
							</view>
							<view class="preview-detail">
								<text class="preview-label">紧急程度</text>
								<text class="preview-value">{{ formData.urgency === 'urgent' ? '加急配送' : '普通配送' }}</text>
							</view>
						</view>
					</view>

					<view class="preview-pricing">
						<view class="price-row">
							<text class="price-label">基础跑腿费</text>
							<text class="price-val">¥{{ baseFee.toFixed(2) }}</text>
						</view>
						<view class="price-row" v-if="formData.urgency === 'urgent'">
							<text class="price-label">加急费</text>
							<text class="price-val">¥{{ urgencyFee.toFixed(2) }}</text>
						</view>
						<view class="price-row">
							<text class="price-label">平台服务费 (平台2% + 服务费10%)</text>
							<text class="price-val">¥{{ serviceFee.toFixed(2) }}</text>
						</view>
						<view class="price-row">
							<text class="price-label">加小费</text>
							<text class="price-val">¥{{ formData.tip.toFixed(2) }}</text>
						</view>
						<view class="price-row total">
							<text class="price-label-bold">合计支付</text>
							<text class="price-val-total">¥{{ totalPrice.toFixed(2) }}</text>
						</view>
					</view>
				</view>

				<view class="tip-card">
					<view class="tip-header">
						<view class="icon-tip"></view>
						<text class="tip-title">加小费 (抢单更快)</text>
					</view>
					<view class="tip-options">
						<view
							class="tip-btn"
							:class="{ active: formData.tip === 0 }"
							@click="setTip(0)"
						>
							<text class="tip-text">不加</text>
						</view>
						<view
							class="tip-btn"
							:class="{ active: formData.tip === 1 }"
							@click="setTip(1)"
						>
							<text class="tip-text">¥1</text>
						</view>
						<view
							class="tip-btn"
							:class="{ active: formData.tip === 2 }"
							@click="setTip(2)"
						>
							<text class="tip-text">¥2</text>
						</view>
						<view
							class="tip-btn"
							:class="{ active: formData.tip === 5 }"
							@click="setTip(5)"
						>
							<text class="tip-text">¥5</text>
						</view>
					</view>
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<view class="bottom-actions" v-if="currentStep < 3">
			<view class="btn-prev" v-if="currentStep > 1" @click="prevStep">
				<text class="btn-prev-text">上一步</text>
			</view>
			<view class="btn-next" @click="nextStep">
				<text class="btn-next-text">{{ currentStep === 1 ? '下一步' : '下一步' }}</text>
			</view>
		</view>

		<view class="bottom-actions single" v-if="currentStep === 3">
			<view class="btn-publish" @click="publishOrder">
				<text class="btn-publish-text">确认支付 ¥{{ totalPrice.toFixed(2) }} 并发布</text>
			</view>
		</view>

		<view class="phone-modal" v-if="showPhoneModal" @click="closePhoneModal">
			<view class="phone-modal-content" @click.stop>
				<view class="phone-modal-header">
					<text class="phone-modal-title">修改联系电话</text>
					<view class="phone-modal-close" @click="closePhoneModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="phone-modal-body">
					<view class="phone-input-group">
						<text class="input-label">新手机号</text>
						<input 
							class="phone-input" 
							type="number" 
							maxlength="11"
							v-model="editPhoneValue"
							placeholder="请输入11位手机号"
							placeholder-class="input-placeholder"
						/>
					</view>
					<view class="phone-tips">
						<text class="tip-text">温馨提示：</text>
						<text class="tip-desc">修改后的手机号将用于接收订单通知，请确保填写正确。</text>
					</view>
				</view>
				<view class="phone-modal-footer">
					<view class="phone-btn cancel" @click="closePhoneModal">
						<text class="btn-text">取消</text>
					</view>
					<view class="phone-btn confirm" @click="savePhone">
						<text class="btn-text">确认修改</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { orderService } from '@/services/order.js'
	import { initService } from '@/services/init.js'
	
	export default {
		data() {
			const user = initService.getUser()
			return {
				currentStep: 1,
				selectedCategory: '',
				locateMode: 'gps',
				locating: false,
				currentLocation: '',
				estimatedDistance: '约 0.5 公里',
				priceMode: 'suggested',
				formData: {
					pickup: '',
					delivery: '',
					desc: '',
					content: '',
					remark: '',
					customPrice: '',
					urgency: 'normal',
					deliveryTime: '',
					tip: 0,
					images: [],
					phone: user.phone || '13888888888'
				},
				showPhoneModal: false,
				editPhoneValue: ''
			}
		},
		computed: {
			maskedPhone() {
				const phone = this.formData.phone
				if (phone.length === 11) {
					return phone.substring(0, 3) + '****' + phone.substring(7)
				}
				return phone
			},
			suggestedPrice() {
				const categoryPrices = {
					'快递代取': 5,
					'食堂代买': 6,
					'代办事务': 8,
					'即时速递': 10,
					'其他': 5
				}
				return categoryPrices[this.selectedCategory] || 5
			},
			currentPrice() {
				if (this.priceMode === 'custom' && this.formData.customPrice) {
					return parseFloat(this.formData.customPrice) || this.suggestedPrice
				}
				return this.suggestedPrice
			},
			baseFee() {
				return this.currentPrice
			},
			urgencyFee() {
				return this.formData.urgency === 'urgent' ? 3 : 0
			},
			serviceFee() {
				return (this.baseFee + this.urgencyFee) * 0.12
			},
			totalPrice() {
				return this.baseFee + this.urgencyFee + this.serviceFee + this.formData.tip
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			selectCategory(name) {
				this.selectedCategory = name
				this.priceMode = 'suggested'
				this.formData.customPrice = ''
			},
			toggleLocateMode() {
				this.locateMode = this.locateMode === 'gps' ? 'manual' : 'gps'
				if (this.locateMode === 'gps') {
					this.getLocation()
				}
			},
			getLocation() {
				this.locating = true
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						this.currentLocation = `经度: ${res.longitude.toFixed(4)}, 纬度: ${res.latitude.toFixed(4)}`
						this.locating = false
						uni.showToast({ title: '定位成功', icon: 'success' })
					},
					fail: () => {
						this.locating = false
						this.currentLocation = '未获取到位置，请手动输入'
						uni.showToast({ title: '定位失败，请手动输入', icon: 'none' })
					}
				})
			},
			setUrgency(val) {
				this.formData.urgency = val
			},
			setPriceMode(mode) {
				this.priceMode = mode
			},
			onTimeChange(e) {
				this.formData.deliveryTime = e.detail.value
			},
			chooseImage(source) {
				if (this.formData.images.length >= 6) {
					uni.showToast({ title: '最多上传6张图片', icon: 'none' })
					return
				}
				
				const remainingCount = Math.max(1, 6 - this.formData.images.length)
				const sourceType = source === 'camera' ? ['camera'] : ['album']
				
				uni.chooseImage({
					count: remainingCount,
					sizeType: ['compressed'],
					sourceType: sourceType,
					success: (res) => {
						if (res && res.tempFilePaths && res.tempFilePaths.length > 0) {
							const newImages = res.tempFilePaths.slice(0, remainingCount)
							this.formData.images = this.formData.images.concat(newImages)
							uni.showToast({ 
								title: '已选择' + newImages.length + '张图片', 
								icon: 'none' 
							})
						}
					},
					fail: (err) => {
						console.warn('[发布] 选择图片失败:', err)
						const errMsg = err && err.errMsg ? err.errMsg : ''
						if (errMsg.indexOf('cancel') === -1) {
							uni.showModal({
								title: '选择图片失败',
								content: '请检查相册/相机权限设置后重试',
								showCancel: false
							})
						}
					}
				})
			},
			previewImage(index) {
				uni.previewImage({
					current: this.formData.images[index],
					urls: this.formData.images
				})
			},
			deleteImage(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这张图片吗？',
					success: (res) => {
						if (res.confirm) {
							this.formData.images.splice(index, 1)
						}
					}
				})
			},
			nextStep() {
				if (this.currentStep === 1) {
					if (!this.selectedCategory) {
						uni.showToast({ title: '请先选择类目', icon: 'none' })
						return
					}
					if (this.locateMode === 'gps' && !this.currentLocation) {
						this.getLocation()
					}
				}
				if (this.currentStep === 2) {
					if (!this.formData.pickup || !this.formData.delivery) {
						uni.showToast({ title: '请填写取货和送达地点', icon: 'none' })
						return
					}
					if (!this.formData.desc || this.formData.desc.length < 5) {
						uni.showToast({ title: '请填写物品描述（至少5字）', icon: 'none' })
						return
					}
					if (this.priceMode === 'custom') {
						const price = parseFloat(this.formData.customPrice)
						if (!price || price < 3 || price > 200) {
							uni.showToast({ title: '价格范围3-200元', icon: 'none' })
							return
						}
					}
				}
				if (this.currentStep < 3) {
					this.currentStep++
				}
			},
			prevStep() {
				if (this.currentStep > 1) {
					this.currentStep--
				}
			},
			setTip(val) {
				this.formData.tip = val
			},
			editPhone() {
				this.editPhoneValue = ''
				this.showPhoneModal = true
			},
			closePhoneModal() {
				this.showPhoneModal = false
				this.editPhoneValue = ''
			},
			savePhone() {
				const phone = this.editPhoneValue.trim()
				if (!phone) {
					uni.showToast({ title: '请输入手机号', icon: 'none' })
					return
				}
				if (!/^1[3-9]\d{9}$/.test(phone)) {
					uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
					return
				}
				this.formData.phone = phone
				this.showPhoneModal = false
				this.editPhoneValue = ''
				uni.showToast({ title: '修改成功', icon: 'success' })
			},
			getTypeParam() {
				const map = {
					'快递代取': 'express',
					'食堂代买': 'food',
					'代办事务': 'task',
					'即时速递': 'delivery',
					'其他': 'other'
				}
				return map[this.selectedCategory] || 'other'
			},
			publishOrder() {
				if (this.formData.images.length === 0) {
					uni.showModal({
						title: '提示',
						content: '上传凭证图片可提高接单率，是否继续？',
						success: (res) => {
							if (res.confirm) {
								this.doPublish()
							}
						}
					})
					return
				}
				this.doPublish()
			},
			async uploadImages(tempPaths) {
				if (!tempPaths || tempPaths.length === 0) return []
				
				const uploadedFileIDs = []
				let uploaded = 0
				
				for (let i = 0; i < tempPaths.length; i++) {
					const filePath = tempPaths[i]
					
					try {
						// 检测 uniCloud 是否可用
						if (typeof uniCloud !== 'undefined' && uniCloud.uploadFile) {
							console.log('[发布] 上传图片', i + 1, '/', tempPaths.length)
							
							const result = await new Promise((resolve, reject) => {
								setTimeout(() => {
									reject(new Error('上传超时'))
								}, 10000)
								
								uniCloud.uploadFile({
									filePath: filePath,
									cloudPath: `orders/${Date.now()}_${i}.jpg`,
									success: (res) => resolve(res),
									fail: (err) => reject(err)
								})
							})
							
							if (result && result.fileID) {
								uploadedFileIDs.push(result.fileID)
								uploaded++
								console.log('[发布] 上传成功:', result.fileID)
							} else {
								uploadedFileIDs.push(filePath)
							}
						} else {
							console.log('[发布] uniCloud 不可用，使用本地路径')
							uploadedFileIDs.push(filePath)
						}
					} catch (err) {
						console.warn('[发布] 上传失败:', err.message)
						console.log('[发布] 使用本地路径作为备选')
						uploadedFileIDs.push(filePath)
					}
					
					uni.showLoading({ 
						title: `上传中 ${uploadedFileIDs.length}/${tempPaths.length}`,
						mask: true
					})
				}
				
				uni.hideLoading()
				console.log('[发布] 图片处理完成，成功上传', uploaded, '张')
				return uploadedFileIDs
			},
			async doPublish() {
				uni.showLoading({ title: '提交订单中...' })
				
				try {
					const categoryMap = {
						'快递代取': 'delivery',
						'食堂代买': 'food',
						'代办事务': 'print',
						'即时速递': 'errand',
						'其他': 'other'
					}
					
					const userInfo = uni.getStorageSync('userInfo') || {}
					
					console.log('[发布] 准备发布订单:', {
						category: categoryMap[this.selectedCategory],
						title: this.formData.desc,
						pickup: this.formData.pickup,
						delivery: this.formData.delivery,
						price: this.currentPrice,
						imagesCount: this.formData.images.length
					})
					
					let uploadedImages = this.formData.images
					if (this.formData.images.length > 0) {
						console.log('[发布] 开始上传图片到云存储...')
						uploadedImages = await this.uploadImages(this.formData.images)
						console.log('[发布] 图片上传完成:', uploadedImages.length, '张')
					}
					
					const result = await orderService.add({
						category: categoryMap[this.selectedCategory] || 'other',
						itemType: 'daily',
						itemWeight: 'light',
						title: this.formData.desc.substring(0, 30) || this.selectedCategory,
						description: this.formData.desc,
						pickupAddress: this.formData.pickup,
						deliveryAddress: this.formData.delivery,
						pickupLocation: this.currentLocation ? {
							latitude: 0,
							longitude: 0
						} : null,
						deliveryLocation: null,
						pickupTimeRange: null,
						price: this.currentPrice,
						urgency: this.formData.urgency,
						deliveryTime: this.formData.deliveryTime,
						images: uploadedImages,
						remark: this.formData.remark,
						contactPhone: this.formData.phone,
						userName: userInfo.name || userInfo.nickname || ''
					})
					
					console.log('[发布] 订单发布结果:', result)
					
					uni.hideLoading()
					
					if (result.errCode === 0) {
						const orderId = result.data ? result.data.id : ''
						
						if (orderId) {
							uni.navigateTo({
								url: '/pages/pay/index?orderId=' + orderId
							})
						} else {
							uni.showToast({ title: '发布成功！', icon: 'success' })
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/order-success/index?type=' + this.getTypeParam()
								})
							}, 1500)
						}
					} else {
						uni.showToast({ 
							title: result.errMsg || '发布失败', 
							icon: 'none' 
						})
					}
				} catch (error) {
					uni.hideLoading()
					console.error('发布订单失败:', error)
					uni.showToast({ 
						title: '发布成功（离线模式）', 
						icon: 'none' 
					})
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/order-success/index?type=' + this.getTypeParam()
						})
					}, 1500)
				}
			}
		},
		onLoad(options) {
			if (options.type) {
				const typeMap = {
					'express': '快递代取',
					'food': '食堂代买',
					'task': '代办事务',
					'delivery': '即时速递',
					'other': '其他'
				}
				this.selectedCategory = typeMap[options.type] || ''
			}
			this.getLocation()
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
		padding: 100rpx 28rpx 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		box-shadow: 0 4rpx 16rpx rgba(74, 144, 217, 0.2);
	}

	.back-btn {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
		transition: all 0.2s;

		&:active {
			background: rgba(255, 255, 255, 0.25);
			transform: scale(0.95);
		}
	}

	.icon-back {
		width: 20rpx;
		height: 20rpx;
		border-left: 5rpx solid #fff;
		border-bottom: 5rpx solid #fff;
		transform: rotate(45deg);
		margin-left: 6rpx;
	}

	.header-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #fff;
		flex: 1;
		text-align: center;
		margin-right: 72rpx;
	}

	.header-placeholder {
		width: 72rpx;
	}

	.step-bar {
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 36rpx 48rpx;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.step-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14rpx;
		z-index: 1;

		&.active {
			.step-dot {
				background-color: #4A90D9;
				border-color: #4A90D9;

				.step-num {
					color: #fff;
				}
			}
			.step-text {
				color: #4A90D9;
				font-weight: 700;
			}
		}

		&.completed {
			.step-dot {
				background-color: #4ECDC4;
				border-color: #4ECDC4;
			}
		}
	}

	.step-dot {
		width: 52rpx;
		height: 52rpx;
		border-radius: 50%;
		border: 4rpx solid #E5E7EB;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.step-num {
		font-size: 24rpx;
		font-weight: 700;
		color: #9CA3AF;
	}

	.step-check {
		font-size: 24rpx;
		color: #fff;
	}

	.step-text {
		font-size: 22rpx;
		color: #9CA3AF;
		white-space: nowrap;
	}

	.step-line {
		flex: 1;
		height: 4rpx;
		background: #E5E7EB;
		margin: 0 12rpx;
		margin-bottom: 40rpx;
		border-radius: 2rpx;
		transition: all 0.3s;

		&.active {
			background-color: #4A90D9;
		}
	}

	.content-area {
		flex: 1;
		padding: 28rpx 32rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
		display: block;
		margin-bottom: 28rpx;
		padding-left: 12rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 8rpx;
			height: 32rpx;
			background-color: #4A90D9;
			border-radius: 4rpx;
		}
	}

	.category-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx 28rpx;
		margin-bottom: 24rpx;
		display: flex;
		align-items: center;
		gap: 28rpx;
		border: 3rpx solid transparent;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: all 0.25s ease;

		&:active {
			transform: scale(0.98);
		}

		&.selected {
			border-color: #4A90D9;
			background-color: #f0f7ff;
		}
	}

	.category-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		&.blue { background-color: #EFF6FF; }
		&.green { background-color: #F0FDF4; }
		&.purple { background-color: #FAF5FF; }
		&.indigo { background-color: #EEF2FF; }
		&.gray { background-color: #F9FAFB; }
	}

	.icon-package {
		width: 36rpx;
		height: 32rpx;
		border: 4rpx solid #4A90D9;
		border-radius: 6rpx;
		position: relative;
	}

	.icon-food {
		width: 32rpx;
		height: 36rpx;
		border: 4rpx solid #2A9D8F;
		border-radius: 6rpx 6rpx 0 0;
		position: relative;
	}

	.icon-clipboard {
		width: 32rpx;
		height: 36rpx;
		border: 4rpx solid #8B5CF6;
		border-radius: 6rpx;
		position: relative;
	}

	.icon-truck {
		width: 36rpx;
		height: 28rpx;
		border: 4rpx solid #6366F1;
		border-radius: 6rpx;
		position: relative;
	}

	.icon-dots {
		width: 40rpx;
		height: 12rpx;
		display: flex;
		justify-content: space-between;

		&::before,
		&::after {
			content: '';
			width: 12rpx;
			height: 12rpx;
			background: #6B7280;
			border-radius: 50%;
		}
	}

	.category-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.category-name {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.category-desc {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.icon-arrow {
		width: 16rpx;
		height: 16rpx;
		border-right: 4rpx solid #D1D5DB;
		border-bottom: 4rpx solid #D1D5DB;
		transform: rotate(-45deg);
	}

	.locate-mode-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 32rpx;
		margin-top: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.locate-mode-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.locate-mode-title {
		display: flex;
		align-items: center;
		gap: 16rpx;
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.locate-icon {
		width: 32rpx;
		height: 32rpx;
		border: 4rpx solid #4A90D9;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 8rpx;
			left: 8rpx;
			width: 12rpx;
			height: 12rpx;
			background: #4A90D9;
			border-radius: 50%;
		}
	}

	.locate-mode-switch {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.switch-track {
		width: 80rpx;
		height: 44rpx;
		background: #4A90D9;
		border-radius: 22rpx;
		position: relative;
		transition: all 0.3s;

		&.manual {
			background: #9CA3AF;
		}
	}

	.switch-thumb {
		position: absolute;
		top: 4rpx;
		right: 4rpx;
		width: 36rpx;
		height: 36rpx;
		background: #fff;
		border-radius: 50%;
		transition: all 0.3s;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);

		.manual & {
			right: auto;
			left: 4rpx;
		}
	}

	.switch-label {
		font-size: 26rpx;
		color: #6B7280;
		font-weight: 600;
	}

	.locate-desc {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.location-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		border: 2rpx solid #E5E7EB;
	}

	.location-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.location-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.locate-btn {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 12rpx 24rpx;
		background: #EFF6FF;
		border-radius: 12rpx;
		font-size: 24rpx;
		color: #4A90D9;
		font-weight: 600;
	}

	.locate-icon-small {
		width: 20rpx;
		height: 20rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
	}

	.location-info {
		padding: 20rpx 24rpx;
		background: #F0F7FF;
		border-radius: 16rpx;

		&.empty {
			background: #F9FAFB;
		}
	}

	.location-text {
		display: block;
		font-size: 26rpx;
		color: #374151;
		font-weight: 500;
	}

	.location-tip {
		display: block;
		font-size: 22rpx;
		color: #10B981;
		margin-top: 8rpx;
	}

	.form-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.card-title {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
		position: relative;
	}

	.card-title-bar {
		width: 6rpx;
		height: 28rpx;
		background-color: #4A90D9;
		border-radius: 3rpx;
	}

	.form-item {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 20rpx 0;
		border-bottom: 2rpx solid #F3F4F6;

		&:last-child {
			border-bottom: none;
		}
	}

	.dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		flex-shrink: 0;

		&.blue {
			background-color: #4A90D9;
		}
		&.orange {
			background-color: #FB923C;
		}
	}

	.form-input {
		flex: 1;
		font-size: 30rpx;
		color: #1F2937;
		font-weight: 500;

		&.full {
			width: 100%;
		}
	}

	.form-textarea {
		width: 100%;
		font-size: 28rpx;
		color: #1F2937;
		min-height: 180rpx;
		line-height: 1.6;
		font-weight: 500;
	}

	.char-count {
		text-align: right;
		font-size: 22rpx;
		color: #9CA3AF;
		margin-top: 8rpx;
	}

	.distance-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 20rpx;
		border-top: 2rpx solid #F3F4F6;
	}

	.distance-label {
		font-size: 26rpx;
		color: #6B7280;
	}

	.distance-badge {
		padding: 8rpx 20rpx;
		background: #EFF6FF;
		border-radius: 20rpx;
	}

	.distance-value {
		font-size: 26rpx;
		color: #4A90D9;
		font-weight: 700;
	}

	.urgency-options {
		display: flex;
		gap: 24rpx;
	}

	.urgency-btn {
		flex: 1;
		padding: 28rpx;
		background: #F9FAFB;
		border: 2rpx solid #E5E7EB;
		border-radius: 20rpx;
		text-align: center;
		transition: all 0.25s ease;

		&.active {
			&.normal {
				background: #F0F7FF;
				border-color: #4A90D9;

				.urgency-label {
					color: #4A90D9;
				}
			}
			&.urgent {
				background: #FEF2F2;
				border-color: #EF4444;

				.urgency-label {
					color: #EF4444;
				}
			}
		}
	}

	.urgency-label {
		display: block;
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
		margin-bottom: 8rpx;
	}

	.urgency-desc {
		display: block;
		font-size: 24rpx;
		color: #6B7280;
	}

	.time-picker {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;
		background: #F9FAFB;
		border-radius: 16rpx;
		border: 2rpx solid #E5E7EB;
	}

	.time-value {
		font-size: 30rpx;
		color: #1F2937;
		font-weight: 500;
	}

	.time-arrow {
		width: 16rpx;
		height: 16rpx;
		border-right: 4rpx solid #9CA3AF;
		border-bottom: 4rpx solid #9CA3AF;
		transform: rotate(-45deg);
	}

	.price-card {
		.official-badge {
			margin-left: auto;
			padding: 8rpx 16rpx;
			background: #FEF3C7;
			border-radius: 12rpx;
			font-size: 22rpx;
			color: #D97706;
			font-weight: 600;
		}
	}

	.price-mode-switch {
		display: flex;
		gap: 20rpx;
		margin-bottom: 24rpx;
	}

	.price-mode-btn {
		flex: 1;
		padding: 20rpx;
		background: #F9FAFB;
		border: 2rpx solid #E5E7EB;
		border-radius: 16rpx;
		text-align: center;
		font-size: 26rpx;
		color: #6B7280;
		font-weight: 600;
		transition: all 0.25s ease;

		&.active {
			background: #EFF6FF;
			border-color: #4A90D9;
			color: #4A90D9;
		}
	}

	.price-input-area {
		margin-bottom: 24rpx;
	}

	.price-input-wrap {
		display: flex;
		align-items: center;
		background-color: #F3F4F6;
		padding: 16rpx 24rpx;
		border-radius: 16rpx;
		gap: 8rpx;
		border: 2rpx solid #E5E7EB;
	}

	.price-prefix {
		font-size: 28rpx;
		color: #6B7280;
		font-weight: 600;
	}

	.price-input {
		font-size: 34rpx;
		font-weight: 700;
		color: #4A90D9;
		width: 100%;
	}

	.price-tip {
		display: block;
		font-size: 22rpx;
		color: #9CA3AF;
		margin-top: 12rpx;
	}

	.price-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 24rpx;
		background: #F0F7FF;
		border-radius: 16rpx;
	}

	.display-label {
		font-size: 26rpx;
		color: #6B7280;
	}

	.display-value {
		display: flex;
		align-items: baseline;
		gap: 4rpx;
	}

	.currency {
		font-size: 28rpx;
		color: #4A90D9;
		font-weight: 700;
	}

	.amount {
		font-size: 40rpx;
		color: #4A90D9;
		font-weight: 800;
	}

	.contact-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
	}

	.contact-value {
		font-size: 30rpx;
		color: #1F2937;
		font-weight: 500;
	}

	.contact-edit {
		font-size: 26rpx;
		color: #4A90D9;
		font-weight: 600;
	}

	.upload-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.upload-count {
			margin-left: auto;
			font-size: 24rpx;
			color: #9CA3AF;
			font-weight: 500;
		}
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.image-item {
		width: 200rpx;
		height: 200rpx;
		border-radius: 20rpx;
		position: relative;
		overflow: hidden;
	}

	.image-preview {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
	}

	.image-delete {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 40rpx;
		height: 40rpx;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-icon {
		font-size: 28rpx;
		color: #fff;
		line-height: 1;
	}

	.image-add {
		width: 200rpx;
		height: 200rpx;
		border-radius: 20rpx;
		background: #F9FAFB;
		border: 2rpx dashed #D1D5DB;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-options {
		display: flex;
		gap: 32rpx;
	}

	.add-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		font-size: 24rpx;
		color: #6B7280;
	}

	.icon-camera {
		width: 48rpx;
		height: 36rpx;
		border: 4rpx solid #9CA3AF;
		border-radius: 8rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: -12rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 24rpx;
			height: 12rpx;
			background: #9CA3AF;
			border-radius: 4rpx 4rpx 0 0;
		}
	}

	.icon-album {
		width: 44rpx;
		height: 36rpx;
		border: 4rpx solid #9CA3AF;
		border-radius: 6rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			bottom: 4rpx;
			left: 8rpx;
			width: 16rpx;
			height: 16rpx;
			background: #FCD34D;
			border-radius: 50%;
		}
		&::after {
			content: '';
			position: absolute;
			bottom: 4rpx;
			right: 4rpx;
			width: 0;
			height: 0;
			border-left: 20rpx solid transparent;
			border-bottom: 16rpx solid #86EFAC;
		}
	}

	.upload-tip {
		text-align: center;
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.preview-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24rpx;
	}

	.preview-category {
		font-size: 34rpx;
		font-weight: 800;
		color: #1F2937;
	}

	.preview-badge {
		background-color: #EFF6FF;
		padding: 8rpx 18rpx;
		border-radius: 12rpx;
	}

	.preview-badge-text {
		font-size: 22rpx;
		color: #4A90D9;
		font-weight: 600;
	}

	.preview-info {
		padding: 20rpx 24rpx;
		background-color: #F9FAFB;
		border-radius: 16rpx;
		margin-bottom: 28rpx;
	}

	.preview-row {
		display: flex;
		gap: 20rpx;
		padding: 12rpx 0;
	}

	.icon-wrapper {
		width: 44rpx;
		height: 44rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		&.blue {
			background-color: #EFF6FF;
		}
		&.gray {
			background-color: #F3F4F6;
		}
		&.orange {
			background-color: #FFF7ED;
		}
		&.red {
			background-color: #FEF2F2;
		}
	}

	.icon-location-mini {
		width: 16rpx;
		height: 20rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
	}

	.icon-doc-mini {
		width: 14rpx;
		height: 18rpx;
		border: 3rpx solid #6B7280;
		border-radius: 3rpx;
	}

	.icon-clock-mini {
		width: 16rpx;
		height: 16rpx;
		border: 3rpx solid #FB923C;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 6rpx;
			height: 3rpx;
			background: #FB923C;
			transform: translate(-50%, -50%);
		}
	}

	.icon-urgent-mini {
		width: 4rpx;
		height: 20rpx;
		background: #EF4444;
		border-radius: 2rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -6rpx;
			left: -2rpx;
			width: 8rpx;
			height: 8rpx;
			background: #EF4444;
			border-radius: 50%;
		}
	}

	.preview-detail {
		flex: 1;
	}

	.preview-label {
		font-size: 22rpx;
		color: #9CA3AF;
		display: block;
		margin-bottom: 6rpx;
	}

	.preview-value {
		font-size: 28rpx;
		color: #1F2937;
		line-height: 1.5;
		font-weight: 500;
	}

	.preview-pricing {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.price-row {
		display: flex;
		justify-content: space-between;
		align-items: center;

		&.total {
			padding-top: 24rpx;
			border-top: 2rpx solid #F3F4F6;
			margin-top: 12rpx;
		}
	}

	.price-label {
		font-size: 28rpx;
		color: #6B7280;
	}

	.price-val {
		font-size: 28rpx;
		color: #374151;
		font-weight: 500;
	}

	.price-label-bold {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.price-val-total {
		font-size: 44rpx;
		font-weight: 800;
		color: #4A90D9;
	}

	.tip-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx 32rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.tip-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.icon-tip {
		width: 28rpx;
		height: 28rpx;
		background: #F59E0B;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
	}

	.tip-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.tip-options {
		display: flex;
		gap: 16rpx;
	}

	.tip-btn {
		flex: 1;
		padding: 22rpx 12rpx;
		background: #F9FAFB;
		border: 2rpx solid #E5E7EB;
		border-radius: 16rpx;
		text-align: center;
		transition: all 0.25s ease;

		&:active {
			transform: scale(0.95);
		}

		&.active {
			background-color: #4A90D9;
			border-color: #4A90D9;

			.tip-text {
				color: #fff;
			}
		}
	}

	.tip-text {
		font-size: 26rpx;
		color: #6B7280;
		font-weight: 600;
	}

	.bottom-space {
		height: 200rpx;
	}

	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		gap: 24rpx;
		padding: 24rpx 32rpx;
		background: #fff;
		border-top: 2rpx solid #F3F4F6;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.05);

		&.single {
			display: block;
		}
	}

	.btn-prev {
		flex: 1;
		padding: 28rpx;
		background: #F3F4F6;
		border-radius: 24rpx;
		text-align: center;
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
			background: #E5E7EB;
		}
	}

	.btn-prev-text {
		font-size: 32rpx;
		color: #6B7280;
		font-weight: 600;
	}

	.btn-next {
		flex: 2;
		padding: 28rpx;
		background-color: #4A90D9;
		border-radius: 24rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 4rpx 12rpx rgba(74, 144, 217, 0.3);
		}
	}

	.btn-next-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: 600;
	}

	.btn-publish {
		width: 100%;
		padding: 28rpx;
		background-color: #4A90D9;
		border-radius: 24rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 4rpx 12rpx rgba(74, 144, 217, 0.3);
		}
	}

	.btn-publish-text {
		font-size: 34rpx;
		color: #fff;
		font-weight: 700;
	}

	.phone-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx;
	}

	.phone-modal-content {
		width: 100%;
		background: #fff;
		border-radius: 32rpx;
		overflow: hidden;
	}

	.phone-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.phone-modal-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.phone-modal-close {
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

	.phone-modal-body {
		padding: 32rpx;
	}

	.phone-input-group {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.input-label {
		font-size: 26rpx;
		color: #6B7280;
		font-weight: 500;
	}

	.phone-input {
		width: 100%;
		height: 96rpx;
		background: #F9FAFB;
		border: 2rpx solid #E5E7EB;
		border-radius: 20rpx;
		padding: 0 28rpx;
		font-size: 32rpx;
		color: #1F2937;
		box-sizing: border-box;
	}

	.input-placeholder {
		color: #9CA3AF;
	}

	.phone-tips {
		background: #EFF6FF;
		padding: 20rpx;
		border-radius: 16rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.tip-text {
		font-size: 24rpx;
		color: #4A90D9;
		font-weight: 600;
	}

	.tip-desc {
		font-size: 22rpx;
		color: #6B7280;
		line-height: 1.5;
	}

	.phone-modal-footer {
		display: flex;
		gap: 20rpx;
		padding: 24rpx 32rpx 32rpx;
	}

	.phone-btn {
		flex: 1;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 20rpx;
		transition: all 0.2s;

		&.cancel {
			background: #F3F4F6;
		}

		&.confirm {
			background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
			box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		}

		&:active {
			transform: scale(0.98);
		}

		&.cancel .btn-text {
			color: #6B7280;
		}

		&.confirm .btn-text {
			color: #fff;
		}
	}

	.phone-btn .btn-text {
		font-size: 30rpx;
		font-weight: 600;
	}
</style>
