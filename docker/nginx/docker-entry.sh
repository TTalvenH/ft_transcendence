#!/bin/sh

# Echo so we know the script has started

echo "Starting Vault Agent..."

# Wait for  Vault to create ID's
wait 6

# Start the Vault Agent in the background
vault agent -config=/etc/vault/agent/config.hcl &

wait

