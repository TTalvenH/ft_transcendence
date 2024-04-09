#!/bin/bash

# Target server URL
TARGET_URL="http://localhost:80"

# Common attack patterns
TESTS=(
    "' OR '1'='1"
    "<script>alert('XSS')</script>"
    "/etc/passwd"
    "../../etc/passwd"
    "phpinfo()"
)

# Loop through tests and make requests
for PAYLOAD in "${TESTS[@]}"; do
    echo "Testing payload: $PAYLOAD"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -G --data-urlencode "q=$PAYLOAD" "$TARGET_URL")
    if [ "$RESPONSE" = "403" ]; then
        echo "Payload blocked as expected (HTTP 403)"
    else
        echo "Payload not blocked (HTTP $RESPONSE)"
    fi
    echo
done
