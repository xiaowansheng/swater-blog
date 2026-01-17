# Database Migration Tool

A powerful web-based database migration tool that allows you to migrate data between different databases with a user-friendly interface.

## Features

- **Multiple Database Support**: MySQL, PostgreSQL (extensible to SQL Server, Oracle)
- **Visual Configuration**: Web-based interface for configuring migrations
- **Field Mapping**: Map fields between source and target tables
- **Data Transformation**: Apply transformations to data during migration
- **Batch Processing**: Efficient batch processing for large datasets
- **Progress Monitoring**: Real-time progress tracking and detailed logs
- **Flexible Migration Options**: Delete before insert, custom batch sizes, etc.

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- MySQL or PostgreSQL database

## Installation

1. Navigate to the project directory:
```bash
cd blog-tools/db-migrate
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database URL:
```env
DATABASE_URL="file:./dev.db"
```

4. Generate Prisma client:
```bash
pnpm run db:generate
# or
npm run db:generate
```

5. Run database migrations:
```bash
pnpm run db:migrate
# or
npm run db:migrate
```

6. Start the development server:
```bash
pnpm run dev
# or
npm run dev
```

7. Open your browser and navigate to:
```
http://localhost:3003
```

## Usage Guide

### 1. Create Database Connections

1. Navigate to the **Connections** page
2. Click **Add Connection**
3. Fill in the connection details:
   - Connection Name: A friendly name for the connection
   - Database Type: MySQL or PostgreSQL
   - Host: Database server address
   - Port: Database port (default: 3306 for MySQL, 5432 for PostgreSQL)
   - Username & Password: Database credentials
   - Database Name: Name of the database
   - Mark as Source/Target: Specify if this is a source or target database
4. Click **Save Connection**
5. Test the connection by clicking the checkmark icon

### 2. Configure Migration

1. Navigate to the **Migrations** page
2. Click **New Migration**
3. Follow the wizard:

   **Step 1: Basic Information**
   - Enter a name and description for the migration

   **Step 2: Select Source**
   - Choose the source database connection
   - Select the source table

   **Step 3: Select Target**
   - Choose the target database connection
   - Select the target table

   **Step 4: Field Mapping**
   - Click **Auto Map Fields** to automatically map fields with the same name
   - Manually adjust field mappings as needed
   - Set batch size (default: 1000 records per batch)
   - Optionally enable "Delete existing records before migration"

4. Click **Create Migration**

### 3. Run Migration

1. On the **Migrations** page, find your migration
2. Click the **Play** icon to start the migration
3. You'll be redirected to the **Tasks** page

### 4. Monitor Progress

1. Navigate to the **Tasks** page
2. View real-time progress of running migrations
3. Click **View Logs** to see detailed migration logs
4. Cancel running migrations if needed
5. View completed migrations and their statistics

## Project Structure

```
db-migrate/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── connections/     # Database connection endpoints
│   │   ├── tables/          # Table schema endpoints
│   │   ├── migrations/      # Migration configuration endpoints
│   │   └── tasks/           # Migration task endpoints
│   ├── connections/         # Connection management pages
│   ├── migrations/          # Migration configuration pages
│   ├── tasks/               # Task monitoring pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable components
├── lib/
│   ├── db.ts               # Prisma client
│   ├── utils.ts            # Utility functions
│   ├── db/                 # Database utilities
│   │   └── connector.ts    # Database connector class
│   └── migration/          # Migration utilities
│       └── executor.ts     # Migration execution engine
├── prisma/
│   └── schema.prisma       # Prisma schema
├── types/
│   └── database.ts         # TypeScript type definitions
└── package.json            # Dependencies and scripts
```

## API Endpoints

### Connections
- `GET /api/connections` - List all connections
- `POST /api/connections` - Create a new connection
- `GET /api/connections/[id]` - Get connection details
- `PUT /api/connections/[id]` - Update connection
- `DELETE /api/connections/[id]` - Delete connection
- `POST /api/connections/[id]/test` - Test connection

### Tables
- `GET /api/tables/[connectionId]` - List all tables
- `GET /api/tables/[connectionId]/[tableName]` - Get table schema

### Migrations
- `GET /api/migrations` - List all migrations
- `POST /api/migrations` - Create migration
- `GET /api/migrations/[id]` - Get migration details
- `DELETE /api/migrations/[id]` - Delete migration

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create and start migration task
- `GET /api/tasks/[id]` - Get task details and logs
- `POST /api/tasks/[id]` - Cancel task

## Database Schema

The tool uses SQLite (via Prisma) to store:
- Database connections
- Migration configurations
- Field mappings
- Migration tasks
- Migration logs

## Security Considerations

- Database passwords are stored in plain text in the SQLite database
- **Do not expose this tool to the public internet**
- Use it only in trusted networks or localhost
- Consider implementing encryption for production use

## Development

### Build for Production
```bash
pnpm run build
# or
npm run build
```

### Start Production Server
```bash
pnpm run start
# or
npm run start
```

### View Database
```bash
pnpm run db:studio
# or
npm run db:studio
```

## Troubleshooting

### Migration Fails
- Check the task logs for detailed error messages
- Verify database connections are working
- Ensure field mappings are correct
- Check data types are compatible

### Performance Issues
- Increase batch size for faster migrations
- Monitor database server resources
- Consider running migrations during off-peak hours

## Future Enhancements

- Support for more database types (SQL Server, Oracle, MongoDB)
- Data transformation functions
- Scheduled migrations
- Migration rollback
- Data validation
- Incremental migration based on timestamp
- Export/import migration configurations

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
