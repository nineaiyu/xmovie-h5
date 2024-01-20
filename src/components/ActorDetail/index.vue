<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { getActorDetailApi } from "@/api/movie/actor";
import { getFilmDataApi } from "@/api/movie/film";

interface ActorResultType {
  pk: number;
  who: string;
  actor: {
    pk: string;
    avatar: string;
    birthday: string;
    name: string;
    foreign_name: string;
    introduction: string;
    sex: number;
  };
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
    if (res.code === 1000 && res.data.results.length === 1) {
      actorDetail.value = res.data.results[0];
      queryParams.actor = actorDetail.value.actor.pk;
      getData();
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
      FilmResult.value = [...FilmResult.value, ...data.results];
      finished.value = data.total === FilmResult.value.length;
    }
    loading.value = false;
  });
};
onMounted(() => {
  getActorDetail(props.pk);
  finished.value = true;
});

const onLoad = () => {
  queryParams.page += 1;
  getData();
};
</script>
<template>
  <van-back-top bottom="10vh" right="5vw" />
  <van-cell>
    <van-row class="text-left">
      <van-col :span="7">
        <van-image :radius="6" :src="actorDetail?.actor?.avatar" fit="cover" />
      </van-col>
      <van-col :span="14" offset="2">
        <van-row class="font-bold text-1xl">{{
          actorDetail?.actor?.name
        }}</van-row>
        <van-row class="font-light">{{
          actorDetail?.actor?.foreign_name
        }}</van-row>
        <van-row>生日：{{ actorDetail?.actor?.birthday }}</van-row>
        <van-row
          >性别：{{ actorDetail?.actor?.sex === 1 ? "女" : "男" }}</van-row
        >
        <van-row>饰演：{{ actorDetail?.who }}</van-row>
      </van-col>
    </van-row>
    <van-row>
      <h3>简介</h3>
    </van-row>
    <van-row class="text-left">
      <van-col :span="24">
        <van-text-ellipsis
          :content="actorDetail?.actor?.introduction"
          collapse-text="收起"
          expand-text="展开"
          rows="10"
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
    @load="onLoad"
  >
    <van-cell>
      <van-grid :column-num="3" :gutter="10">
        <film-card :data="FilmResult" />
      </van-grid>
    </van-cell>
  </van-list>
</template>
