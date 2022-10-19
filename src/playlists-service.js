import pg from "pg";

import "core-js/actual/array/group-to-map.js";

const { Pool } = pg;

/**
 * @typedef {object} Song
 * @property {string} id
 * @property {string} title
 * @property {string} performer
 */

/**
 * @typedef {object} Playlist
 * @property {string} id
 * @property {string} name
 * @property {Array<Song>} songs
 */

export class PlaylistsService {
	/** @type {pg.Pool} */
	#db;

	constructor() {
		this.#db = new Pool();
	}

	/**
	 * @param {string} playlistId
	 * @return {Promise<Playlist>}
	 */
	async getPlaylist(playlistId) {
		const result = await this.#db.query({
			text: `
        SELECT
          ps.playlist_id,
          p.name,
          ps.song_id,
          s.title,
          s.performer
        FROM
          playlist_song AS ps
        INNER JOIN playlists AS p ON p.id = ps.playlist_id
        INNER JOIN songs AS s ON s.id = ps.song_id
        WHERE ps.playlist_id = $1
      `,
			values: [playlistId],
		});

		if (result.rowCount <= 0) {
			throw new Error("Playlist not found");
		}

		// @ts-ignore
		const playlistMap = result.rows.groupToMap(({ playlist_id: id }) => id);
		const songs = playlistMap.get(playlistId);
		const playlistDetail = songs.find((song) => song.playlist_id === playlistId);

		return {
			id: playlistDetail.playlist_id,
			name: playlistDetail.name,
			songs: songs.map((song) => ({
				id: song.song_id,
				title: song.title,
				performer: song.performer,
			})),
		};
	}

	async close() {
		await this.#db.end();
	}
}
