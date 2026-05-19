# Custom Planka image: official base + our backend modifications + rebuilt client.
#
# Stage 1: build the client with INDEX_FORMAT=ejs (the format Planka expects in production)
FROM node:22-alpine AS client-builder

WORKDIR /build

# Install build deps separately so npm install is cached
COPY client/package.json client/package-lock.json* ./
RUN npm install

# Copy the rest of the client source
COPY client/ ./

# Build to dist/
RUN INDEX_FORMAT=ejs npm run build


# Stage 2: official Planka image with our overlays
FROM ghcr.io/plankanban/planka:latest

# --- Backend overlays ---
# Models (List adds CATEGORY/STATUS types + labelId FK; Action/Board carry
# pre-existing customizations).
COPY server/api/models/Action.js /app/api/models/Action.js
COPY server/api/models/Board.js  /app/api/models/Board.js
COPY server/api/models/List.js   /app/api/models/List.js

# Card helpers — auto-apply category/status labels on create/move; keep the
# "Chamado finalizado em" custom field in sync with closed-list transitions.
COPY server/api/helpers/cards/create-one.js /app/api/helpers/cards/create-one.js
COPY server/api/helpers/cards/update-one.js /app/api/helpers/cards/update-one.js
COPY server/api/helpers/cards/sync-finalized-at.js /app/api/helpers/cards/sync-finalized-at.js

# List helpers — auto-create / rename / delete the list-linked label.
COPY server/api/helpers/lists/create-one.js /app/api/helpers/lists/create-one.js
COPY server/api/helpers/lists/update-one.js /app/api/helpers/lists/update-one.js
COPY server/api/helpers/lists/delete-one.js /app/api/helpers/lists/delete-one.js

# Card-label helpers (broadcast tweak for socket sync).
COPY server/api/helpers/card-labels/create-one.js /app/api/helpers/card-labels/create-one.js
COPY server/api/helpers/card-labels/delete-one.js /app/api/helpers/card-labels/delete-one.js

# Custom field value helper (action logging on update).
COPY server/api/helpers/custom-field-values/create-or-update-one.js /app/api/helpers/custom-field-values/create-or-update-one.js

# Card delete (Supabase soft-delete mirror).
COPY server/api/helpers/cards/delete-one.js /app/api/helpers/cards/delete-one.js

# Supabase mirror — write-side helper + npm dep installed into the image.
USER root
RUN cd /app && npm install --no-save --no-audit --no-fund @supabase/supabase-js@^2 && chown -R node:node /app/node_modules
USER node
COPY --chown=node:node server/utils/supabase.js /app/utils/supabase.js

# Auto-archive hook — moves cards out of "Concluído" lists into Archive after
# AUTO_ARCHIVE_CLOSED_AFTER_DAYS days (default 30, set 0 to disable).
COPY server/api/hooks/auto-archive/index.js /app/api/hooks/auto-archive/index.js
COPY server/api/hooks/query-methods/models/List.js /app/api/hooks/query-methods/models/List.js

# Migrations & seeds — required for the new list.label_id column and the
# default "Falar com o cliente" column on Design boards.
COPY server/db/migrations/ /app/db/migrations/
COPY server/db/seeds/      /app/db/seeds/

# --- Client overlays (table view, drag/drop, autocomplete, activity log,
#                      collapsed lists, hover-X label removal, list types) ---
COPY --from=client-builder /build/dist/assets/   /app/public/assets/
COPY --from=client-builder /build/dist/index.ejs /app/views/index.ejs
