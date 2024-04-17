#!/bin/sh

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
vault read -field=role_id auth/approle/role/my-role/role-id > /etc/vault/vault-id/role_id

# Retrieve and save the Secret ID
vault write -f -field=secret_id auth/approle/role/my-role/secret-id > /etc/vault/vault-id/secret_id

# Generate SSL certs
vault secrets enable pki

# new root CA, not usual for production, would use intermediate cert instead
vault write pki/root/generate/internal \
    common_name="rootCert" \
    ttl=87600h

vault write pki/config/urls \
issuing_certificates="http://vault.example.com:8200/v1/pki/ca" \
crl_distribution_points="http://vault.example.com:8200/v1/pki/crl"

vault write pki/roles/client-cert \
    allowed_domains="client.example.com" \
    allow_subdomains=true \
    max_ttl="72h"

vault write pki/issue/client-cert \
    common_name="client1.client.example.com"





# Keep the container running
wait