import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const user = process.env['POSTGRES_USER'];
const password = process.env['POSTGRES_PASSWORD'];
const db = process.env['POSTGRES_DB'];
const host = process.env['POSTGRES_HOST'];
const port = process.env['POSTGRES_PORT'];
const url = `postgresql://${user}:${password}@${host}:${port}/${db}`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: { url },
});
