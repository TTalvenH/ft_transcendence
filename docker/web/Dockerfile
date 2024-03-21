FROM	alpine:3.19

RUN addgroup -S nginx && 	\
	adduser -S -G nginx -g nginx nginx

RUN	apk update && apk upgrade && apk add  --no-cache \
		php				\
		php-mysqli		\
		php-fpm			\
		curl				\
		mariadb-client	\
		composer		\
		vim				\
		mariadb-client	\
		wget			
		
EXPOSE 9000


RUN	mkdir -p /run/php/ /var/www/html/wordpress/
COPY	conf/www.conf /etc/php82/php-fpm.d/www.conf

COPY	./tools/auto-config.sh /
RUN 	chmod +x auto-config.sh


ENTRYPOINT ["sh", "/auto-config.sh"]

		
