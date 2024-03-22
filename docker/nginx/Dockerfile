FROM nginx:latest

COPY conf/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/www/html

COPY tools/index.html /var/www/html

EXPOSE 80