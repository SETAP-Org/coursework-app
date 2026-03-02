#!/usr/bin/env sh

set -eu

psql -v ON_ERROR_STOP=1 -f ./db/index.sql
psql -v ON_ERROR_STOP=1 -d gcms -f ./db/schema.sql
psql -v ON_ERROR_STOP=1 -d gcms -f ./db/seed_dev.sql
