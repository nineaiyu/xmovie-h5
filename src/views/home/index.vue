<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { getHomeDataApi } from "@/api/movie/home";
import router from "@/router";

defineOptions({
  name: "Home"
});
const loading = ref(false);
const swipeResult = ref();
const FilmResult = ref();

const getData = () => {
  loading.value = true;
  getHomeDataApi({}).then(res => {
    if (res.code === 1000) {
      swipeResult.value = res.swipe;
      FilmResult.value = res.film;
    }
    loading.value = false;
  });
};

onMounted(() => {
  getData();
});
const goPath = (path: string) => {
  router.push({
    path: path
  });
};
</script>

<template>
  <van-back-top bottom="10vh" right="5vw" />
  <van-pull-refresh v-model="loading" @refresh="getData">
    <van-swipe
      :autoplay="3000"
      class="ml-4 mr-4 mt-2"
      indicator-color="white"
      lazy-render
    >
      <van-swipe-item
        v-for="item in swipeResult"
        :key="item.pk"
        @click="goPath(item.route)"
      >
        <van-image :src="item.picture" radius="6" />
      </van-swipe-item>
    </van-swipe>
    <van-loading v-if="loading" />
    <van-cell-group
      v-for="result in FilmResult"
      :key="result.title"
      :title="result.title"
    >
      <van-cell>
        <van-grid :column-num="3" :gutter="10">
          <film-card :data="result.data" />
        </van-grid>
      </van-cell>
    </van-cell-group>
  </van-pull-refresh>
</template>

<style scoped>
:deep(.van-grid-item__content) {
  padding: 0;
}
</style>
