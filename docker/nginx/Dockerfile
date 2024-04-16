# # Use an official Nginx base image with Vault binaries installed
# FROM nginx:latest

# # Set working directory for the build process
# WORKDIR /usr/src/app

# # Install dependencies for building ModSecurity and tools for Vault
# RUN apt-get update && \
#     apt-get install -y wget git build-essential libpcre3 libpcre3-dev libssl-dev zlib1g-dev \
#     libtool autoconf automake libxml2-dev jq curl && \
#     apt-get clean

# # Install ModSecurity
# RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity && \
#     cd ModSecurity && \
#     git submodule init && \
#     git submodule update && \
#     ./build.sh && \
#     ./configure && \
#     make && \
#     make install

# # Install Nginx connector for ModSecurity
# RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git && \
#     wget http://nginx.org/download/nginx-$(nginx -v 2>&1 | cut -d "/" -f2).tar.gz && \
#     tar zxvf nginx-$(nginx -v 2>&1 | cut -d "/" -f2).tar.gz && \
#     cd nginx-$(nginx -v 2>&1 | cut -d "/" -f2) && \
#     ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
#     make modules && \
#     cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

# # Cleanup to reduce image size
# RUN apt-get remove --purge -y build-essential libpcre3-dev libssl-dev zlib1g-dev && \
#     apt-get autoremove -y && \
#     rm -rf /var/lib/apt/lists/* /ModSecurity /ModSecurity-nginx nginx-$(nginx -v 2>&1 | cut -d "/" -f2) nginx-$(nginx -v 2>&1 | cut -d "/" -f2).tar.gz

# # Setup CoreRuleSet for ModSecurity
# COPY coreruleset /etc/nginx/coreruleset
# COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
# COPY main.conf /etc/nginx/modsec/main.conf

# # Create directories and set permissions for ModSecurity
# RUN mkdir -p /etc/nginx/modsec /tmp/modsecurity/data /etc/modsecurity.d && \
#     mv /usr/src/app/ModSecurity/unicode.mapping /etc/nginx/modsec/ && \
#     chown -R www-data:www-data /tmp/modsecurity && \
#     chmod -R 755 /tmp/modsecurity

# # Set the environment variable for the Vault address
# ENV VAULT_ADDR=http://vault-cont:8200

# # Copy configuration files and scripts
# COPY nginx.conf /etc/nginx/nginx.conf
# COPY docker-entry.sh /usr/local/bin/
# COPY config.hcl /etc/vault/agent/
# RUN chmod +x /usr/local/bin/docker-entry.sh

# # Expose HTTP and HTTPS ports
# EXPOSE 80 443

# # Set entrypoint and command to run both Vault Agent and Nginx
# ENTRYPOINT ["/usr/local/bin/docker-entry.sh"]
# CMD ["nginx", "-g", "daemon off;"]


#just vault and nginx

# Use an official Nginx base image
FROM nginx:latest

# Set working directory for the build process
WORKDIR /usr/src/app

# Install essential packages for running Vault
RUN apt-get update && \
    apt-get install -y wget unzip jq curl && \
    apt-get clean

# Download and install Vault
ARG VAULT_VERSION=1.9.0
RUN wget https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip && \
    unzip vault_${VAULT_VERSION}_linux_amd64.zip && \
    mv vault /usr/local/bin/ && \
    rm vault_${VAULT_VERSION}_linux_amd64.zip

# Set the environment variable for the Vault address
ENV VAULT_ADDR=http://vault-cont:8200

# Copy configuration files and scripts
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY docker-entry.sh /usr/local/bin/
COPY config.hcl /etc/vault/agent/
RUN chmod +x /usr/local/bin/docker-entry.sh

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Set entrypoint and command to run both Vault Agent and Nginx
ENTRYPOINT ["/usr/local/bin/docker-entry.sh"]
CMD ["nginx", "-g", "daemon off;"]
