<template>
	<view @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		props: {
			value: {
				type: Array,
				required: true
			},
			handle: {
				type: String,
				default: '.drag-handle'
			}
		},
		data() {
			return {
				dragging: false,
				startY: 0,
				dragIndex: -1,
				originalList: []
			};
		},
		computed: {
			list: {
				get() {
					return this.value;
				},
				set(value) {
					this.$emit('input', value);
				}
			}
		},
		methods: {
			onTouchStart(e) {
				const handle = e.target.closest(this.handle);
				if (!handle) return;

				const item = handle.closest('[draggable]');
				if (!item) return;

				this.dragging = true;
				this.startY = e.touches[0].clientY;
				this.dragIndex = Array.from(item.parentNode.children).indexOf(item);
				this.originalList = [...this.list];

				// 添加视觉反馈
				item.style.opacity = '0.5';
				item.style.transition = 'none';
			},
			onTouchMove(e) {
				if (!this.dragging) return;

				const y = e.touches[0].clientY;
				const deltaY = y - this.startY;

				if (Math.abs(deltaY)) {
					e.preventDefault();

					const items = this.$el.children;
					const dragItem = items[this.dragIndex];
					dragItem.style.transform = `translateY(${deltaY}px)`;

					// 计算新的索引位置
					const newIndex = this.calculateNewIndex(deltaY);
					if (newIndex !== this.dragIndex && newIndex >= 0 && newIndex < items.length) {
						// 交换数组元素
						const newList = [...this.list];
						const [removed] = newList.splice(this.dragIndex, 1);
						newList.splice(newIndex, 0, removed);
						this.list = newList;

						// 更新DOM
						this.$el.insertBefore(dragItem, items[newIndex]);
						this.dragIndex = newIndex;
					}
				}
			},
			calculateNewIndex(deltaY) {
				const itemHeight = this.$el.children[0].offsetHeight;
				return this.dragIndex + Math.round(deltaY / itemHeight);
			},
			onTouchEnd() {
				if (!this.dragging) return;
				this.dragging = false;

				const dragItem = this.$el.children[this.dragIndex];
				if (dragItem) {
					dragItem.style.opacity = '';
					dragItem.style.transform = '';
					dragItem.style.transition = 'all 0.3s';
				}

				// 如果顺序有变化，触发排序事件
				if (JSON.stringify(this.list) !== JSON.stringify(this.originalList)) {
					this.$emit('end');
				}
			}
		}
	};
</script>