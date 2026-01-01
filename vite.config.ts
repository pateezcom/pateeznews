import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import multiparty from 'multiparty';
import { defineConfig, loadEnv } from 'vite';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      global: 'window',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
        'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
        'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client'),
        'react-is': path.resolve(__dirname, 'node_modules/react-is'),
        'scheduler': path.resolve(__dirname, 'node_modules/scheduler'),
        'konva': path.resolve(__dirname, 'node_modules/konva'),
        'konva/lib/Factory': path.resolve(__dirname, 'node_modules/konva/lib/Factory.js'),
        'konva/lib': path.resolve(__dirname, 'node_modules/konva/lib'),
        'react-konva': path.resolve(__dirname, 'node_modules/react-konva'),
        'react-konva-utils': path.resolve(__dirname, 'node_modules/react-konva-utils'),
        'prop-types': path.resolve(__dirname, 'node_modules/prop-types'),
        'util': path.resolve(__dirname, 'util-shim.js'),
        'async_hooks': path.resolve(__dirname, 'async_hooks-shim.js'),
        'react-dom/server': path.resolve(__dirname, 'node_modules/react-dom/server.browser.js'),
      },
      dedupe: ['react', 'react-dom', 'styled-components', 'react-is', 'scheduler', 'konva', 'react-konva', 'react-konva-utils', 'prop-types', 'util', 'async_hooks'],
    },
    optimizeDeps: {
      include: [
        'react-konva',
        'konva',
        'konva/lib/Factory',
        'immutable',
        'react-filerobot-image-editor',
        'styled-components',
        'react-konva-utils',
        'prop-types',
        '@googleforcreators/story-editor',
        '@googleforcreators/elements',
        '@googleforcreators/element-library'
      ],
      exclude: [],
      force: true
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      {
        name: 'local-storage-plugin',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const uploadRootDir = path.resolve(__dirname, 'Upload');
            const imageBaseDir = path.join(uploadRootDir, 'image');
            const videoBaseDir = path.join(uploadRootDir, 'video');
            const audioBaseDir = path.join(uploadRootDir, 'audio');

            if (!fs.existsSync(imageBaseDir)) fs.mkdirSync(imageBaseDir, { recursive: true });
            if (!fs.existsSync(videoBaseDir)) fs.mkdirSync(videoBaseDir, { recursive: true });
            if (!fs.existsSync(audioBaseDir)) fs.mkdirSync(audioBaseDir, { recursive: true });

            const getMimeType = (filePath: string) => {
              const ext = path.extname(filePath).toLowerCase();
              if (ext === '.webp') return 'image/webp';
              if (ext === '.mp4') return 'video/mp4';
              if (ext === '.webm') return 'video/webm';
              if (ext === '.mov') return 'video/quicktime';
              if (ext === '.avi') return 'video/x-msvideo';
              if (ext === '.mp3') return 'audio/mpeg';
              if (ext === '.wav') return 'audio/wav';
              if (ext === '.ogg') return 'audio/ogg';
              if (ext === '.m4a') return 'audio/mp4';
              if (ext === '.aac') return 'audio/aac';
              return 'application/octet-stream';
            };

            // RECURSIVE FILE LISTER
            const getAllFiles = (dirPath: string, type: string, rootDir: string, arrayOfFiles: any[] = []) => {
              if (!fs.existsSync(dirPath)) return arrayOfFiles;
              const files = fs.readdirSync(dirPath);
              files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                if (fs.statSync(fullPath).isDirectory()) {
                  arrayOfFiles = getAllFiles(fullPath, type, rootDir, arrayOfFiles);
                } else {
                  const relativePath = path.relative(rootDir, dirPath);
                  const stats = fs.statSync(fullPath);

                  if (type === 'video') {
                    const videoExts = ['.mp4', '.webm', '.mov', '.avi'];
                    const ext = path.extname(file).toLowerCase();
                    if (videoExts.includes(ext) && !file.includes('_thumb.')) {
                      const baseName = path.parse(file).name;
                      const thumbPath = path.join(dirPath, `${baseName}_thumb.jpg`);
                      arrayOfFiles.push({
                        id: `video/${relativePath ? relativePath + '/' : ''}${file}`,
                        value: file,
                        size: stats.size,
                        date: stats.mtimeMs / 1000,
                        src: `/api/storage/file/video/${relativePath ? relativePath + '/' : ''}${file}`,
                        thumb: fs.existsSync(thumbPath) ? `/api/storage/file/video/${relativePath ? relativePath + '/' : ''}${baseName}_thumb.jpg` : null,
                        type: 'video'
                      });
                    }
                  } else if (type === 'audio') {
                    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
                    const ext = path.extname(file).toLowerCase();
                    if (audioExts.includes(ext)) {
                      arrayOfFiles.push({
                        id: `audio/${relativePath ? relativePath + '/' : ''}${file}`,
                        value: file,
                        size: stats.size,
                        date: stats.mtimeMs / 1000,
                        src: `/api/storage/file/audio/${relativePath ? relativePath + '/' : ''}${file}`,
                        thumb: null,
                        type: 'audio'
                      });
                    }
                  } else {
                    // Default to image
                    if (file.endsWith('_xl.webp')) {
                      const baseName = file.replace('_xl.webp', '');
                      arrayOfFiles.push({
                        id: `image/${relativePath ? relativePath + '/' : ''}${baseName}`,
                        value: baseName,
                        size: stats.size,
                        date: stats.mtimeMs / 1000,
                        src: `/api/storage/file/image/${relativePath ? relativePath + '/' : ''}${file}`,
                        thumb: `/api/storage/file/image/${relativePath ? relativePath + '/' : ''}${baseName}_sm.webp`,
                        type: 'image'
                      });
                    }
                  }
                }
              });
              return arrayOfFiles;
            };

            // LIST FILES
            if (req.url.startsWith('/api/storage/list') && req.method === 'GET') {
              try {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const type = url.searchParams.get('type') || 'image';
                const baseDir = type === 'video' ? videoBaseDir : (type === 'audio' ? audioBaseDir : imageBaseDir);
                const fileData = getAllFiles(baseDir, type, baseDir);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(fileData));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }

            // GET FILE
            if (req.url.startsWith('/api/storage/file/') && req.method === 'GET') {
              const urlParts = req.url.split('?')[0];
              const relativePath = decodeURIComponent(urlParts.replace('/api/storage/file/', ''));
              let fullPath;

              if (relativePath.startsWith('video/')) {
                fullPath = path.join(videoBaseDir, relativePath.replace('video/', ''));
              } else if (relativePath.startsWith('audio/')) {
                fullPath = path.join(audioBaseDir, relativePath.replace('audio/', ''));
              } else if (relativePath.startsWith('image/')) {
                fullPath = path.join(imageBaseDir, relativePath.replace('image/', ''));
              } else {
                fullPath = path.join(imageBaseDir, relativePath);
              }

              if (fs.existsSync(fullPath)) {
                res.setHeader('Content-Type', getMimeType(fullPath));
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(fs.readFileSync(fullPath));
              } else {
                res.statusCode = 404;
                res.end('Not Found');
              }
              return;
            }

            // UPLOAD & PROCESS FILE
            if (req.url === '/api/storage/upload' && req.method === 'POST') {
              const form = new multiparty.Form();
              form.parse(req, async (err, fields, files) => {
                if (err) {
                  res.statusCode = 500;
                  res.end(err.message);
                  return;
                }

                try {
                  const file = files.file[0];
                  const today = new Date().toISOString().split('T')[0];
                  const type = fields.type?.[0] || (file.originalFilename.match(/\.(mp4|webm|mov|avi)$/i) ? 'video' : (file.originalFilename.match(/\.(mp3|wav|ogg|m4a|aac)$/i) ? 'audio' : 'image'));
                  const baseDir = type === 'video' ? videoBaseDir : (type === 'audio' ? audioBaseDir : imageBaseDir);

                  let targetDir = path.join(baseDir, today);
                  let cleanFileName = path.parse(file.originalFilename).name.replace(/\s+/g, '-').toLowerCase();

                  if (fields.customPath && fields.customPath.length > 0) {
                    const fullPathId = fields.customPath[0].replace(/^(image|video|audio)\//, '');
                    const parts = fullPathId.split('/');
                    if (parts.length >= 2) {
                      targetDir = path.join(baseDir, parts[0]);
                      cleanFileName = parts.slice(1).join('/');
                    }
                  }

                  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                  if (type === 'video') {
                    const tempFilePath = file.path;
                    const finalPath = path.join(targetDir, `${cleanFileName}.mp4`);
                    const thumbPath = path.join(targetDir, `${cleanFileName}_thumb.jpg`);

                    await execAsync(`ffmpeg -i "${tempFilePath}" -ss 00:00:01 -vframes 1 -q:v 2 -y "${thumbPath}"`);
                    await execAsync(`ffmpeg -i "${tempFilePath}" -vcodec libx264 -crf 24 -preset ultrafast -acodec aac -b:a 128k -movflags +faststart -y "${finalPath}"`);
                    fs.unlinkSync(tempFilePath);

                    const finalDateDir = targetDir.split(path.sep).pop();
                    res.end(JSON.stringify({
                      id: `video/${finalDateDir}/${cleanFileName}.mp4`,
                      value: cleanFileName,
                      src: `/api/storage/file/video/${finalDateDir}/${cleanFileName}.mp4`,
                      thumb: `/api/storage/file/video/${finalDateDir}/${cleanFileName}_thumb.jpg`,
                      type: 'video'
                    }));
                  } else if (type === 'audio') {
                    const tempFilePath = file.path;
                    const finalPath = path.join(targetDir, `${cleanFileName}.mp3`);
                    await execAsync(`ffmpeg -i "${tempFilePath}" -codec:a libmp3lame -q:a 2 -y "${finalPath}"`);
                    fs.unlinkSync(tempFilePath);

                    const finalDateDir = targetDir.split(path.sep).pop();
                    res.end(JSON.stringify({
                      id: `audio/${finalDateDir}/${cleanFileName}.mp3`,
                      value: cleanFileName,
                      src: `/api/storage/file/audio/${finalDateDir}/${cleanFileName}.mp3`,
                      type: 'audio'
                    }));
                  } else {
                    const originalImage = sharp(file.path);
                    await originalImage.clone().webp({ quality: 100, lossless: true }).toFile(path.join(targetDir, `${cleanFileName}_xl.webp`));
                    await originalImage.clone().resize({ width: 300, height: 300, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(targetDir, `${cleanFileName}_sm.webp`));
                    fs.unlinkSync(file.path);

                    const finalDateDir = targetDir.split(path.sep).pop();
                    res.end(JSON.stringify({
                      id: `image/${finalDateDir}/${cleanFileName}`,
                      value: cleanFileName,
                      src: `/api/storage/file/image/${finalDateDir}/${cleanFileName}_xl.webp`,
                      thumb: `/api/storage/file/image/${finalDateDir}/${cleanFileName}_sm.webp`,
                      type: 'image'
                    }));
                  }
                } catch (processErr) {
                  res.statusCode = 500;
                  res.end(processErr.message);
                }
              });
              return;
            }

            // DELETE FILE
            if (req.url.startsWith('/api/storage/delete/') && req.method === 'DELETE') {
              const urlParts = req.url.split('?')[0];
              const fullPathId = decodeURIComponent(urlParts.replace('/api/storage/delete/', ''));

              if (fullPathId.startsWith('video/')) {
                const filePath = path.join(videoBaseDir, fullPathId.replace('video/', ''));
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  const thumbPath = filePath.replace(/\.[^.]+$/, '_thumb.jpg');
                  if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
                }
              } else if (fullPathId.startsWith('audio/')) {
                const filePath = path.join(audioBaseDir, fullPathId.replace('audio/', ''));
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              } else {
                const imagePathId = fullPathId.replace('image/', '');
                const dirPath = path.join(imageBaseDir, path.dirname(imagePathId));
                const baseName = path.basename(imagePathId);
                ['sm', 'xl'].forEach(size => {
                  const p = path.join(dirPath, `${baseName}_${size}.webp`);
                  if (fs.existsSync(p)) fs.unlinkSync(p);
                });
              }
              res.end('Deleted');
              return;
            }

            next();
          });
        }
      }
    ],
  };
});
