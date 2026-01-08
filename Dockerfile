# Use nginx alpine for a lightweight image
FROM nginx:alpine

# Copy the static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY styles/ /usr/share/nginx/html/styles/
COPY js/ /usr/share/nginx/html/js/

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8000
EXPOSE 8000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
