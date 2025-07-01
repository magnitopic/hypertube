import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export const convertToMkv = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(path.extname(inputPath), '.mkv');
    ffmpeg(inputPath)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
};