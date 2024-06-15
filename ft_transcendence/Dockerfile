# Start from the Python 3.11.4 Alpine image
FROM python:3.11.4-alpine

# Install necessary system dependencies including OpenSSL
RUN apk update && apk add --no-cache \
    openssl \
    postgresql-dev \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    libpq \
	libffi-dev

# Upgrade pip
RUN pip install --upgrade pip

# Copy the requirements file and install the Python dependencies
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# Copy the application code
COPY . /ft_transcendence

WORKDIR /ft_transcendence

# Make the entrypoint script executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose the application port
EXPOSE 8000

# Set the entrypoint
ENTRYPOINT [ "sh", "entrypoint.sh" ]
