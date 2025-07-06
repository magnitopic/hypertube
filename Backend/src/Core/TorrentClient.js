import axios from 'axios';
import fsExtra from 'fs-extra';
import https from 'https';
import http from 'http';
import fs from 'fs';
import bencode from 'bencode';
import crypto from 'crypto';
import { URL } from 'url';
import EventEmitter from 'events';

export default class TorrentClient {
  constructor(movieId, torrentURL) {
    const { MOVIES_PATH } = process.env;

    this.movieId = movieId;
    this.torrentFilePath = `${MOVIES_PATH}/${this.movieId}.torrent`;
    this.torrentURL = torrentURL.replace(/^http:/, 'https:');
  }

  // Download torrent file
  async #downloadTorrentFile() {
    try {
      const redirectRes = await axios.get(this.torrentURL);
      const torrentFileURL = redirectRes.request.res.responseUrl;

      return new Promise((resolve, reject) => {
        const request = https.get(torrentFileURL, (response) => {
          if (response.statusCode !== 200) {
            return reject(`HTTP ${response.statusCode}`);
          }

          const file = fsExtra.createWriteStream(this.torrentFilePath);
          response.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', (error) => {
          fsExtra.unlink(this.torrentFilePath, () => reject(error));
        });
      });
    } catch (error) {
      console.error('Error downloading torrent file:', error.message);
    }
  }

  // Load and decode the torrent file
  async openTorrent() {
    await this.#downloadTorrentFile();

    try {
      const torrent = bencode.decode(fsExtra.readFileSync(this.torrentFilePath), {
        decodeStrings: false,
      });
      return torrent;
    } catch (error) {
      console.error('Failed to parse torrent:', error.message);
      return null;
    }
  }

  // Return the list of web seeds
  getWebSeeds(torrent) {
    let urls = [];

    if (torrent['url-list']) {
      if (Array.isArray(torrent['url-list'])) {
        urls = torrent['url-list']
          .map((u) => u.toString())
          .filter((u) => u.startsWith('http://') || u.startsWith('https://'));
      } else {
        const singleUrl = torrent['url-list'].toString();
        if (singleUrl.startsWith('http://') || singleUrl.startsWith('https://')) {
          urls = [singleUrl];
        }
      }
    }

    return urls;
  }

  // Get total size of the content described in the torrent
  getSize(torrent) {
    const { length, files } = torrent.info;
    return length || files.map((f) => f.length).reduce((a, b) => a + b, 0);
  }

  // Get remote file size via HTTP HEAD
  async getRemoteFileSize(url) {
    try {
      const res = await axios.head(url);
      return parseInt(res.headers['content-length'], 10);
    } catch (e) {
      console.error('Error getting remote file size:', e.message);
      return null;
    }
  }

  // Create a readable stream for the requested byte range
  async createStreamFromWebSeed(webSeedUrl, start, end) {
    const remoteFileSize = await this.getRemoteFileSize(webSeedUrl);
    if (!remoteFileSize) {
      throw new Error('Could not get remote file size');
    }

    const safeEnd = Math.min(end, remoteFileSize - 1);
    if (start > safeEnd) {
      throw new Error(`Requested range not satisfiable: ${start}-${end}`);
    }

    try {
      const response = await axios.get(webSeedUrl, {
        headers: { Range: `bytes=${start}-${safeEnd}` },
        responseType: 'stream',
        maxRedirects: 5,
      });

      if (![200, 206].includes(response.status)) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      return response.data;
    } catch (err) {
      console.error('Axios stream error:', err.message);
      throw err;
    }
  }

  // DOWNLOAD
  async streamAndDownload(webSeedUrl, localPath, start, end) {
    console.log(`[TC] streamAndDownload called: webSeedUrl=${webSeedUrl}, localPath=${localPath}, start=${start}, end=${end}`);
    if (!this._downloadEmitter) {
      this._downloadEmitter = new EventEmitter();
    }
    let stats = null;
    try {
      stats = await fsExtra.stat(localPath);
    } catch (e) {}
    // Download only if file not exists or too small
    if (!stats || stats.size < end + 1) {
      if (!this._downloading) {
        this._downloading = true;
        this._downloadedBytes = stats ? stats.size : 0;
        this._downloadPromise = this._downloadFile(webSeedUrl, localPath, this._downloadedBytes);
        console.log(`[TC] _downloadFile started at offset ${this._downloadedBytes}`);
      } else {
        console.log(`[TC] download already in progress`);
      }
    } else {
      console.log(`[TC] local file already has enough data: size=${stats.size}`);
    }
    await this._waitForRange(localPath, end);
    console.log(`[TC] _waitForRange resolved for end=${end}`);
    return fs.createReadStream(localPath, { start, end });
  }

  // Restart download if file exists
  async _downloadFile(webSeedUrl, localPath, offset = 0) {
    if (!this._downloadEmitter) {
      this._downloadEmitter = new EventEmitter();
    }
    console.log(`[TC] _downloadFile: GET ${webSeedUrl} -> ${localPath} (offset=${offset})`);
    const headers = offset > 0 ? { Range: `bytes=${offset}-` } : {};
    const writer = fs.createWriteStream(localPath, { flags: offset > 0 ? 'a' : 'w' });
    const response = await axios.get(webSeedUrl, { responseType: 'stream', headers });
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        this._downloadedBytes += chunk.length;
        this._downloadEmitter.emit('progress', this._downloadedBytes + offset);
        /* if ((this._downloadedBytes + offset) % 1048576 < chunk.length) { TODO: download logs
          console.log(`[TC] Downloaded ${this._downloadedBytes + offset} bytes...`);
        } */
      });
      response.data.pipe(writer);
      writer.on('finish', () => {
        this._downloading = false;
        console.log(`[TC] _downloadFile finished, total bytes: ${this._downloadedBytes + offset}`);
        resolve();
      });
      writer.on('error', (err) => {
        this._downloading = false;
        console.error(`[TC] _downloadFile error:`, err.message);
        reject(err);
      });
    });
  }

  async _waitForRange(localPath, end) {
    while (true) {
      try {
        const stats = await fsExtra.stat(localPath);
        if (stats.size > end) return;
      } catch (e) {}
      await new Promise((resolve) => {
        this._downloadEmitter.once('progress', resolve);
        setTimeout(resolve, 500);
      });
    }
  }
}
