# xmovie
h5移动端视频播放

后端服务基于 [xadmin-server](https://github.com/nineaiyu/xadmin-server) 开发

后台服务基于 [xadmin-client](https://github.com/nineaiyu/xadmin-client) 开发


### 在线预览
手机端打开 [https://xmovie.dvcloud.xin/](https://xmovie.dvcloud.xin/)

## docker 构建

修改 api 配置文件`.env.production`，将 api 域名修改为自己服务器，然后进行构建

```shell
docker compose up xmovie-h5-build
```

### docker 启动

```shell
docker compose up xmovie-h5-prod
```

### 或直接通过脚本构建
```shell
sh build.sh
```