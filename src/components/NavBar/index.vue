<script lang="ts" setup>
import { useToggleDarkMode } from "@/hooks/useToggleDarkMode";

const onClickRight = () => {
  useToggleDarkMode();
};
const onClickLeft = () => {
  history.back();
};
</script>

<template>
  <van-notice-bar
    background="#ecf9ff"
    color="#1989fa"
    left-icon="volume-o"
    text="无论我们能活多久，我们能够享受的只有无法分割的此刻，此外别无其他。"
  />

  <!--  <van-nav-bar  placeholder @click-right="onClickRight" left-text="返回" left-arrow-->
  <!--               @click-left="onClickLeft">-->
  <!--    <template #right>-->
  <!--      <svg-icon class="text-[18px]" :name="useDarkMode() ? 'light' : 'dark'" />-->
  <!--    </template>-->
  <!--  </van-nav-bar>-->
</template>
