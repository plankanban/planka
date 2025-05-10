#!/bin/bash

# This script sets up symbolic links between the client dist files and the server directories

# Navigate to the root directory of the git repository
cd "$(git rev-parse --show-toplevel)" || { echo "Failed to navigate to the git repository root"; exit 1; }

# Store paths for the client dist, server public, and server views
CLIENT_PATH=$(pwd)/client/dist
SERVER_PUBLIC_PATH=$(pwd)/server/public
SERVER_VIEWS_PATH=$(pwd)/server/views

# Create symbolic links for the necessary client assets in the server's public and views directories
ln -s ${CLIENT_PATH}/favicon.ico ${SERVER_PUBLIC_PATH}/favicon.ico && echo "Linked favicon.ico successfully"
ln -s ${CLIENT_PATH}/logo192.png ${SERVER_PUBLIC_PATH}/logo192.png && echo "Linked logo192.png successfully"
ln -s ${CLIENT_PATH}/logo512.png ${SERVER_PUBLIC_PATH}/logo512.png && echo "Linked logo512.png successfully"
ln -s ${CLIENT_PATH}/manifest.json ${SERVER_PUBLIC_PATH}/manifest.json && echo "Linked manifest.json successfully"
ln -s ${CLIENT_PATH}/robots.txt ${SERVER_PUBLIC_PATH}/robots.txt && echo "Linked robots.txt successfully"
ln -s ${CLIENT_PATH}/assets ${SERVER_PUBLIC_PATH}/assets && echo "Linked assets folder successfully"
ln -s ${CLIENT_PATH}/index.html ${SERVER_VIEWS_PATH}/index.html && echo "Linked index.html successfully"

echo "Setup symbolic links completed successfully."
