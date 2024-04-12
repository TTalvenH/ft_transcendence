# Use an official Python runtime as a parent image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV VAULT_ADDR http://vault-agent-cont:8200
ENV VAULT_TOKEN myroot

# Set work directory
WORKDIR /code

# Install dependencies
COPY requirements.txt /code/
RUN pip install -r requirements.txt
RUN pip install hvac

# Copy project
COPY . /code/
