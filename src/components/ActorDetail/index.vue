<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { getActorDetailApi } from "@/api/movie/actor";
import { getFilmDataApi } from "@/api/movie/home";

interface ActorResultType {
  avatar: string;
  birthday: string;
  name: string;
  foreign_name: string;
  introduction: string;
  sex: number;
}

interface Props {
  pk: string;
}

const props = withDefaults(defineProps<Props>(), {
  pk: ""
});

const actorDetail = ref<ActorResultType>();

const getActorDetail = (pk: string) => {
  getActorDetailApi(pk).then(res => {
    if (res.code === 1000) {
      actorDetail.value = res.data;
    }
  });
};
const FilmResult = ref([]);
const loading = ref(false);
const finished = ref(false);
const queryParams = reactive({
  ordering: "-created_time",
  name: "",
  actor: props.pk,
  page: 1,
  size: 10
});
const getData = () => {
  getFilmDataApi(queryParams).then(({ code, data }) => {
    if (code === 1000) {
      FilmResult.value = [...data.results];
      if (data.total === FilmResult.value.length) {
        finished.value = true;
      }
    }
    loading.value = false;
  });
};
onMounted(() => {
  getActorDetail(props.pk);
  getData();
});
</script>
<template>
  <van-back-top right="5vw" bottom="10vh" />
  <van-cell>
    <van-row class="text-left">
      <van-col :span="7">
        <van-image :src="actorDetail?.avatar" fit="cover" :radius="6" />
      </van-col>
      <van-col :span="14" offset="2">
        <van-row class="font-bold text-1xl">{{ actorDetail?.name }}</van-row>
        <van-row class="font-light">{{ actorDetail?.foreign_name }}</van-row>
        <van-row>生日：{{ actorDetail?.birthday }}</van-row>
        <van-row>性别：{{ actorDetail?.sex === 1 ? "女" : "男" }}</van-row>
      </van-col>
    </van-row>
    <van-row>
      <h3>简介</h3>
    </van-row>
    <van-row class="text-left">
      <van-col :span="24">
        <van-text-ellipsis
          rows="10"
          :content="actorDetail?.introduction"
          expand-text="展开"
          collapse-text="收起"
        />
      </van-col>
    </van-row>
  </van-cell>
  <van-cell>
    <van-row>
      <h3>相关影视作品</h3>
    </van-row>
  </van-cell>
  <van-list
    v-model:loading="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="getData"
  >
    <van-cell>
      <van-grid :gutter="10" :column-num="3">
        <film-card :data="FilmResult" />
      </van-grid>
    </van-cell>
  </van-list>
</template>
