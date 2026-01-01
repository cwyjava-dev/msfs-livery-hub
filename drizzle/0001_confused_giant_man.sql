CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('general','upload_error','copyright','feature_request') NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text NOT NULL,
	`email` varchar(320) NOT NULL,
	`relatedLiveryId` int,
	`relatedLiveryInfo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `liveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`manufacturer` enum('Airbus','Boeing') NOT NULL,
	`aircraft` varchar(64) NOT NULL,
	`brand` varchar(128) NOT NULL,
	`liveryName` varchar(256) NOT NULL,
	`description` text,
	`msfsVersion` enum('2020','2024','Both'),
	`installMethod` text,
	`screenshots` text,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` varchar(256),
	`fileSize` int,
	`downloadCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `liveries_id` PRIMARY KEY(`id`)
);
