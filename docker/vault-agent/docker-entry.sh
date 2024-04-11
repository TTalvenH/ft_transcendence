#!/bin/bash

# Echo so we know the script has started

echo "Starting Vault Agent..."

# Start the Vault Agent in the background
vault agent -config=/etc/vault/agent/config.hcl &

wait

