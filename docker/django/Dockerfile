# FROM python:3

# RUN apt-get update \
# 	&& apt-get install -y --no-install-recommends \
# 		postgresql-client

# WORKDIR /usr/src/app
# COPY requirements.txt ./
# RUN pip install -r requirements.txt

# EXPOSE 8000
# # CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

FROM ubuntu:22.04

RUN apt-get update \
	&& apt-get install -y postgresql-client \
	python3 python3-venv python3-dev libpq-dev curl

EXPOSE 8000
