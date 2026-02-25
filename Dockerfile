FROM nginx:alpine
COPY lp1-pressel/ /usr/share/nginx/html/
EXPOSE 80
