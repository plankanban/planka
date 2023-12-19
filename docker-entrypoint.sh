#!/bin/bash
set -e

for i in $(seq 1 30); do
  echo "Attempting to initialize the database and start the Planka (attempt $i)..."
  node db/init.js &&
  exec node app.js --prod "$@" &&
  break || s=$?;
  echo "Failed (attempt $i). Waiting 5 seconds before the next attempt...";
  sleep 5;
done

exit $s