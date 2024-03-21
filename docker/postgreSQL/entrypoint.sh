#!/bin/bash

# Ensure the sessions directory exists and has correct permissions

mkdir -p /var/lib/pgadmin/sessions
chown -R pgadmin:pgadmin /var/lib/pgadmin/sessions

