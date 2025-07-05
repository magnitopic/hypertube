import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

function convertVideoToMp4(inputPath) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(inputPath).toLowerCase();
    if (ext === '.mp4') {
      // Already mp4, no conversion needed
      return resolve(inputPath);
    }

    const outputPath = inputPath.replace(ext, '.mp4');

    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}
