<template>
  <van-space direction="vertical" class="text-center mt-5 w-full" :size="20">
    <van-image round width="10rem" height="10rem" :src="logo" />
    <h2>爱看影院-注册会员</h2>
    <van-form @submit="handleRegister">
      <van-cell-group inset>
        <van-field
          v-model="registerForm.username"
          name="用户名"
          label="用户名"
          clearable
          border
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="registerForm.password"
          center
          clearable
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
        <van-field
          v-model="registerForm.repeatPassword"
          :rules="[{ validator: repeatPasswordRule, message: '密码不一致' }]"
          center
          clearable
          label="确定密码"
          placeholder="请再次输入密码"
        />
      </van-cell-group>
      <div class="m-5">
        <van-button plain block type="success" native-type="submit">
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
import logo from "@/assets/logo.png";
import { getTempTokenApi } from "@/api/system/auth";
import "vant/es/notify/style";
const registerForm = reactive({
  username: "",
  password: "",
  token: "",
  repeatPassword: "",
  channel: "xmovie"
});
const user_store = useUserStore();
const redirect = ref();
const otherQuery = ref({});
const router = useRouter();
const route = useRoute();
const initToken = () => {
  getTempTokenApi().then(res => {
    if (res.code === 1000) {
      registerForm.token = res.token;
    }
  });
};

const repeatPasswordRule = value => {
  if (value === "") {
    return false;
  } else if (registerForm.password !== value) {
    return false;
  }
  return true;
};

const handleRegister = () => {
  if (
    registerForm.username &&
    registerForm.password &&
    registerForm.password === registerForm.repeatPassword
  ) {
    user_store
      .registerByUsername(registerForm)
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
