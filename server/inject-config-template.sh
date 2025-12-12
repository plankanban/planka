#!/bin/bash
# Script to inject EJS template into index.html for runtime config

INDEX_HTML="$1"
OUTPUT_FILE="$2"

if [ ! -f "$INDEX_HTML" ]; then
  echo "Error: index.html not found at $INDEX_HTML"
  exit 1
fi

# Read the index.html file and inject the config script after <head>
awk '
/<head>/ {
    print
    print "    <script>"
    print "      window.PLANKA_CONFIG = {"
    print "        baseUrlPath: '\''<%= baseUrlPath %>'\'',"
    print "      };"
    print "    </script>"
    next
}
{ print }
' "$INDEX_HTML" > "$OUTPUT_FILE"

echo "Template created at $OUTPUT_FILE"
