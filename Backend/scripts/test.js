import TorrentClient from '../src/Core/TorrentClient.js';

/* const torrentClient = new TorrentClient(
    '123',
    'https://archive.org/download/Nosferatu_most_complete_version_93_mins./Nosferatu_most_complete_version_93_mins._archive.torrent'
); */
//const torrentClient = new TorrentClient('123', 'http://www.publicdomaintorrents.com/bt/btdownload.php?type=torrent&file=Buster_Keaton1_PSP.MP4.torrent')
const torrentClient = new TorrentClient(
    '123',
    'https://itorrents.org/torrent/546469FE4639787DA780E0FB8B265A5DE0635804.torrent'
);
await torrentClient.streamTorrent();
process.exit();
