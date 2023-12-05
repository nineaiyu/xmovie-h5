<script setup lang="ts">
import { showNotify } from "vant";
import { useUserStore } from "@/store/modules/user";
import { onMounted, reactive, ref } from "vue";
import dayjs from "dayjs";
import { useDarkMode, useToggleDarkMode } from "@/hooks/useToggleDarkMode";
import {
  updateUserInfoPasswordApi,
  uploadUserInfoAvatarApi
} from "@/api/system/userinfo";
import "vant/es/notify/style";

interface UserInfo {
  username: string;
  avatar: string;
  nickname: string;
  email: string;
  last_login: string;
}

const userinfo = ref<UserInfo>();
const userStore = useUserStore();
const getUserData = () => {
  userStore.getUserInfo().then(res => {
    if (res.code === 1000) {
      userinfo.value = res.data;
    }
  });
};
onMounted(() => {
  getUserData();
});
const onClickRight = () => {
  useToggleDarkMode();
};

const afterRead = files => {
  const file = files[0];
  file.status = "uploading";
  file.message = "上传中...";
  const data = new FormData();
  data.append("file", file.file);
  uploadUserInfoAvatarApi({}, data).then(res => {
    if (res.code !== 1000) {
      file.status = "failed";
      file.message = "上传失败";
      showNotify({ type: "danger", message: res.detail });
    } else {
      file.status = "done";
      showNotify({ type: "success", message: "更新完成" });
      showAvatar.value = false;
      getUserData();
    }
  });
};
const showPassword = ref(false);
const showAvatar = ref(false);
const resetPassword = () => {
  updateUserInfoPasswordApi(password).then(res => {
    if (res.code === 1000) {
      showNotify({ type: "success", message: "修改成功" });
      password.old_password = "";
      password.sure_password = "";
    } else {
      showNotify({ type: "danger", message: res.detail });
    }
  });
};
const password = reactive({
  old_password: "",
  sure_password: ""
});
</script>
<template>
  <van-dialog
    v-model:show="showPassword"
    title="更新密码"
    show-cancel-button
    @confirm="resetPassword"
  >
    <van-form>
      <van-cell-group inset>
        <van-field
          v-model="password.old_password"
          type="password"
          label="旧密码"
          name="old"
          autocomplete="old-password"
        />
        <van-field
          v-model="password.sure_password"
          type="password"
          label="新密码"
          name="sure"
          autocomplete="sure-password"
        />
      </van-cell-group>
    </van-form>
  </van-dialog>
  <van-action-sheet v-model:show="showAvatar" title="更新头像">
    <van-cell>
      <van-row>
        <van-col :span="8" :offset="8">
          <file-upload
            v-if="showAvatar"
            :max-size="5"
            :max-count="1"
            :is-cutting="true"
            accept="image/*"
            @upload="afterRead"
          />
        </van-col>
      </van-row>
    </van-cell>
  </van-action-sheet>
  <van-cell-group inset>
    <van-cell>
      <van-row v-if="userinfo" class="text-left">
        <van-col :span="7">
          <van-image :src="userinfo.avatar" fit="cover" :radius="6" />
        </van-col>
        <van-col :span="16" :offset="1">
          <div class="font-bold">{{ userinfo.username }}</div>
          <div class="font-light">{{ userinfo.nickname }}</div>
          <div class="font-light">邮箱 {{ userinfo.email }}</div>
          <div>
            上次登录 {{ dayjs(userinfo.last_login).format("YYYY-MM-DD HH:mm") }}
          </div>
        </van-col>
      </van-row>
    </van-cell>
    <van-cell title="主题模式" class="mt-2" size="large">
      <svg-icon
        class="text-[18px]"
        :name="useDarkMode() ? 'light' : 'dark'"
        @click="onClickRight"
      />
    </van-cell>
    <van-cell
      title="修改头像"
      class="mt-2"
      size="large"
      is-link
      arrow-direction="down"
      @click="showAvatar = true"
    />
    <van-cell
      title="修改密码"
      class="mt-2"
      size="large"
      is-link
      arrow-direction="down"
      @click="showPassword = true"
    />

    <van-col class="mt-5">
      <van-button block plain @click="userStore.logOut()">注销登录</van-button>
    </van-col>
  </van-cell-group>
</template>
