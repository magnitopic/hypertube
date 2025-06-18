// Third-Party Imports:
import axios from 'axios';
import fsExtra from 'fs-extra';
import https from 'https';
import http from 'http';
import bencode from 'bencode';
import crypto from 'crypto';
import { URL } from 'url';

export default class TorrentClient {
    constructor(movieId, torrentURL) {
        const { MOVIES_PATH } = process.env;

        this.movieId = movieId;
        this.torrentFilePath = `${MOVIES_PATH}/${this.movieId}.torrent`;
        this.torrentURL = torrentURL.replace(/^http:/, 'https:');
    }

    async streamTorrent() {
        const torrent = await this.#openTorrent();

        const webSeeds = this.#getWebSeeds(torrent);

        if (webSeeds.length === 0) {
            console.error('No web seeds found in this torrent');
            process.exit();
        }

        this.#downloadPieceFromWebSeed(
            webSeeds[0],
            0,
            torrent,
            (error, piece) => {
                if (error)
                    return console.error(
                        'Failed to download piece:',
                        error.message
                    );

                console.log('Downloaded first piece:', piece.length, 'bytes');
            }
        );
    }

    async #downloadTorrentFile() {
        try {
            const redirectRes = await axios.get(this.torrentURL);
            const torrentFileURL = redirectRes.request.res.responseUrl;

            return new Promise((resolve, reject) => {
                const request = https
                    .get(torrentFileURL, (response) => {
                        if (response.statusCode !== 200) {
                            return reject(`HTTP ${response.statusCode}`);
                        }

                        const file = fsExtra.createWriteStream(
                            this.torrentFilePath
                        );
                        response.pipe(file);

                        file.on('finish', () => {
                            file.close(resolve);
                        });
                    })
                    .on('error', (error) => {
                        fsExtra.unlink(this.torrentFilePath, () =>
                            reject(error)
                        );
                    });
            });
        } catch (error) {
            console.error('Error downloading torrent file:', error.message);
        }
    }

    async #openTorrent() {
        await this.#downloadTorrentFile();

        try {
            const torrent = bencode.decode(
                fsExtra.readFileSync(this.torrentFilePath),
                { decodeStrings: false }
            );
            return torrent;
        } catch (error) {
            console.error(
                'Error reading or parsing the torrent file:',
                error.message
            );
            return null;
        }
    }

    #infoHash(torrent) {
        const info = bencode.encode(torrent.info);
        return crypto.createHash('sha1').update(info).digest();
    }

    #getSize(torrent) {
        const { length, files } = torrent.info;
        return length || files.map((f) => f.length).reduce((a, b) => a + b, 0);
    }

    #pieceLength(torrent) {
        return torrent.info['piece length'];
    }

    #getWebSeeds(torrent) {
        let urls = [];

        if (torrent['url-list']) {
            if (Array.isArray(torrent['url-list'])) {
                urls = torrent['url-list'].map((u) => u.toString());
            } else {
                urls = [torrent['url-list'].toString()];
            }
        }

        return urls;
    }

    #downloadPieceFromWebSeed(webSeedUrl, pieceIndex, torrent, callback) {
        const pieceLength = this.#pieceLength(torrent);
        const totalSize = this.#getSize(torrent);
        const start = pieceIndex * pieceLength;
        const end = Math.min(start + pieceLength - 1, totalSize - 1);

        const url = new URL(webSeedUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'GET',
            headers: {
                Range: `bytes=${start}-${end}`,
            },
        };

        const protocol = url.protocol === 'https:' ? https : http;

        const req = protocol.request(options, (res) => {
            let data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => {
                const piece = Buffer.concat(data);
                callback(null, piece);
            });
        });

        req.on('error', (error) => {
            callback(error);
        });

        req.end();
    }

    // Parse .torrent (bencode) DONE
    // Talk to trackers
    // Connect to peers (TCP handshake + bitfield messages)
    // Download pieces
    // Verify SHA-1
    // Stream/save pieces while downloading
}
