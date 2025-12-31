import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import multiparty from 'multiparty';
import { defineConfig, loadEnv } from 'vite';
import sharp from 'sharp';

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
      }
    },
    optimizeDeps: {
      include: ['react-konva', 'konva', 'react-filerobot-image-editor', 'immutable', 'styled-components'],
      force: true
    },
    plugins: [
      react(),
      {
        name: 'local-storage-plugin',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const baseDir = path.resolve(__dirname, 'Upload/image');

            if (!fs.existsSync(baseDir)) {
              fs.mkdirSync(baseDir, { recursive: true });
            }

            // RECURSIVE FILE LISTER
            const getAllFiles = (dirPath: string, arrayOfFiles: any[] = []) => {
              const files = fs.readdirSync(dirPath);
              files.forEach(file => {
                if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                  arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
                } else {
                  // Only list XL versions to represent the image in UI
                  if (file.endsWith('_xl.webp')) {
                    const relativePath = path.relative(baseDir, dirPath);
                    const stats = fs.statSync(path.join(dirPath, file));
                    const baseName = file.replace('_xl.webp', '');
                    arrayOfFiles.push({
                      id: `${relativePath}/${baseName}`,
                      value: baseName,
                      size: stats.size,
                      date: stats.mtimeMs / 1000,
                      src: `/api/storage/file/${relativePath}/${file}`,
                      thumb: `/api/storage/file/${relativePath}/${baseName}_sm.webp`
                    });
                  }
                }
              });
              return arrayOfFiles;
            };

            // LIST FILES
            if (req.url === '/api/storage/list' && req.method === 'GET') {
              try {
                const fileData = getAllFiles(baseDir);
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
              const filePathStr = decodeURIComponent(urlParts.replace('/api/storage/file/', ''));
              const fullPath = path.join(baseDir, filePathStr);

              if (fs.existsSync(fullPath)) {
                res.setHeader('Content-Type', 'image/webp');
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
                  const targetDir = path.join(baseDir, today);

                  if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                  }

                  const cleanFileName = path.parse(file.originalFilename).name.replace(/\s+/g, '-').toLowerCase();

                  const sizes = {
                    sm: 300,   // Thumb
                    xl: 2048   // XL / Web-ready Original
                  };

                  console.log('--- UPLOAD START ---', file.originalFilename);
                  const originalImage = sharp(file.path);

                  try {
                    // 1. Process XL (Full Size - Original Dimensions)
                    await originalImage
                      .clone()
                      .webp({ quality: 100, lossless: true })
                      .toFile(path.join(targetDir, `${cleanFileName}_xl.webp`));
                    console.log('XL Processed');

                    // 2. Process SM (Thumbnail - Still 300px for performance)
                    await originalImage
                      .clone()
                      .resize({
                        width: 300,
                        height: 300,
                        fit: 'inside',
                        withoutEnlargement: true
                      })
                      .webp({ quality: 90 })
                      .toFile(path.join(targetDir, `${cleanFileName}_sm.webp`));
                    console.log('SM Processed');

                    fs.unlinkSync(file.path);
                    console.log('Temp file deleted');

                    res.end(JSON.stringify({
                      id: `${today}/${cleanFileName}`,
                      value: cleanFileName,
                      src: `/api/storage/file/${today}/${cleanFileName}_xl.webp`,
                      thumb: `/api/storage/file/${today}/${cleanFileName}_sm.webp`
                    }));
                    console.log('--- UPLOAD SUCCESS ---');
                  } catch (sharpError) {
                    console.error('SHARP ERROR:', sharpError);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: sharpError.message }));
                  }
                } catch (processErr) {
                  res.statusCode = 500;
                  res.end(processErr.message);
                }
              });
              return;
            }

            // DELETE FILE (Delete all sizes)
            if (req.url.startsWith('/api/storage/delete/') && req.method === 'DELETE') {
              const urlParts = req.url.split('?')[0];
              const filePathStr = decodeURIComponent(urlParts.replace('/api/storage/delete/', ''));
              const dirPath = path.join(baseDir, path.dirname(filePathStr));
              const baseName = path.basename(filePathStr);

              const sizes = ['sm', 'xl'];
              sizes.forEach(size => {
                const p = path.join(dirPath, `${baseName}_${size}.webp`);
                if (fs.existsSync(p)) fs.unlinkSync(p);
              });

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
