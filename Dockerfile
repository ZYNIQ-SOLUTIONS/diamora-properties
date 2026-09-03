# Production Dockerfile for Diamora Properties Web Frontend
FROM nginx:alpine

# Install curl for healthchecking
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy static assets and HTML files
COPY index.html properties.html blog.html blog-post.html privacy.html terms.html aml.html cookies.html 404.html favicon.ico manifest.json robots.txt sitemap.xml /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/
COPY dashboard/ /usr/share/nginx/html/dashboard/
COPY branding/ /usr/share/nginx/html/branding/

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
