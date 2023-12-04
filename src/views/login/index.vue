<template>
  <!--  <van-watermark content="合合交友" />-->
  <van-space direction="vertical" class="text-center mt-5 w-full" :size="20">
    <van-image round width="10rem" height="10rem" :src="logo" />
    <h2>爱看影院</h2>
    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="loginForm.username"
          name="用户名"
          label="用户名"
          clearable
          border
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="loginForm.password"
          center
          clearable
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
        <van-field
          v-model="loginForm.captcha_code"
          center
          clearable
          label="验证码"
          placeholder="请输入图片验证码"
          :rules="[{ required: true, message: '请填写验证码' }]"
        >
          <template #button>
            <ReImageVerify v-model:code="loginForm.captcha_key" />
          </template>
        </van-field>
      </van-cell-group>
      <div class="m-5">
        <van-button plain block type="primary" native-type="submit">
          登录
        </van-button>
      </div>
      <div class="m-5">
        <van-button plain block type="success" @click="goRegister">
          注册
        </van-button>
      </div>
    </van-form>
  </van-space>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { showNotify } from "vant";
import logo from "@/assets/20231203133640.png";
import { getTempTokenApi } from "@/api/system/auth";
import ReImageVerify from "@/components/ImageVerify/src/index.vue";
import "vant/es/notify/style";
const loginForm = reactive({
  username: "",
  password: "",
  token: "",
  captcha_key: "",
  captcha_code: ""
});
const user_store = useUserStore();
const redirect = ref();
const otherQuery = ref({});
const router = useRouter();
const route = useRoute();
const initToken = () => {
  getTempTokenApi().then(res => {
    if (res.code === 1000) {
      loginForm.token = res.token;
    }
  });
};

const handleLogin = () => {
  if (loginForm.username && loginForm.password) {
    user_store
      .loginByUsername(loginForm)
      .then(() => {
        showNotify({ type: "success", message: "登录成功" });
        router.push({ path: redirect.value || "/", query: otherQuery.value });
      })
      .catch(res => {
        showNotify({ type: "danger", message: res.detail });
        initToken();
      });
  } else {
    showNotify({ type: "warning", message: "手机号或验证码不存在" });
  }
};

const goRegister = () => {
  router.push({ name: "Register" });
};

const getOtherQuery = (query: any) => {
  return Object.keys(query).reduce((acc: any, cur) => {
    if (cur !== "redirect") {
      acc[cur] = query[cur];
    }
    return acc;
  }, {});
};
watch(route, () => {
  const query = route.query;
  if (query) {
    redirect.value = query.redirect;
    otherQuery.value = getOtherQuery(query);
  }
});
onMounted(() => {
  initToken();
});
</script>
