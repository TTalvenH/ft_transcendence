# Use an official Nginx image as a parent image
FROM nginx:latest

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
RUN apt-get update && \
    apt-get install -y git build-essential libpcre3 libpcre3-dev libssl-dev wget zlib1g-dev \
    libtool autoconf automake libxml2-dev && \
    apt-get clean

# Install ModSecurity
RUN rm -rf ModSecurity && \
    git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity && \
    cd ModSecurity && \
    git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && \
    make install


# Install Nginx connector for ModSecurity
RUN rm -rf ModSecurity-nginx && \
	git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git && \
    wget http://nginx.org/download/nginx-$(nginx -v 2>&1 | cut -d "/" -f2).tar.gz && \
    tar zxvf nginx-$(nginx -v 2>&1 | cut -d "/" -f2).tar.gz && \
    cd nginx-$(nginx -v 2>&1 | cut -d "/" -f2) && \
    ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
    make modules && \
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

RUN apt-get install git

# Clean up to reduce image size
RUN apt-get remove --purge -y build-essential libpcre3-dev libssl-dev zlib1g-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /ModSecurity /ModSecurity-nginx nginx-$(nginx -v 2>&1 | cut -d "/" -f2) nginx-$(nginx -v 2>&1 | cut -d "/" -f2).tar.gz

RUN cd /etc/nginx && \
	rm -rf coreruleset && \
    git clone https://github.com/coreruleset/coreruleset.git && \
    cd coreruleset && \
    cp crs-setup.conf.example crs-setup.conf && \
	mv rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf && \
	cat /etc/nginx/coreruleset/rules/*.conf > /etc/nginx/coreruleset/crs-rules.conf

COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf

RUN if [ -d "/usr/local/coreruleset" ]; then rm -rf /usr/local/coreruleset; fi && \
    mv /etc/nginx/coreruleset /usr/local/ && \
    mkdir -p /etc/nginx/modsec && \
    mv /usr/src/app/ModSecurity/unicode.mapping /etc/nginx/modsec/


# Copy configuration files
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/main.conf /etc/nginx/modsec/main.conf

# Create directories for ModSecurity
RUN mkdir -p /tmp/modsecurity/data \
    && mkdir -p /etc/modsecurity.d \
    && chown -R www-data:www-data /tmp/modsecurity \
    && chmod -R 755 /tmp/modsecurity

# Copy ModSecurity configuration files and rules into the container
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf


# (Other Dockerfile instructions)


# Expose the port Nginx is reachable on
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
