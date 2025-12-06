# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies needed for PostGIS (gdal) and building wheels
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    python3-gdal \
    build-essential

# Set the working directory
WORKDIR /usr/src/app

# Copy requirement files
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Run the app using gunicorn with increased timeout for Redis Cloud connection
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "120", "run:create_app()"]
