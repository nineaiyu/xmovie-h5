<script lang="ts" setup>
import router from "@/router";
import { PropType } from "vue";

interface Detail {
  pk: string;
  poster: string;
  name: string;
  rate: string;
  category_info: {
    label: string;
  }[];
}

const props = defineProps({
  data: {
    type: Array as PropType<Detail[]>,
    default: () => []
  }
});

const goDetail = (pk: string) => {
  router.push({
    name: "Detail",
    params: { pk: pk }
  });
};
</script>
<template>
  <van-grid-item
    v-for="item in props.data"
    :key="item.pk"
    @click="goDetail(item.pk)"
  >
    <van-col>
      <van-image :src="item.poster" fit="cover" :radius="6" />
    </van-col>
    <div class="w-[90%] text-center">
      <van-text-ellipsis :content="item.name" />
    </div>
    <div class="w-[90%] text-center">
      {{ item?.category_info[0]?.label }} | {{ item.rate }}
    </div>
  </van-grid-item>
</template>
<style scoped>
:deep(.van-grid-item__content) {
  padding: 0;
}
</style>
