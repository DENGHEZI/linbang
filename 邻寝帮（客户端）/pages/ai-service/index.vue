<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<view class="header-center">
				<text class="header-title">AI智能客服</text>
				<view class="online-status">
					<view class="status-dot"></view>
					<text class="status-text">在线</text>
				</view>
			</view>
			<view class="header-action" @click="showContact">
				<view class="icon-more"></view>
			</view>
		</view>

		<scroll-view
			scroll-y
			class="chat-area"
			:show-scrollbar="false"
			:scroll-into-view="scrollToId"
			scroll-with-animation
		>
			<view class="chat-list">
				<view
					v-for="(msg, index) in messages"
					:key="index"
					:id="'msg-' + index"
					class="message-item"
					:class="{ 'user-msg': msg.type === 'user', 'ai-msg': msg.type === 'ai' }"
				>
					<view v-if="msg.type === 'ai'" class="avatar ai-avatar">
						<view class="ai-icon"></view>
					</view>
					<view class="msg-bubble" :class="msg.type">
						<text class="msg-content">{{ msg.content }}</text>
						<view v-if="msg.quickReplies && msg.quickReplies.length" class="quick-replies">
							<view
								v-for="(reply, rIndex) in msg.quickReplies"
								:key="rIndex"
								class="quick-item"
								@click="sendQuickReply(reply)"
							>
								<text class="quick-text">{{ reply }}</text>
							</view>
						</view>
					</view>
					<view v-if="msg.type === 'user'" class="avatar user-avatar">
						<view class="user-icon"></view>
					</view>
				</view>

				<view v-if="typing" class="message-item ai-msg">
					<view class="avatar ai-avatar">
						<view class="ai-icon"></view>
					</view>
					<view class="msg-bubble typing-bubble">
						<view class="typing-dots">
							<view class="dot dot1"></view>
							<view class="dot dot2"></view>
							<view class="dot dot3"></view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="quick-questions">
			<view class="section-label">
				<text class="label-text">常见问题</text>
			</view>
			<scroll-view scroll-x class="quick-scroll" :show-scrollbar="false">
				<view class="quick-list">
					<view
						v-for="(q, index) in quickQuestions"
						:key="index"
						class="quick-q-item"
						@click="sendQuickReply(q)"
					>
						<view class="q-icon" :class="q.iconClass"></view>
						<text class="q-text">{{ q.text }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="chat-input-bar">
			<view class="contact-entry" @click="showContact">
				<view class="icon-phone"></view>
			</view>
			<input
				class="chat-input"
				v-model="inputText"
				placeholder="请输入您的问题..."
				placeholder-class="input-placeholder"
				@confirm="sendMessage"
				confirm-type="send"
			/>
			<view
				class="send-btn"
				:class="{ active: inputText.trim() }"
				@click="sendMessage"
			>
				<text class="send-text">发送</text>
			</view>
		</view>

		<view v-if="showContactModal" class="modal-mask" @click="showContactModal = false">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">联系人工客服</text>
					<view class="modal-close" @click="showContactModal = false">
						<view class="close-icon"></view>
					</view>
				</view>
				<view class="modal-body">
					<view class="contact-card" @click="callPhone">
						<view class="contact-icon phone-icon"></view>
						<view class="contact-info">
							<text class="contact-label">客服电话</text>
							<text class="contact-value">19976889490</text>
						</view>
						<view class="contact-action">
							<text class="action-text">拨打</text>
						</view>
					</view>
					<view class="contact-card" @click="copyWechat">
						<view class="contact-icon wechat-icon"></view>
						<view class="contact-info">
							<text class="contact-label">创作者微信</text>
							<text class="contact-value">zy1118dh</text>
						</view>
						<view class="contact-action">
							<text class="action-text">复制</text>
						</view>
					</view>
					<view class="service-time">
						<text class="time-text">服务时间：09:00 - 22:00</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { aiChatService } from '@/services/aiChat.js'

	export default {
		data() {
			return {
				sessionId: null,
				messages: [
					{
						type: 'ai',
						content: '您好！我是邻寝帮AI智能客服 🤖，很高兴为您服务。我可以帮您解答订单状态、费用说明、退款流程、骑手认证等问题。如需人工服务，可随时拨打创作者电话 19976889490 或添加微信 zy1118dh。请问有什么可以帮您？',
						quickReplies: ['订单状态查询', '费用说明', '退款流程', '如何下单', '骑手认证']
					}
				],
				quickQuestions: [
					{ text: '订单状态查询', iconClass: 'icon-order' },
					{ text: '费用说明', iconClass: 'icon-money' },
					{ text: '投诉建议', iconClass: 'icon-complaint' },
					{ text: '如何下单', iconClass: 'icon-help' },
					{ text: '退款流程', iconClass: 'icon-refund' },
					{ text: '骑手认证', iconClass: 'icon-account' },
					{ text: '优惠券使用', iconClass: 'icon-coupon' },
					{ text: '支付问题', iconClass: 'icon-money' }
				],
				inputText: '',
				typing: false,
				scrollToId: '',
				showContactModal: false
			}
		},
		onLoad() {
			this.initSession()
		},
		methods: {
			async initSession() {
				try {
					const existingSession = aiChatService.getLocalSession()
					if (existingSession && existingSession.sessionId) {
						this.sessionId = existingSession.sessionId
						if (existingSession.messages && existingSession.messages.length > 0) {
							this.messages = existingSession.messages.map(m => ({
								type: m.role === 'user' ? 'user' : 'ai',
								content: m.content
							}))
						}
					} else {
						const result = await aiChatService.createSession()
						if (result.errCode === 0) {
							this.sessionId = result.data.sessionId
							if (result.data.messages && result.data.messages.length > 0) {
								this.messages = result.data.messages.map(m => ({
									type: m.role === 'user' ? 'user' : 'ai',
									content: m.content
								}))
							}
						}
					}
				} catch (e) {
					console.warn('[AI客服] 初始化会话失败:', e.message)
				}
			},
			goBack() {
				uni.navigateBack()
			},
			showContact() {
				this.showContactModal = true
			},
			async sendMessage() {
				const text = this.inputText.trim()
				if (!text) return
				this.addMessage('user', text)
				this.inputText = ''
				this.typing = true
				
				try {
					if (this.sessionId) {
						await aiChatService.sendMessage(this.sessionId, text)
					}
				} catch (e) {
					console.warn('[AI客服] 消息同步失败:', e.message)
				}
				
				setTimeout(() => {
					this.typing = false
					this.aiReply(text)
				}, 800)
			},
			async sendQuickReply(text) {
				this.addMessage('user', text)
				this.typing = true
				
				try {
					if (this.sessionId) {
						await aiChatService.sendMessage(this.sessionId, text)
					}
				} catch (e) {}
				
				setTimeout(() => {
					this.typing = false
					this.aiReply(text)
				}, 600)
			},
			addMessage(type, content, quickReplies) {
				this.messages.push({ type, content, quickReplies })
				this.$nextTick(() => {
					this.scrollToId = 'msg-' + (this.messages.length - 1)
				})
			},
			aiReply(text) {
				const replies = {
					'订单状态查询': '您可以在"我的订单"页面查看所有订单状态。每个订单会显示当前进度，包括待接单、配送中、已完成等状态。请问您想查询哪个订单？',
					'费用说明': '我们的定价标准如下：小型快递¥2起、中型快递¥3起、食堂代买¥3起。实际费用根据距离和重量等因素由接单时协商确定，下单时会显示预估费用。新用户前10单免服务费哦！',
					'投诉建议': '非常抱歉给您带来不好的体验！请详细描述您遇到的问题，包括订单编号、具体情况等，我们会尽快为您处理。您也可以拨打创作者电话19976889490或添加微信zy1118dh联系我们。',
					'如何下单': '下单步骤：1. 选择服务类型（快递代取/食堂代买等）；2. 填写取件地址和送达地址；3. 填写物品信息和备注；4. 提交订单并付款。简单四步即可完成！',
					'退款流程': '退款流程：1. 进入"我的订单"页面；2. 选择需要退款的订单；3. 点击"申请退款"按钮；4. 选择退款原因并提交；5. 等待客服审核；6. 审核通过后款项将原路退回。',
					'骑手认证': '成为骑手步骤：1. 在个人中心点击"切换到骑手端"；2. 完成实名认证（需上传身份证和学生证）；3. 等待平台审核（通常1-3个工作日）；4. 审核通过后即可开始接单。',
					'优惠券使用': '新用户注册即享10单免服务费优惠！下单时系统自动匹配可用优惠券，也可在确认订单页面手动选择。优惠券不可叠加使用，每单限用一张。',
					'支付问题': '如支付遇到问题：1. 检查银行卡余额是否充足；2. 确认网络连接正常；3. 尝试更换支付方式（微信/支付宝/银行卡）。如仍无法解决，请联系创作者电话19976889490或微信zy1118dh。'
				}
				
				let reply = replies[text]
				if (!reply) {
					const keywords = text.toLowerCase()
					if (keywords.includes('订单') || keywords.includes('状态') || keywords.includes('查询')) {
						reply = '您可以在"我的订单"页面查看所有订单状态，包括待接单、配送中、已完成等。请问您具体想了解什么？'
					} else if (keywords.includes('费用') || keywords.includes('价格') || keywords.includes('多少钱')) {
						reply = '我们的定价标准：小型快递¥2起、中型快递¥3起、食堂代买¥3起。实际费用根据距离和重量等因素确定。新用户前10单免服务费！'
					} else if (keywords.includes('退款') || keywords.includes('退钱')) {
						reply = '退款流程：进入"我的订单"→选择订单→点击"申请退款"→填写原因→提交审核→款项退回。如需人工帮助请联系创作者微信：zy1118dh'
					} else if (keywords.includes('投诉') || keywords.includes('差评') || keywords.includes('举报')) {
						reply = '非常抱歉给您带来不好的体验！请详细描述您遇到的问题，我们会尽快处理。您也可以直接拨打创作者电话19976889490联系我们。'
					} else if (keywords.includes('下单') || keywords.includes('怎么用') || keywords.includes('如何')) {
						reply = '下单步骤：1. 选择服务类型；2. 填写地址信息；3. 填写物品信息；4. 提交订单并付款。如需帮助请联系客服。'
					} else if (keywords.includes('骑手') || keywords.includes('跑腿') || keywords.includes('接单')) {
						reply = '成为骑手需完成实名认证（上传身份证和学生证），审核通过后即可接单。骑手收入按订单结算，完成订单后自动到账。'
					} else if (keywords.includes('支付') || keywords.includes('付款') || keywords.includes('余额')) {
						reply = '支付支持微信、支付宝、交通银行储蓄卡三种方式。如遇支付问题请联系创作者电话19976889490或微信zy1118dh。'
					} else if (keywords.includes('优惠券') || keywords.includes('优惠') || keywords.includes('折扣')) {
						reply = '新用户注册即享10单免服务费优惠！下单时系统自动匹配可用优惠券，每单限用一张，不可叠加。'
					} else if (keywords.includes('电话') || keywords.includes('微信') || keywords.includes('客服') || keywords.includes('联系')) {
						reply = '您可以通过以下方式联系我们：\n📞 创作者电话：19976889490\n💬 创作者微信：zy1118dh\n服务时间：9:00-22:00'
					} else {
						reply = '感谢您的咨询！我已经记录了您的问题。如果需要更详细的帮助，您可以联系人工客服（创作者电话：19976889490，创作者微信：zy1118dh），他们会尽快为您解答。'
					}
				}
				this.addMessage('ai', reply)
			},
			callPhone() {
				uni.makePhoneCall({
					phoneNumber: '19976889490',
					success: () => {
						this.showContactModal = false
					},
					fail: () => {
						uni.showToast({
							title: '拨打失败',
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background: #F5F8FA;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: #4A90D9;
		padding: 88rpx 28rpx 28rpx;
		display: flex;
		align-items: center;
		position: relative;
	}

	.back-btn {
		width: 64rpx;
		height: 64rpx;
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
		margin-right: 8rpx;
	}

	.header-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.header-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #fff;
	}

	.online-status {
		display: flex;
		align-items: center;
		margin-top: 6rpx;
	}

	.status-dot {
		width: 14rpx;
		height: 14rpx;
		background: #22C55E;
		border-radius: 50%;
		margin-right: 8rpx;
		box-shadow: 0 0 8rpx rgba(34, 197, 94, 0.5);
	}

	.status-text {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.85);
	}

	.header-action {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-more {
		width: 16rpx;
		height: 40rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			height: 8rpx;
			background: #fff;
			border-radius: 4rpx;
		}

		&::before { top: 4rpx; }
		&::after { bottom: 4rpx; }
	}

	.chat-area {
		flex: 1;
		padding: 24rpx 28rpx;
		height: 0;
	}

	.chat-list {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
		padding-bottom: 20rpx;
	}

	.message-item {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
	}

	.user-msg {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ai-avatar {
		background: linear-gradient(135deg, #4A90D9, #3672B0);
	}

	.user-avatar {
		background: linear-gradient(135deg, #9CA3AF, #6B7280);
	}

	.ai-icon {
		width: 36rpx;
		height: 36rpx;
		background: #fff;
		border-radius: 8rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 20rpx;
			height: 4rpx;
			background: #4A90D9;
			border-radius: 2rpx;
			box-shadow: 0 8rpx 0 #4A90D9, 0 -8rpx 0 #4A90D9;
		}
	}

	.user-icon {
		width: 28rpx;
		height: 28rpx;
		border: 4rpx solid #fff;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: -16rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 40rpx;
			height: 20rpx;
			border: 4rpx solid #fff;
			border-top: none;
			border-radius: 20rpx 20rpx 0 0;
		}
	}

	.msg-bubble {
		max-width: 70%;
		padding: 24rpx 28rpx;
		border-radius: 24rpx;
		position: relative;
		word-break: break-all;
	}

	.msg-bubble.ai {
		background: #fff;
		border-top-left-radius: 8rpx;
	}

	.msg-bubble.user {
		background: #4A90D9;
		border-top-right-radius: 8rpx;
	}

	.msg-content {
		font-size: 28rpx;
		line-height: 1.6;
		color: #374151;

		.user & {
			color: #fff;
		}
	}

	.quick-replies {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 20rpx;
	}

	.quick-item {
		padding: 12rpx 24rpx;
		background: #EFF6FF;
		border: 2rpx solid #4A90D9;
		border-radius: 32rpx;
		transition: all 0.2s;

		&:active {
			background: #4A90D9;
		}

		&:active .quick-text {
			color: #fff;
		}
	}

	.quick-text {
		font-size: 24rpx;
		color: #4A90D9;
	}

	.typing-bubble {
		padding: 28rpx 32rpx;
	}

	.typing-dots {
		display: flex;
		gap: 12rpx;
	}

	.dot {
		width: 12rpx;
		height: 12rpx;
		background: #9CA3AF;
		border-radius: 50%;
		animation: typing 1.4s infinite ease-in-out both;

		&.dot1 { animation-delay: -0.32s; }
		&.dot2 { animation-delay: -0.16s; }
	}

	@keyframes typing {
		0%, 80%, 100% {
			transform: scale(0.6);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.quick-questions {
		background: #fff;
		padding: 20rpx 0;
		border-top: 2rpx solid #F3F4F6;
	}

	.section-label {
		padding: 0 28rpx 16rpx;
	}

	.label-text {
		font-size: 24rpx;
		color: #9CA3AF;
		font-weight: 500;
	}

	.quick-scroll {
		white-space: nowrap;
	}

	.quick-list {
		display: inline-flex;
		gap: 20rpx;
		padding: 0 28rpx;
	}

	.quick-q-item {
		display: inline-flex;
		align-items: center;
		padding: 16rpx 24rpx;
		background: #F5F8FA;
		border-radius: 32rpx;
		flex-shrink: 0;
		transition: all 0.2s;

		&:active {
			background: #EFF6FF;
		}
	}

	.q-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 12rpx;
		border-radius: 8rpx;
		position: relative;

		&.icon-order {
			background: #EFF6FF;
			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 16rpx;
				height: 16rpx;
				border: 3rpx solid #4A90D9;
				border-radius: 3rpx;
			}
		}
		&.icon-money {
			background: #FEF3C7;
			&::after {
				content: '¥';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-size: 20rpx;
				font-weight: 700;
				color: #F59E0B;
			}
		}
		&.icon-complaint {
			background: #FEE2E2;
			&::after {
				content: '!';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -60%);
				font-size: 24rpx;
				font-weight: 700;
				color: #EF4444;
			}
		}
		&.icon-help {
			background: #F0FDF4;
			&::after {
				content: '?';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -60%);
				font-size: 24rpx;
				font-weight: 700;
				color: #22C55E;
			}
		}
		&.icon-refund {
			background: #FAF5FF;
			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 18rpx;
				height: 18rpx;
				border: 3rpx solid #A78BFA;
				border-radius: 50%;
				border-bottom-color: transparent;
				border-right-color: transparent;
			}
		}
	}

	.q-text {
		font-size: 26rpx;
		color: #374151;
		font-weight: 500;
	}

	.chat-input-bar {
		background: #fff;
		padding: 20rpx 28rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		border-top: 2rpx solid #F3F4F6;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}

	.contact-entry {
		width: 72rpx;
		height: 72rpx;
		background: #EFF6FF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon-phone {
		width: 28rpx;
		height: 28rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 6rpx;
		position: relative;
		transform: rotate(-15deg);

		&::after {
			content: '';
			position: absolute;
			top: -4rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 12rpx;
			height: 6rpx;
			background: #4A90D9;
			border-radius: 6rpx 6rpx 0 0;
		}
	}

	.chat-input {
		flex: 1;
		background: #F5F8FA;
		border-radius: 32rpx;
		padding: 20rpx 28rpx;
		font-size: 28rpx;
		color: #1F2937;
	}

	.input-placeholder {
		color: #9CA3AF;
	}

	.send-btn {
		padding: 20rpx 36rpx;
		background: #9CA3AF;
		border-radius: 32rpx;
		transition: all 0.2s;

		&.active {
			background: #4A90D9;
		}

		&:active {
			transform: scale(0.96);
		}
	}

	.send-text {
		font-size: 28rpx;
		font-weight: 600;
		color: #fff;
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 999;
	}

	.modal-content {
		width: 100%;
		background: #fff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 28rpx;
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

	.close-icon {
		width: 28rpx;
		height: 28rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 28rpx;
			height: 4rpx;
			background: #9CA3AF;
			border-radius: 2rpx;
		}

		&::before { transform: translate(-50%, -50%) rotate(45deg); }
		&::after { transform: translate(-50%, -50%) rotate(-45deg); }
	}

	.modal-body {
		padding: 28rpx;
	}

	.contact-card {
		display: flex;
		align-items: center;
		padding: 28rpx;
		background: #F5F8FA;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		transition: background 0.2s;

		&:active {
			background: #EFF6FF;
		}
	}

	.contact-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
		flex-shrink: 0;
	}

	.phone-icon {
		background: #EFF6FF;
		border: 3rpx solid #4A90D9;
		border-radius: 16rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%) rotate(-15deg);
			width: 28rpx;
			height: 28rpx;
			border: 3rpx solid #4A90D9;
			border-radius: 6rpx;
		}
	}

	.wechat-icon {
		background: #F0FDF4;
		border: 3rpx solid #22C55E;
		border-radius: 16rpx;
		position: relative;

		&::after {
			content: '微';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -55%);
			font-size: 28rpx;
			font-weight: 700;
			color: #22C55E;
		}
	}

	.contact-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.contact-label {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.contact-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.contact-action {
		padding: 16rpx 28rpx;
		background: #4A90D9;
		border-radius: 32rpx;
	}

	.action-text {
		font-size: 26rpx;
		font-weight: 600;
		color: #fff;
	}

	.service-time {
		text-align: center;
		margin-top: 16rpx;
	}

	.time-text {
		font-size: 24rpx;
		color: #9CA3AF;
	}
</style>
