import { env } from "node:process";

import { createTransport } from "nodemailer";

export class MailService {
	/** @type {ReturnType<typeof createTransport>} */
	#transporter;

	constructor() {
		this.#transporter = createTransport({
			host: env.MAIL_HOST,
			port: env.MAIL_PORT,
			auth: {
				user: env.MAIL_ADDRESS,
				pass: env.MAIL_PASSWORD,
			},
		});
	}

	sendMail(targetEmail, content) {
		return this.#transporter.sendMail({
			from: "Open Music V3",
			to: targetEmail,
			subject: "Export Playlist",
			text: "Your playlist has been exported. Check out the attachment of this email.",
			attachments: [
				{
					filename: "playlist.json",
					content,
				},
			],
		});
	}
}
