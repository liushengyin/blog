#!/bin/bash

set -e

# 设置镜像名
IMAGE_NAME="blog-nginx"

# 设置镜像版本
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")

# 测试应用
# echo --------- Test app
# ng test --code-coverage

# 打包应用 这种打包环境是在本地进行打包，也可以将打包过程放到镜像的构建过程
echo --------- Building app
ng build --prod --build-optimizer

# 打包应用镜像
echo --------- Building image
docker build . -t liushengyin/$IMAGE_NAME:$PACKAGE_VERSION -t liushengyin/$IMAGE_NAME:latest -t $IMAGE_NAME:$PACKAGE_VERSION

# 运行镜像
#echo --------- Run image
# docker run --name some-nginx --rm  -p 443:443 -p 80:80 blog-nginx

# 发布到云端
echo --------- Pushing image
docker push liushengyin/$IMAGE_NAME:$PACKAGE_VERSION;
echo --------- Done!
