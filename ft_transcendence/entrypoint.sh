#!/bin/sh

ls

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

python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input
python3 manage.py collectstatic --no-input

python3 manage.py runserver 0.0.0.0:8000