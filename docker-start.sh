#!/bin/bash
set -e

# db
node db/init.js

# app
export NODE_ENV=production
exec node app.js
