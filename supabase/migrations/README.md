# Supabase Migrations

SQL migration files for the PianoPath database schema.

## Usage

Place migration files here with timestamped names, for example:

```
20260101000000_create_profiles.sql
20260102000000_create_lessons.sql
```

Apply migrations with the Supabase CLI:

```bash
supabase db push
```

Or run them against a linked remote project:

```bash
supabase migration up
```

## Conventions

- One logical change per migration file
- Include both `up` logic; use separate rollback migrations if needed
- Name tables and columns in `snake_case`
- Enable Row Level Security (RLS) on all user-facing tables
