<template>
  <van-tabbar
    v-model="active"
    :placeholder="true"
    :route="true"
    :safe-area-inset-bottom="true"
    fixed
  >
    <van-tabbar-item
      v-for="(item, index) in tabbarData"
      :key="index"
      :icon="item.icon"
      :to="item.to"
    >
      {{ item.title }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";

const active = ref(0);
const tabbarData = reactive([
  {
    icon: "home-o",
    title: "主页",
    to: {
      name: "Home"
    }
  },
  {
    icon: "video-o",
    title: "影视",
    to: {
      name: "Film"
    }
  },
  {
    icon: "underway-o",
    title: "历史",
    to: {
      name: "History"
    }
  },
  {
    icon: "user-o",
    title: "我的",
    to: {
      name: "User"
    }
  }
]);
</script>
