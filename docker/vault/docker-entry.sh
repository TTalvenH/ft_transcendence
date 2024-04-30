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

vault secrets enable database

vault write database/config/my-postgresql-database \
    plugin_name=postgresql-database-plugin \
    allowed_roles="user-specific-role" \
    connection_url="postgresql://{{username}}:{{password}}@postgres-cont:5432/mydatabase?sslmode=disable" \
    username="postgres" \
    password="your_postgres_password"

vault write database/roles/user-specific-role \
    db_name=my-postgresql-database \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\"; ALTER ROLE \"{{name}}\" SET row_security = ON;" \
    default_ttl="1h" \
    max_ttl="24h"

vault read database/creds/user-specific-role


# # Generate SSL certs
# vault secrets enable pki

# # new root CA, not usual for production, would use intermediate cert instead
# vault write pki/root/generate/internal \
#     common_name="rootCert" \
#     ttl=87600h

# vault write pki/config/urls \
# issuing_certificates="localhost:8200/v1/pki/ca" \
# crl_distribution_points="localhost:8200/v1/pki/crl"

# vault write pki/roles/client-cert \
#     allowed_domains="localhost" \
#     allow_subdomains=true \
#     max_ttl="72h"

# mkdir vault/certs

# vault write -format=json pki/issue/client-cert common_name="localhost" | jq -r '.data.issuing_ca' > vault/certs/issuing-ca.pem

# vault write -format=json pki/issue/client-cert \
#     common_name="localhost" \
#     format="pem" \
#     private_key_format="pem" \
#     exclude_cn_from_sans=true \
#     ttl="72h" \
#     | jq -r '.data.private_key, .data.certificate' > vault/certs/client-cert-and-key.pem



# Keep the container running
wait