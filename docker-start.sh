#!/bin/bash
set -e
node db/init.js
exec node app.js --prod $@
