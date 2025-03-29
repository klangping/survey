<template>
  <view>
    <button @click="testDB">测试数据库连接</button>
    <text>{{ result }}</text>
  </view>
</template>

<script>
import http from '@/api/http';

export default {
  data() {
    return {
      result: ''
    };
  },
  methods: {
    async testDB() {
      try {
        const res = await request({ url: '/test-db' });
        this.result = `数据库测试成功: ${res.data}`;
      } catch (error) {
        this.result = '数据库连接失败';
      }
    }
  }
};
</script>