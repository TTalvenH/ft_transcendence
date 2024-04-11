#!/bin/bash

# Enable the PKI Secrets Engine
vault secrets enable -path=pki pki

# Generate a new Root CA (adjust common_name and ttl as needed)
vault write pki/root/generate/internal \
  common_name="example.com" \
  ttl=87600h

# Set the URLs for the CA and CRL
vault write pki/config/urls \
  issuing_certificates="http://127.0.0.1:8200/v1/pki/ca" \
  crl_distribution_points="http://127.0.0.1:8200/v1/pki/crl"

# Configure a role for example.com domain (adjust parameters as needed)
vault write pki/roles/localhost \
  allowed_domains="localhost" \
  allow_subdomains=true \
  max_ttl="720h" \
  key_usage="DigitalSignature,KeyEncipherment" \
  organization="Example Organization" \
  ou="IT" \
  country="US" \
  locality="City" \
  province="State"

# Generate a certificate for www.example.com (adjust common_name and ttl)
vault write -format=json pki/issue/localhost\
  common_name="localhost" \
  ttl="720h" > localhost_cert.json

# Extract certificate, private key, and CA certificate from JSON output
jq -r '.data.certificate' < localhost_cert.json > localhost_cert.pem
jq -r '.data.private_key' < localhost_cert.json > localhost_key.pem
jq -r '.data.issuing_ca' < localhost_cert.json > ca_cert.pem

echo "Certificate, private key, and CA certificate have been saved."
