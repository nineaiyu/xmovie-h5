<script lang="ts" setup>
defineOptions({
  name: "Err404"
});
</script>

<template>
  <div class="flex justify-center items-center h-[60vh]">
    <van-empty description="访问内容不存在" image="network" />
  </div>
</template>
