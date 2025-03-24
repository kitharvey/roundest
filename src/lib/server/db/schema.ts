import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const pokemon = sqliteTable('pokemon', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	image: text('image').notNull()
});
