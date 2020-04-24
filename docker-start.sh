#!/bin/bash

node db/init.js \
  && node app.js --prod $@
