<template>
  <van-space direction="vertical" class="text-center mt-5 w-full" :size="20">
    <van-image round width="10rem" height="10rem" :src="logo" />
    <h2 @click="useToggleDarkMode">
      爱看影院<svg-icon
        class="text-[18px]"
        :name="useDarkMode() ? 'light' : 'dark'"
      />
    </h2>
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
          v-if="isLogin"
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
        <van-field
          v-else
          v-model="loginForm.repeatPassword"
          :rules="[{ validator: repeatPasswordRule, message: '密码不一致' }]"
          center
          clearable
          label="确定密码"
          placeholder="请再次输入密码"
        />
      </van-cell-group>
      <div class="m-5">
        <van-button plain block type="primary" @click="handleLogin">
          {{ title[`${isLogin}`] }}
        </van-button>
      </div>
      <div class="m-5">
        <van-button plain block type="success" @click="isLogin = !isLogin">
          {{ title[`${!isLogin}`] }}
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
import logo from "@/assets/logo.png";
import { getTempTokenApi } from "@/api/system/auth";
import ReImageVerify from "@/components/ImageVerify/src/index.vue";
import "vant/es/notify/style";
import { useDarkMode, useToggleDarkMode } from "@/hooks/useToggleDarkMode";
const loginForm = reactive({
  username: "",
  password: "",
  token: "",
  captcha_key: "",
  captcha_code: "",
  repeatPassword: "",
  channel: "xmovie"
});
const user_store = useUserStore();
const redirect = ref();
const otherQuery = ref({});
const router = useRouter();
const route = useRoute();
const isLogin = ref(true);
const title = reactive({
  true: "登录",
  false: "注册"
});
const initToken = () => {
  getTempTokenApi().then(res => {
    if (res.code === 1000) {
      loginForm.token = res.token;
    }
  });
};
const repeatPasswordRule = value => {
  if (value === "") {
    return false;
  } else if (loginForm.password !== value) {
    return false;
  }
  return true;
};
const handleLogin = () => {
  if (isLogin.value) {
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
  } else {
    if (
      loginForm.username &&
      loginForm.password &&
      loginForm.password === loginForm.repeatPassword
    ) {
      user_store
        .registerByUsername(loginForm)
        .then(() => {
          showNotify({ type: "success", message: "注册成功" });
          router.push({ path: redirect.value || "/", query: otherQuery.value });
        })
        .catch(res => {
          showNotify({ type: "danger", message: res.detail });
          initToken();
        });
    } else {
      showNotify({ type: "warning", message: "注册失败" });
    }
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
