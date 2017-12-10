FROM nginx
#COPY ./conf /etc/nginx/conf.d/
#COPY ./dist /usr/share/nginx/html
#docker run --name some-nginx --rm  -p 8000:443 -p 8080:80  -v `pwd`/conf/:/etc/nginx/conf.d:ro -v `pwd`/dist:/usr/share/nginx/html se-content-nginx
