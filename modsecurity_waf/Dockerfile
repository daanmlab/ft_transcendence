FROM ubuntu:latest

USER root

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    make \
    libtool \
    automake \
    autoconf \
    libpcre3-dev \
    zlib1g-dev \
    wget \
    git \
    pkg-config \
    sudo \
    nginx


# Copy and run the script
COPY script.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/script.sh
RUN /usr/local/bin/script.sh

RUN echo "load_module /usr/lib/nginx/modules/ngx_http_modsecurity_module.so;" >> /etc/nginx/nginx.conf

# Expose NGINX ports
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]

