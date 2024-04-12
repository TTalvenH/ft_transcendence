# Use the same Vault image as your Vault server
FROM vault:1.9.0

# Set a working directory
WORKDIR /etc/vault

# Set the VAULT_ADDR environment variable if your Vault server's address is static and known
# This can also be set in your config.hcl or provided as an environment variable at runtime
ENV VAULT_ADDR=http://vault-cont:8200

# Copy your Vault Agent configuration file into the container
RUN mkdir /etc/vault/agent/
COPY config.hcl /etc/vault/agent/config.hcl
RUN chmod 777 /etc/vault/agent/config.hcl
COPY docker-entry.sh /usr/local/bin/docker-entry.sh
RUN chmod +x /usr/local/bin/docker-entry.sh

ENTRYPOINT ["/usr/local/bin/docker-entry.sh"]


