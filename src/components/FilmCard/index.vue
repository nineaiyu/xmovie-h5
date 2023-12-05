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
  channel_info: {
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
    class="mb-3"
    @click="goDetail(item.pk)"
  >
    <van-col>
      <van-badge
        position="bottom-right"
        color="rgba(101 ,38, 220,0)"
        :offset="['-5vw', '-6vw']"
      >
        <van-image :src="item.poster" fit="cover" :radius="6" />
        <template #content>
          <span style="font-size: 5vw; color: #f85008">{{ item.rate }}</span>
        </template>
      </van-badge>
    </van-col>
    <div class="w-full text-center">
      <van-text-ellipsis class="font-bold" :content="item.name" />
    </div>
    <div class="w-full text-center">
      <van-text-ellipsis
        class="font-light"
        :content="`${item?.channel_info[0]?.label} | ${item?.category_info[0]?.label}`"
      />
    </div>
  </van-grid-item>
</template>
<style scoped>
:deep(.van-grid-item__content) {
  padding: 0;
}

:deep(.van-badge) {
  border: none !important;
  border-radius: 0 !important;
}
</style>
