import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const sharingDB = new SQLDatabase("sharing", {
  migrations: "./migrations",
});
