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
RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity && \
    cd ModSecurity && \
    git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && \
    make install

# Install Nginx connector for ModSecurity
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git && \
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
    git clone https://github.com/coreruleset/coreruleset.git && \
    cd coreruleset && \
    cp crs-setup.conf.example crs-setup.conf && \
	cat /etc/nginx/coreruleset/rules/*.conf > /etc/nginx/coreruleset/crs-rules.conf




# COPY modsecurity.conf /etc/modsecurity.d/modsecurity.conf

# Copy your Nginx configuration files
COPY conf/nginx.conf /etc/nginx/nginx.conf

# RUN chmod 644 /etc/modsecurity.d/modsecurity.conf


# Expose the port Nginx is reachable on
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
