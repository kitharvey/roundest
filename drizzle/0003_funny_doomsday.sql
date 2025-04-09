PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pokemon` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`types` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_pokemon`("id", "name", "image", "types") SELECT "id", "name", "image", "types" FROM `pokemon`;--> statement-breakpoint
DROP TABLE `pokemon`;--> statement-breakpoint
ALTER TABLE `__new_pokemon` RENAME TO `pokemon`;--> statement-breakpoint
PRAGMA foreign_keys=ON;