FROM dpage/pgadmin4:latest

COPY entrypoint.sh /entrypoint.sh
RUN ls -la /

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
