# Database Documentation

## Database Schema Diagram

This folder contains the automatically generated database schema documentation.

### Files

- **`database-schema.dbml`** - Database schema in DBML (Database Markup Language) format

### How to Visualize

#### Option 1: dbdiagram.io (Recommended)
1. Go to [dbdiagram.io](https://dbdiagram.io)
2. Click "Go to App"
3. Copy the contents of `database-schema.dbml`
4. Paste into the editor
5. The diagram will be generated automatically
6. You can export as PNG, PDF, or SQL

#### Option 2: VS Code Extension
Install the **DBML Viewer** extension in VS Code to view DBML files directly in the editor.

#### Option 3: CLI Tool
```bash
# Install dbdocs CLI
npm install -g dbdocs

# Generate and publish documentation
dbdocs build database-schema.dbml
```

### Regenerating the Diagram

Whenever you update your Prisma schema, regenerate the DBML file:

```bash
pnpm db:diagram
# or
pnpm db:generate
```

The DBML file will be automatically updated in this folder.

### Current Schema Overview

The database includes the following tables:

- **roles** - User roles (ADMIN, USER, MODERATOR)
- **users** - User accounts with authentication and verification
- **refresh_tokens** - JWT refresh tokens for session management

### Relationships

- Users belong to one Role (many-to-one)
- Users have many RefreshTokens (one-to-many, cascade delete)
