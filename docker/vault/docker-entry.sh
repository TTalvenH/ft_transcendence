#!/bin/bash

# Start Vault in the background
vault server -dev -dev-root-token-id=myroot -dev-listen-address=0.0.0.0:8200 &

# Wait for Vault to start
sleep 3

# Export Vault address
export VAULT_ADDR='http://127.0.0.1:8200'

# Enable AppRole auth
vault auth enable approle

# Write the policy
vault policy write my-policy /etc/vault/policies/my-policy.hcl

# Create a role with the policy
vault write auth/approle/role/my-role \
    token_policies="my-policy" \
    secret_id_ttl=24h \
    token_ttl=1h \
    token_max_ttl=4h

# Retrieve and save the Role ID
vault read -field=role_id auth/approle/role/my-role/role-id > /etc/vault/role_id

# Retrieve and save the Secret ID
vault write -f -field=secret_id auth/approle/role/my-role/secret-id > /etc/vault/secret_id

# Print Role ID and Secret ID (Optional, for verification purposes)
echo "Role ID:"
cat /etc/vault/role_id
echo "Secret ID:"
cat /etc/vault/secret_id

# Keep the container running
wait
