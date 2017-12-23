FROM nginx:alpine

# 设置配置
#COPY ./conf /etc/nginx/conf.d/

#COPY ./config/nginx/nginx.conf /etc/nginx/
COPY ./conf/nginx/conf.d /etc/nginx/conf.d/

# 设置资源
RUN mkdir /www
COPY ./dist /www
WORKDIR /www

# docker run --name some-nginx --rm  -p 443:443 -p 80:80  -v `pwd`/conf/:/etc/nginx/conf.d:ro -v `pwd`/dist:/usr/share/nginx/html blog-nginx:v1.0
# docker run --name some-nginx --rm  -p 443:443 -p 80:80 liushengyin/blog-nginx:0.0.0
