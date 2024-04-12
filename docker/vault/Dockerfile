FROM vault:1.9.0

ENV VAULT_DEV_ROOT_TOKEN_ID=myroot
ENV VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200


COPY my-policy.hcl /etc/vault/policies/my-policy.hcl
COPY docker-entry.sh /usr/local/bin/docker-entry.sh
RUN chmod +x /usr/local/bin/docker-entry.sh

EXPOSE 8200

ENTRYPOINT ["/usr/local/bin/docker-entry.sh"]