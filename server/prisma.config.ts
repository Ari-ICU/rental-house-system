import { defineConfig } from 'prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
    schema: './prisma/schema.prisma',
    migrate: {
        url: process.env['DATABASE_URL'] ?? '',
        adapter: async (url: string) => {
            const pool = new Pool({ connectionString: url });
            return new PrismaPg(pool);
        },
    },
});
