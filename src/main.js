import { env } from "node:process";

import * as dotenv from "dotenv";
import amqp from "amqplib";

import { PlaylistsService } from "./playlists-service.js";
import { MailService } from "./mail-service.js";

dotenv.config();

if (!env.RABBITMQ_SERVER) {
	throw new Error("RABBITMQ_SERVER must be defined");
}

const playlists = new PlaylistsService();
const mail = new MailService();
const connection = await amqp.connect(env.RABBITMQ_SERVER);

const channel = await connection.createChannel();

await channel.assertQueue("export:playlist", { durable: true });

channel.consume(
	"export:playlist",
	async (message) => {
		try {
			if (message) {
				const { playlistId, targetEmail } = JSON.parse(message.content.toString());
				const playlist = await playlists.getPlaylist(playlistId);
				const info = await mail.sendMail(targetEmail, JSON.stringify(playlist));
				console.log(info);
			} else {
				console.log("No messages are being processed");
			}
		} catch (error) {
			console.error(error);
		}
	},
	{ noAck: true },
);
