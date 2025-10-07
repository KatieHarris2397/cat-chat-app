# Database Dockerfile
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=catchat
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Set proper permissions for the init script
RUN chmod 644 /docker-entrypoint-initdb.d/init.sql

# Expose PostgreSQL port
EXPOSE 5432

