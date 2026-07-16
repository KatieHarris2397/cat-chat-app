# Nexlayer working build fix

This file is the authoritative, pinned build solution for this repo. Nexlayer uses it verbatim on every run and will not override it. If a future build with this fix fails, Nexlayer appends/updates it rather than regenerating.

## Fixed Dockerfile

```dockerfile
FROM mirror.gcr.io/library/node:18-alpine AS build
WORKDIR /app

# Copy manifests first for caching
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source
COPY frontend/ ./

# Build the React app
RUN npm run build

FROM mirror.gcr.io/library/nginx:alpine

# The build log explicitly showed 'build/static/js/main...' which confirms 
# that 'create-react-app' (CRA) is being used, and it outputs to 'build/', not 'dist/'.
COPY --from=build /app/build /usr/share/nginx/html

# Configure Nginx to handle React Router client-side routing
# Using a simple RUN command to avoid complex multi-line parsing issues
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
