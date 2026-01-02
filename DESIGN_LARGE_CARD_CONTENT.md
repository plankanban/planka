# Design Proposal: Large Card Content System (10GB+ Support)

## Executive Summary

This document proposes a scalable content storage system for Planka that:
- Supports **10GB+ content** per card (vs current 1MB limit)
- Separates **inline pasted images** from card description text
- Distinguishes **inline attachments** from user-uploaded attachments
- Provides **seamless migration** from the current base64-embedded system
- Maintains **backward compatibility** during transition

---

## Current Architecture Analysis

### Problem Statement

**Root Cause:** When users paste images into card descriptions, the MarkdownEditor converts them to base64 data URLs:

```javascript
// client/src/components/common/MarkdownEditor/MarkdownEditor.jsx:46-57
const fileUploadHandler = async (file) => {
  const base64Data = await fileToBase64Data(file);
  return { url: base64Data };  // Embeds as data:image/png;base64,...
};
```

**Limitations:**
1. **Size Bloat:** Base64 encoding increases image size by ~33%
2. **Database Constraints:** PostgreSQL `text` field limited to 1MB (enforced at API level)
3. **Performance Issues:** Large text fields slow down queries, serialization, and API responses
4. **No Deduplication:** Same image pasted multiple times = multiple embedded copies

**Current Storage:**
```
Card.description (PostgreSQL text, max 1MB)
├─ Markdown text
└─ Embedded base64 images: ![alt](data:image/png;base64,iVBORw0KG...)
```

---

## Proposed Architecture

### High-Level Design

```
Card Content System
├─ CardContent Model (new)
│  ├─ Stores large content in files (not database)
│  ├─ References inline attachments
│  └─ Maintains version history
│
├─ InlineAttachment Model (new)
│  ├─ Stores pasted images separately
│  ├─ Links to UploadedFile
│  └─ Marked as inline vs uploaded
│
└─ Card.description (existing)
   └─ Deprecated, used for migration only
```

### Database Schema Changes

#### 1. New Table: `card_content`

```sql
CREATE TABLE card_content (
  id BIGINT PRIMARY KEY DEFAULT next_id(),
  card_id BIGINT NOT NULL REFERENCES card(id) ON DELETE CASCADE,

  -- Content storage
  content_type TEXT NOT NULL DEFAULT 'markdown',  -- Future: 'html', 'json', etc.
  content_ref TEXT NOT NULL,                      -- File path or S3 key
  content_hash TEXT,                              -- SHA256 for deduplication

  -- Metadata
  size BIGINT NOT NULL,                           -- Size in bytes
  version INTEGER NOT NULL DEFAULT 1,             -- For version history
  encoding TEXT DEFAULT 'utf-8',

  -- Inline attachments metadata
  inline_attachment_ids BIGINT[],                 -- Array of inline attachment IDs

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

  UNIQUE(card_id, version)
);

CREATE INDEX idx_card_content_card_id ON card_content(card_id);
CREATE INDEX idx_card_content_hash ON card_content(content_hash);
```

#### 2. New Table: `inline_attachment`

```sql
CREATE TABLE inline_attachment (
  id BIGINT PRIMARY KEY DEFAULT next_id(),
  card_id BIGINT NOT NULL REFERENCES card(id) ON DELETE CASCADE,
  uploaded_file_id BIGINT NOT NULL REFERENCES uploaded_file(id) ON DELETE CASCADE,

  -- Distinguish from user uploads
  attachment_type TEXT NOT NULL DEFAULT 'inline',  -- 'inline' | 'uploaded'
  source TEXT NOT NULL DEFAULT 'paste',            -- 'paste' | 'drag-drop' | 'file-upload'

  -- Content reference (for markdown)
  content_id TEXT NOT NULL,                        -- Unique ID within card content
  alt_text TEXT,                                   -- Alt text for accessibility

  -- Position tracking (for ordering)
  position DOUBLE PRECISION,

  -- Usage tracking
  is_active BOOLEAN DEFAULT true,                  -- Still referenced in content?
  reference_count INTEGER DEFAULT 1,               -- How many times referenced

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

  UNIQUE(card_id, content_id)
);

CREATE INDEX idx_inline_attachment_card_id ON inline_attachment(card_id);
CREATE INDEX idx_inline_attachment_uploaded_file_id ON inline_attachment(uploaded_file_id);
CREATE INDEX idx_inline_attachment_type ON inline_attachment(attachment_type);
```

#### 3. Modified Table: `card`

```sql
-- Add migration tracking
ALTER TABLE card ADD COLUMN content_migrated BOOLEAN DEFAULT false;
ALTER TABLE card ADD COLUMN content_version INTEGER DEFAULT 0;

-- Index for migration queries
CREATE INDEX idx_card_content_migrated ON card(content_migrated) WHERE content_migrated = false;
```

#### 4. Modified Table: `attachment`

```sql
-- Add source tracking to existing attachments
ALTER TABLE attachment ADD COLUMN source TEXT DEFAULT 'upload';  -- 'upload' | 'inline'
ALTER TABLE attachment ADD COLUMN inline_attachment_id BIGINT REFERENCES inline_attachment(id);

CREATE INDEX idx_attachment_source ON attachment(source);
```

---

## Storage Strategy

### File Organization

```
{uploads_base_path}/
├─ attachments/           # Existing user uploads
├─ card-content/          # NEW: Card content files
│  ├─ {card_id}/
│  │  ├─ v1.md           # Version 1 content
│  │  ├─ v2.md           # Version 2 content
│  │  └─ current.md      # Symlink/copy of latest
│  └─ ...
└─ inline-attachments/    # NEW: Pasted images
   ├─ {uploaded_file_id}/
   │  ├─ {filename}
   │  └─ thumbnails/
   └─ ...
```

### Storage Backends

Leverage existing FileManager abstraction:

```javascript
// server/api/hooks/file-manager/index.js
class FileManager {
  // Add new methods
  async saveCardContent(cardId, content, version) {
    const path = `card-content/${cardId}/v${version}.md`;
    await this.save(path, Buffer.from(content, 'utf-8'));
    return path;
  }

  async readCardContent(contentRef) {
    const content = await this.read(contentRef);
    return content.toString('utf-8');
  }

  async saveInlineAttachment(uploadedFileId, filename, buffer) {
    const path = `inline-attachments/${uploadedFileId}/${filename}`;
    await this.save(path, buffer);
    return path;
  }
}
```

**Benefits:**
- Works with both LocalFileManager and S3FileManager
- No code duplication
- Same reliability and error handling

---

## Content Processing Flow

### 1. Pasting Images (Client-Side)

```javascript
// client/src/components/common/MarkdownEditor/MarkdownEditor.jsx

// BEFORE (current):
const fileUploadHandler = async (file) => {
  const base64Data = await fileToBase64Data(file);
  return { url: base64Data };  // ❌ Embeds in description
};

// AFTER (proposed):
const fileUploadHandler = async (file) => {
  // Upload to server as inline attachment
  const formData = new FormData();
  formData.append('file', file);
  formData.append('source', 'paste');  // Mark as pasted

  const response = await api.post(`/cards/${cardId}/inline-attachments`, formData);

  return {
    url: response.inlineAttachment.url,  // ✅ Server-hosted URL
    contentId: response.inlineAttachment.contentId
  };
};
```

### 2. Saving Card Content (Server-Side)

```javascript
// server/api/controllers/cards/update.js

async function updateCardContent(cardId, newContent) {
  // 1. Parse content to extract inline attachment references
  const inlineRefs = extractInlineAttachmentRefs(newContent);  // e.g., ![alt](inline://abc123)

  // 2. Save content to file storage
  const currentVersion = await CardContent.findOne({ cardId, version: { '>': 0 } })
    .sort('version DESC');
  const nextVersion = (currentVersion?.version || 0) + 1;

  const contentHash = crypto.createHash('sha256').update(newContent).digest('hex');
  const contentRef = await sails.helpers.fileManager.saveCardContent(
    cardId,
    newContent,
    nextVersion
  );

  // 3. Create CardContent record
  const cardContent = await CardContent.create({
    cardId,
    contentType: 'markdown',
    contentRef,
    contentHash,
    size: Buffer.byteLength(newContent, 'utf-8'),
    version: nextVersion,
    inlineAttachmentIds: inlineRefs.map(ref => ref.id)
  }).fetch();

  // 4. Update inline attachment reference counts
  await InlineAttachment.update(
    { cardId, contentId: { in: inlineRefs.map(r => r.contentId) } }
  ).set({ isActive: true, updatedAt: new Date() });

  // Mark unused inline attachments as inactive
  await InlineAttachment.update({
    cardId,
    contentId: { nin: inlineRefs.map(r => r.contentId) }
  }).set({ isActive: false, updatedAt: new Date() });

  // 5. Mark card as migrated
  await Card.updateOne({ id: cardId }).set({
    contentMigrated: true,
    contentVersion: nextVersion
  });

  return cardContent;
}
```

### 3. Loading Card Content (Server-Side)

```javascript
// server/api/controllers/cards/show.js

async function getCardWithContent(cardId) {
  const card = await Card.findOne({ id: cardId });

  let content;
  let inlineAttachments = [];

  if (card.contentMigrated) {
    // NEW SYSTEM: Load from file storage
    const cardContent = await CardContent.findOne({
      cardId,
      version: card.contentVersion
    });

    content = await sails.helpers.fileManager.readCardContent(
      cardContent.contentRef
    );

    inlineAttachments = await InlineAttachment.find({
      id: { in: cardContent.inlineAttachmentIds },
      isActive: true
    }).populate('uploadedFileId');

  } else {
    // OLD SYSTEM: Use description field
    content = card.description || '';
  }

  return {
    ...card,
    content,
    inlineAttachments,
    // Keep description for backward compatibility
    description: card.contentMigrated ? null : card.description
  };
}
```

---

## API Changes

### New Endpoints

#### 1. Upload Inline Attachment

```
POST /api/cards/:cardId/inline-attachments
Content-Type: multipart/form-data

Request:
{
  file: File,
  source: 'paste' | 'drag-drop',
  altText?: string,
  requestId?: string  // For idempotency
}

Response: 201 Created
{
  inlineAttachment: {
    id: 123,
    cardId: 456,
    contentId: 'img_abc123',  // Unique reference for markdown
    url: '/attachments/inline/789/image.png',
    thumbnailUrl: '/attachments/inline/789/thumbnails/cover-360.png',
    mimeType: 'image/png',
    size: 245678,
    width: 1920,
    height: 1080,
    altText: 'Screenshot',
    source: 'paste',
    createdAt: '2026-01-02T10:00:00Z'
  }
}
```

#### 2. List Inline Attachments

```
GET /api/cards/:cardId/inline-attachments

Response: 200 OK
{
  items: [
    {
      id: 123,
      contentId: 'img_abc123',
      url: '/attachments/inline/789/image.png',
      isActive: true,
      referenceCount: 2,
      ...
    }
  ]
}
```

#### 3. Get Card Content

```
GET /api/cards/:cardId/content

Response: 200 OK
{
  content: "# My Card\n\nHere's an image:\n\n![Screenshot](inline://img_abc123)",
  contentType: 'markdown',
  version: 5,
  size: 12345,
  inlineAttachments: [...],
  updatedAt: '2026-01-02T10:00:00Z'
}
```

#### 4. Update Card Content

```
PUT /api/cards/:cardId/content
Content-Type: application/json

Request:
{
  content: "# Updated content...",
  contentType: 'markdown'
}

Response: 200 OK
{
  cardContent: {
    version: 6,
    size: 23456,
    ...
  }
}
```

### Modified Endpoints

#### Update Card

```
PATCH /api/cards/:id

Request:
{
  // DEPRECATED: description (still works for backward compatibility)
  description: "Legacy field",

  // NEW: Use content field
  content: "New content system"
}

Response:
{
  card: {
    id: 123,
    name: 'Card Name',
    contentMigrated: true,
    contentVersion: 6,
    // description is null for migrated cards
    description: null,
    ...
  }
}
```

---

## Client-Side Changes

### 1. Content Protocol Handler

```javascript
// client/src/utils/contentProtocol.js

/**
 * Converts inline:// URLs to actual URLs
 * Example: inline://img_abc123 -> /api/attachments/inline/789/image.png
 */
export function resolveInlineUrls(content, inlineAttachments) {
  const attachmentMap = new Map(
    inlineAttachments.map(att => [att.contentId, att.url])
  );

  return content.replace(
    /inline:\/\/([\w-]+)/g,
    (match, contentId) => attachmentMap.get(contentId) || match
  );
}

/**
 * Converts actual URLs back to inline:// protocol
 * Example: /api/attachments/inline/789/image.png -> inline://img_abc123
 */
export function normalizeInlineUrls(content, inlineAttachments) {
  const urlMap = new Map(
    inlineAttachments.map(att => [att.url, att.contentId])
  );

  let normalized = content;
  urlMap.forEach((contentId, url) => {
    normalized = normalized.replace(
      new RegExp(escapeRegex(url), 'g'),
      `inline://${contentId}`
    );
  });

  return normalized;
}
```

### 2. Enhanced MarkdownEditor

```javascript
// client/src/components/common/MarkdownEditor/MarkdownEditor.jsx

const MarkdownEditor = ({ cardId, defaultValue, inlineAttachments, ... }) => {
  // Resolve inline:// URLs for display
  const displayContent = useMemo(
    () => resolveInlineUrls(defaultValue, inlineAttachments),
    [defaultValue, inlineAttachments]
  );

  const handleFileUpload = useCallback(async (file) => {
    // Upload as inline attachment
    const attachment = await api.uploadInlineAttachment(cardId, file, 'paste');

    return {
      url: `inline://${attachment.contentId}`,  // Use protocol
      alt: attachment.altText || file.name
    };
  }, [cardId]);

  const handleChange = useCallback((newContent) => {
    // Normalize URLs before sending to parent
    const normalized = normalizeInlineUrls(newContent, inlineAttachments);
    onChange(normalized);
  }, [onChange, inlineAttachments]);

  // ... rest of component
};
```

### 3. Attachment Management UI

```javascript
// client/src/components/CardModal/AttachmentsList.jsx

const AttachmentsList = ({ cardId }) => {
  const uploadedAttachments = useSelector(s => s.attachments.byCardId[cardId]);
  const inlineAttachments = useSelector(s => s.inlineAttachments.byCardId[cardId]);

  return (
    <div>
      <h3>Attachments</h3>
      {uploadedAttachments.map(att => (
        <AttachmentItem key={att.id} attachment={att} type="uploaded" />
      ))}

      <h3>Inline Images ({inlineAttachments.length})</h3>
      {inlineAttachments.map(att => (
        <AttachmentItem
          key={att.id}
          attachment={att}
          type="inline"
          isActive={att.isActive}
          referenceCount={att.referenceCount}
        />
      ))}
    </div>
  );
};
```

---

## Migration Strategy

### Phase 1: Deployment (Zero Downtime)

**Step 1:** Deploy database migrations
```bash
# Add new tables and columns
npm run db:migrate
```

**Step 2:** Deploy server code
- New endpoints available
- Old endpoints still work
- Auto-migration on card update

**Step 3:** Deploy client code
- Detects `contentMigrated` flag
- Uses new system for migrated cards
- Falls back to old system for unmigrated cards

### Phase 2: Background Migration

```javascript
// server/scripts/migrate-card-content.js

async function migrateCard(cardId) {
  const card = await Card.findOne({ id: cardId });

  if (card.contentMigrated || !card.description) {
    return { status: 'skipped' };
  }

  try {
    // 1. Extract base64 images from description
    const base64Images = extractBase64Images(card.description);

    // 2. Convert base64 images to inline attachments
    const inlineAttachments = await Promise.all(
      base64Images.map(async (img, index) => {
        const buffer = Buffer.from(img.data, 'base64');
        const filename = `pasted-image-${index + 1}.${img.ext}`;

        // Create UploadedFile
        const uploadedFile = await UploadedFile.create({
          type: 'attachment',
          mimeType: img.mimeType,
          size: buffer.length
        }).fetch();

        // Save to storage
        await sails.helpers.fileManager.saveInlineAttachment(
          uploadedFile.id,
          filename,
          buffer
        );

        // Create InlineAttachment
        const contentId = `img_${generateId()}`;
        const inlineAtt = await InlineAttachment.create({
          cardId: card.id,
          uploadedFileId: uploadedFile.id,
          attachmentType: 'inline',
          source: 'migration',
          contentId,
          position: index
        }).fetch();

        return { original: img.original, contentId, inlineAtt };
      })
    );

    // 3. Replace base64 with inline:// references
    let migratedContent = card.description;
    inlineAttachments.forEach(({ original, contentId }) => {
      migratedContent = migratedContent.replace(
        original,
        `![](inline://${contentId})`
      );
    });

    // 4. Save to new content system
    const contentHash = crypto.createHash('sha256')
      .update(migratedContent)
      .digest('hex');

    const contentRef = await sails.helpers.fileManager.saveCardContent(
      card.id,
      migratedContent,
      1
    );

    await CardContent.create({
      cardId: card.id,
      contentType: 'markdown',
      contentRef,
      contentHash,
      size: Buffer.byteLength(migratedContent, 'utf-8'),
      version: 1,
      inlineAttachmentIds: inlineAttachments.map(a => a.inlineAtt.id)
    });

    // 5. Mark as migrated
    await Card.updateOne({ id: card.id }).set({
      contentMigrated: true,
      contentVersion: 1
    });

    return {
      status: 'success',
      inlineAttachmentsCreated: inlineAttachments.length,
      sizeBefore: card.description.length,
      sizeAfter: migratedContent.length
    };

  } catch (error) {
    console.error(`Migration failed for card ${cardId}:`, error);
    return { status: 'error', error: error.message };
  }
}

// Batch migration
async function migrateAll() {
  const cards = await Card.find({
    contentMigrated: false,
    description: { '!=': null }
  });

  console.log(`Migrating ${cards.length} cards...`);

  for (const card of cards) {
    const result = await migrateCard(card.id);
    console.log(`Card ${card.id}: ${result.status}`);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

**Run migration:**
```bash
# Dry run
node server/scripts/migrate-card-content.js --dry-run

# Actual migration
node server/scripts/migrate-card-content.js

# Resume from failure
node server/scripts/migrate-card-content.js --resume
```

### Phase 3: Cleanup (After 100% Migration)

After all cards are migrated:

```sql
-- Remove deprecated column (optional)
ALTER TABLE card DROP COLUMN description;
ALTER TABLE card DROP COLUMN content_migrated;

-- Drop unused indexes
DROP INDEX idx_card_content_migrated;
```

---

## Performance Optimizations

### 1. Content Caching

```javascript
// server/api/services/CardContentCache.js

const NodeCache = require('node-cache');
const cache = new NodeCache({
  stdTTL: 600,  // 10 minutes
  checkperiod: 120
});

module.exports = {
  async getContent(cardId, version) {
    const key = `card:${cardId}:v${version}`;

    let content = cache.get(key);
    if (content) return content;

    const cardContent = await CardContent.findOne({ cardId, version });
    content = await sails.helpers.fileManager.readCardContent(
      cardContent.contentRef
    );

    cache.set(key, content);
    return content;
  },

  invalidate(cardId) {
    const keys = cache.keys().filter(k => k.startsWith(`card:${cardId}:`));
    cache.del(keys);
  }
};
```

### 2. Lazy Loading

```javascript
// Only load content when needed, not with every card fetch

// Before (loads all cards with descriptions):
GET /api/boards/:id
Response: { lists: [...], cards: [{ id, name, description: "..." }] }

// After (excludes content by default):
GET /api/boards/:id
Response: { lists: [...], cards: [{ id, name, hasContent: true }] }

// Explicit content fetch:
GET /api/cards/:id/content
Response: { content: "...", inlineAttachments: [...] }
```

### 3. Incremental Loading for Large Content

```javascript
// server/api/controllers/cards/get-content.js

async function getContent(req, res) {
  const { cardId } = req.params;
  const { offset = 0, limit = 1048576 } = req.query;  // Default 1MB chunks

  const cardContent = await CardContent.findOne({ cardId });

  if (cardContent.size > 10 * 1024 * 1024) {  // > 10MB
    // Stream large content
    const stream = await sails.helpers.fileManager.readStream(
      cardContent.contentRef,
      { start: offset, end: offset + limit }
    );

    return res.set({
      'Content-Type': 'text/markdown',
      'Content-Length': Math.min(limit, cardContent.size - offset),
      'X-Content-Total-Size': cardContent.size,
      'X-Content-Offset': offset
    }).send(stream);
  }

  // Regular load for smaller content
  const content = await sails.helpers.fileManager.readCardContent(
    cardContent.contentRef
  );

  return res.json({ content, size: cardContent.size });
}
```

### 4. Deduplication

```javascript
// server/api/controllers/inline-attachments/create.js

async function createInlineAttachment(req, res) {
  const file = req.file('file');
  const buffer = await file.toBuffer();

  // Calculate hash
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  // Check if already uploaded
  let uploadedFile = await UploadedFile.findOne({
    type: 'attachment',
    // Add hash field to UploadedFile model
    hash
  });

  if (!uploadedFile) {
    // New file, upload it
    uploadedFile = await processAndUploadFile(file, buffer, hash);
  } else {
    // Deduplicated! Just increment reference
    await UploadedFile.updateOne({ id: uploadedFile.id })
      .set({ referencesTotal: uploadedFile.referencesTotal + 1 });
  }

  // Create inline attachment reference
  const inlineAttachment = await InlineAttachment.create({
    cardId: req.params.cardId,
    uploadedFileId: uploadedFile.id,
    contentId: `img_${generateId()}`,
    source: req.body.source || 'paste'
  }).fetch();

  return res.json({ inlineAttachment });
}
```

---

## Security Considerations

### 1. Access Control

```javascript
// server/api/policies/canAccessCardContent.js

module.exports = async function(req, res, next) {
  const { cardId } = req.params;

  const card = await Card.findOne({ id: cardId })
    .populate('boardId');

  const isMember = await BoardMembership.count({
    boardId: card.boardId.id,
    userId: req.user.id
  });

  if (!isMember) {
    return res.forbidden('You do not have access to this card');
  }

  next();
};
```

### 2. Content Size Limits

```javascript
// server/config/policies.js

module.exports.policies = {
  'cards/update-content': ['isAuthenticated', 'canAccessCard', 'contentSizeLimit'],
  'inline-attachments/create': ['isAuthenticated', 'canAccessCard', 'fileSizeLimit']
};

// server/api/policies/contentSizeLimit.js
module.exports = async function(req, res, next) {
  const maxContentSize = 10 * 1024 * 1024 * 1024;  // 10GB

  const contentLength = parseInt(req.get('Content-Length') || '0', 10);

  if (contentLength > maxContentSize) {
    return res.status(413).json({
      error: 'Content too large',
      maxSize: maxContentSize,
      receivedSize: contentLength
    });
  }

  next();
};
```

### 3. Rate Limiting

```javascript
// Prevent abuse of inline attachment uploads

const rateLimit = require('express-rate-limit');

const inlineAttachmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 uploads per 15 minutes
  message: 'Too many inline attachments uploaded, please try again later'
});

app.post('/api/cards/:cardId/inline-attachments', inlineAttachmentLimiter, ...);
```

---

## Rollback Strategy

If issues arise, rollback is simple:

### 1. Server Rollback

```javascript
// Toggle feature flag
// server/config/custom.js
module.exports.custom = {
  enableLargeCardContent: false  // Disable new system
};

// In controllers
if (!sails.config.custom.enableLargeCardContent) {
  // Use old description-based system
}
```

### 2. Client Rollback

```javascript
// client/src/features/flags.js
export const FEATURES = {
  LARGE_CARD_CONTENT: false  // Disable client-side
};

// In components
if (!FEATURES.LARGE_CARD_CONTENT || !card.contentMigrated) {
  // Use old description field
}
```

### 3. Data Rollback

```javascript
// server/scripts/rollback-migration.js

async function rollbackCard(cardId) {
  const cardContent = await CardContent.findOne({ cardId, version: { '>': 0 } })
    .sort('version DESC');

  if (!cardContent) return;

  // Read content from file
  const content = await sails.helpers.fileManager.readCardContent(
    cardContent.contentRef
  );

  // Resolve inline:// URLs back to base64
  const inlineAttachments = await InlineAttachment.find({
    id: { in: cardContent.inlineAttachmentIds }
  }).populate('uploadedFileId');

  let rolledBackContent = content;
  for (const att of inlineAttachments) {
    const fileBuffer = await sails.helpers.fileManager.readInlineAttachment(
      att.uploadedFileId.id
    );
    const base64 = fileBuffer.toString('base64');
    const dataUrl = `data:${att.uploadedFileId.mimeType};base64,${base64}`;

    rolledBackContent = rolledBackContent.replace(
      `inline://${att.contentId}`,
      dataUrl
    );
  }

  // Restore description field
  await Card.updateOne({ id: cardId }).set({
    description: rolledBackContent,
    contentMigrated: false,
    contentVersion: 0
  });
}
```

---

## Testing Strategy

### 1. Unit Tests

```javascript
// server/test/unit/services/CardContentService.test.js

describe('CardContentService', () => {
  describe('createContent', () => {
    it('should save content to file storage', async () => {
      const content = '# Test\n\n![](inline://img_123)';
      const result = await CardContentService.create(cardId, content);

      expect(result.contentRef).toMatch(/card-content\/\d+\/v1\.md/);
      expect(result.size).toBe(Buffer.byteLength(content));
    });

    it('should extract inline attachment references', async () => {
      const content = '![](inline://img_1) and ![](inline://img_2)';
      const result = await CardContentService.create(cardId, content);

      expect(result.inlineAttachmentIds).toHaveLength(2);
    });
  });

  describe('migrateFromDescription', () => {
    it('should convert base64 images to inline attachments', async () => {
      const base64Desc = '# Test\n\n![](data:image/png;base64,iVBORw0KG...)';
      const result = await CardContentService.migrateFromDescription(
        cardId,
        base64Desc
      );

      expect(result.inlineAttachments).toHaveLength(1);
      expect(result.content).toMatch(/inline:\/\/img_\w+/);
    });
  });
});
```

### 2. Integration Tests

```javascript
// server/test/integration/controllers/cards/update-content.test.js

describe('PATCH /api/cards/:id/content', () => {
  it('should update card content and increment version', async () => {
    const newContent = '# Updated\n\nNew content here';

    const res = await request(app)
      .patch(`/api/cards/${cardId}/content`)
      .send({ content: newContent })
      .expect(200);

    expect(res.body.cardContent.version).toBe(2);
    expect(res.body.cardContent.size).toBe(Buffer.byteLength(newContent));
  });

  it('should handle 10GB content', async () => {
    const largeContent = 'x'.repeat(10 * 1024 * 1024 * 1024);  // 10GB

    const res = await request(app)
      .patch(`/api/cards/${cardId}/content`)
      .send({ content: largeContent })
      .expect(200);

    expect(res.body.cardContent.size).toBe(10 * 1024 * 1024 * 1024);
  });
});
```

### 3. Migration Tests

```javascript
// server/test/integration/migration/card-content.test.js

describe('Card Content Migration', () => {
  it('should migrate card with base64 images', async () => {
    const card = await Card.create({
      name: 'Test',
      description: '![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==)'
    }).fetch();

    const result = await migrateCard(card.id);

    expect(result.status).toBe('success');
    expect(result.inlineAttachmentsCreated).toBe(1);

    const migratedCard = await Card.findOne({ id: card.id });
    expect(migratedCard.contentMigrated).toBe(true);

    const inlineAtts = await InlineAttachment.find({ cardId: card.id });
    expect(inlineAtts).toHaveLength(1);
  });
});
```

### 4. Load Tests

```javascript
// test/load/card-content.load.js

const autocannon = require('autocannon');

// Test 1: Create cards with large content
autocannon({
  url: 'http://localhost:3000/api/cards',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Load Test Card',
    content: 'x'.repeat(100 * 1024 * 1024)  // 100MB
  }),
  connections: 10,
  duration: 60
});

// Test 2: Upload many inline attachments concurrently
autocannon({
  url: 'http://localhost:3000/api/cards/123/inline-attachments',
  method: 'POST',
  setupClient: (client) => {
    client.setBody(createRandomImageBuffer());
  },
  connections: 50,
  duration: 60
});
```

---

## Monitoring & Observability

### 1. Metrics

```javascript
// server/api/services/MetricsService.js

const prometheus = require('prom-client');

const contentSizeHistogram = new prometheus.Histogram({
  name: 'card_content_size_bytes',
  help: 'Card content size in bytes',
  buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600]  // 1KB - 100MB
});

const inlineAttachmentCounter = new prometheus.Counter({
  name: 'inline_attachments_created_total',
  help: 'Total number of inline attachments created',
  labelNames: ['source']  // paste, drag-drop, migration
});

const migrationStatusGauge = new prometheus.Gauge({
  name: 'cards_migrated_total',
  help: 'Number of cards migrated to new content system'
});

module.exports = {
  recordContentSize(size) {
    contentSizeHistogram.observe(size);
  },

  recordInlineAttachment(source) {
    inlineAttachmentCounter.inc({ source });
  },

  async updateMigrationStatus() {
    const count = await Card.count({ contentMigrated: true });
    migrationStatusGauge.set(count);
  }
};
```

### 2. Logging

```javascript
// server/api/services/CardContentLogger.js

module.exports = {
  logContentCreated(cardId, size, version) {
    sails.log.info('Card content created', {
      cardId,
      size,
      version,
      timestamp: new Date().toISOString()
    });
  },

  logMigrationError(cardId, error) {
    sails.log.error('Card migration failed', {
      cardId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  },

  logLargeContent(cardId, size) {
    if (size > 100 * 1024 * 1024) {  // > 100MB
      sails.log.warn('Large card content detected', {
        cardId,
        size,
        sizeFormatted: `${(size / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
};
```

### 3. Dashboards

Recommended Grafana dashboard panels:

1. **Content Size Distribution** (histogram)
2. **Inline Attachments Created** (counter over time)
3. **Migration Progress** (gauge: migrated vs total cards)
4. **Large Content Alerts** (> 1GB content size)
5. **Storage Usage** (total bytes stored in card-content/)
6. **API Latency** (p50, p95, p99 for content endpoints)

---

## Future Enhancements

### 1. Content Versioning & History

```javascript
// Enable full version history
GET /api/cards/:id/content/versions
Response: [
  { version: 3, size: 1234, createdAt: '2026-01-02T10:00:00Z' },
  { version: 2, size: 1200, createdAt: '2026-01-01T15:00:00Z' },
  { version: 1, size: 1100, createdAt: '2026-01-01T10:00:00Z' }
]

GET /api/cards/:id/content/versions/:version
Response: { content: "...", version: 2 }
```

### 2. Content Compression

```javascript
// Compress large content with gzip
const zlib = require('zlib');

async saveCardContent(cardId, content, version) {
  const compressed = await promisify(zlib.gzip)(content);
  const path = `card-content/${cardId}/v${version}.md.gz`;
  await this.save(path, compressed);
  return { path, compressed: true };
}
```

### 3. Rich Content Types

```javascript
// Support beyond markdown
{
  contentType: 'html',      // Rich HTML content
  contentType: 'json',      // Structured data
  contentType: 'prosemirror', // ProseMirror document
  contentType: 'slate'      // Slate.js document
}
```

### 4. Collaborative Editing

Integrate with CRDT libraries for real-time collaboration:

```javascript
// Using Yjs for collaborative editing
import * as Y from 'yjs';

const ydoc = new Y.Doc();
const ytext = ydoc.getText('content');

// Sync changes via WebSocket
```

### 5. Full-Text Search

```javascript
// Index content in Elasticsearch for advanced search
POST /api/search
{
  query: "project management",
  filters: {
    cardType: "project",
    hasImages: true
  }
}
```

---

## Summary

### Key Benefits

✅ **Scalability**: Support 10GB+ content (10,000x improvement)
✅ **Performance**: Lazy loading, caching, streaming for large content
✅ **Organization**: Clear separation between inline and uploaded attachments
✅ **Migration**: Automated migration with rollback capability
✅ **Compatibility**: Backward compatible during transition
✅ **Storage**: Works with both local filesystem and S3
✅ **Deduplication**: Reuse identical images to save storage

### Implementation Complexity

| Component | Complexity | Effort | Risk |
|-----------|------------|--------|------|
| Database Schema | Low | 2 days | Low |
| Server API | Medium | 5 days | Medium |
| Client UI | Medium | 4 days | Medium |
| Migration Script | Medium | 3 days | Medium |
| Testing | Medium | 3 days | Low |
| **Total** | **Medium** | **~3 weeks** | **Low-Medium** |

### Migration Path

1. **Week 1**: Database + Server implementation
2. **Week 2**: Client implementation + Testing
3. **Week 3**: Migration script + Rollout
4. **Week 4+**: Background migration + Monitoring

---

## Questions for Discussion

1. **Storage Backend**: Continue using local filesystem + S3, or add CDN support?
2. **Content Limits**: Is 10GB per card sufficient, or plan for higher?
3. **Versioning**: Keep all versions forever, or limit to last N versions?
4. **Migration Timeline**: Migrate all at once, or gradual rollout?
5. **UI/UX**: How should users see the difference between inline and uploaded attachments?

---

**Author**: Claude
**Date**: 2026-01-02
**Version**: 1.0
**Status**: Proposal - Awaiting Review
