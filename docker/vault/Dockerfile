FROM vault:latest

ENV VAULT_DEV_ROOT_TOKEN_ID=myroot
ENV VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200
ENV VAULT_ADDR='http://127.0.0.1:8200'

COPY my-policy.hcl /etc/vault/policies/my-policy.hcl
EXPOSE 8200

ENTRYPOINT ["vault", "server", "-dev"]
