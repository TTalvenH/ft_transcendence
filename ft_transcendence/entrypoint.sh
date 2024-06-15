#!/bin/sh

# Generate SSL certificates if they don't exist
SSL_CERT_DIR=/etc/ssl/certs
SSL_KEY_DIR=/etc/ssl/private
SSL_CERT_FILE=$SSL_CERT_DIR/ft_transcendence.crt
SSL_KEY_FILE=$SSL_KEY_DIR/ft_transcendence.key

if [ ! -f "$SSL_CERT_FILE" ] || [ ! -f "$SSL_KEY_FILE" ]; then
    mkdir -p $SSL_CERT_DIR $SSL_KEY_DIR
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout $SSL_KEY_FILE \
      -out $SSL_CERT_FILE \
      -subj "/C=FI/ST=FI/L=Helsinki/O=42/OU=42/CN=yourdomain.com"
    echo "SSL certificates generated."
else
    echo "SSL certificates already exist."
fi

# Wait for PostgreSQL to be ready
attempts=0
while ! PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; do
    attempts=$((attempts + 1))
    if [ $attempts -ge 12 ]; then
        echo "Failed to connect to the PostgreSQL database after $attempts attempts."
        exit 1
    fi
    echo "Attempt $attempts failed. Retrying in 5 seconds..."
    sleep 5
done
echo "Connected to the PostgreSQL database successfully."

# Apply migrations and collect static files
python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input
python3 manage.py collectstatic --no-input

# Run Django server with SSL
python3 manage.py runserver_plus --cert-file $SSL_CERT_FILE --key-file $SSL_KEY_FILE 0.0.0.0:8000
