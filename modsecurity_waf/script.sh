#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Download and compile ModSecurity
git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity
cd ModSecurity
git submodule init && git submodule update
./build.sh && ./configure
make && make install
cd ..

#Download and compile NGINX with ModSecurity
git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# Determine NGINX version
NGINX_VERSION=$(nginx -v 2>&1 | grep -oP '(?<=nginx/)[0-9.]+')
wget http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz
tar zxvf nginx-$NGINX_VERSION.tar.gz
cd nginx-$NGINX_VERSION

./configure --with-compat --add-dynamic-module=../ModSecurity-nginx
make modules

# Move the module to the appropriate directory
cp objs/ngx_http_modsecurity_module.so /usr/lib/nginx/modules/
cd ..

# Configure ModSecurity
mkdir -p /etc/nginx/modsec
cp modsec.conf /etc/nginx/modsec/modsecurity.conf

# Enable ModSecurity in NGINX
echo "load_module modules/ngx_http_modsecurity_module.so;" > /etc/nginx/nginx.conf
echo "include /etc/nginx/modsec/modsecurity.conf;" >> /etc/nginx/nginx.conf

# Test NGINX configuration
nginx -t

echo $NGINX_VERSION
