-- Migration seed values are defined by the existing baseline migration.
-- Synthetic accounts and fixtures are seeded by scripts/local-stack.mjs only
-- after local container identity and loopback API checks pass. Keeping this
-- file free of account/content writes prevents accidental remote seed reuse.
select 1;
