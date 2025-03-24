import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const pokemon = sqliteTable('pokemon', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	image: text('image').notNull()
});

export const votes = sqliteTable('votes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	pokemonId: integer('pokemon_id')
		.notNull()
		.references(() => pokemon.id),
	voteType: text('vote_type', { enum: ['win', 'loss'] }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});
