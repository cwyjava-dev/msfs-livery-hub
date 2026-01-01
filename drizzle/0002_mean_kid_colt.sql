ALTER TABLE `liveries` ADD `status` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `liveries` ADD `reviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `liveries` ADD `reviewNotes` text;