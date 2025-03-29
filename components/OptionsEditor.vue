<template>
	<view class="options-editor" v-if="showOptions">
		<view class="option-item" v-for="(option, index) in options" :key="index">
			<input v-model="option.content" placeholder="输入选项内容" />
			<button @click="removeOption(index)">删除</button>
		</view>
		<button @click="addOption">添加选项</button>
	</view>
</template>

<script>
	export default {
		props: {
			options: Array,
			showOptions: Boolean
		},
		methods: {
			addOption() {
				this.options.push({
					id: null,
					content: ''
				});
			},
			removeOption(index) {
				this.options.splice(index, 1);
			}
		}
	};
</script>