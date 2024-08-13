#!/bin/sh

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Start the server
python manage.py runserver 0.0.0.0:8000