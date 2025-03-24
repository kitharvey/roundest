CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pokemon_id` integer NOT NULL,
	`vote_type` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon`(`id`) ON UPDATE no action ON DELETE no action
);
