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
                res.setHeader('Access-Control-Allow-Origin', '*'); // Allow canvas access
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
                  console.error('Upload form parse error:', err.message);
                  res.statusCode = 500;
                  res.end(err.message);
                  return;
                }

                try {
                  const file = files.file[0];
                  const today = new Date().toISOString().split('T')[0];

                  let targetDir;
                  let cleanFileName;
                  let customId = null;

                  if (fields.customPath && fields.customPath.length > 0) {
                    // OVERWRITE MODE
                    const fullPathId = fields.customPath[0]; // e.g. "2024-12-31/my-image"
                    const parts = fullPathId.split('/');
                    if (parts.length >= 2) {
                      const datePart = parts[0];
                      const namePart = parts.slice(1).join('/');
                      targetDir = path.join(baseDir, datePart);
                      cleanFileName = namePart;
                      customId = fullPathId;
                    } else {
                      // Fallback
                      targetDir = path.join(baseDir, today);
                      cleanFileName = path.parse(file.originalFilename).name.replace(/\s+/g, '-').toLowerCase();
                    }
                  } else {
                    // NEW FILE MODE
                    targetDir = path.join(baseDir, today);
                    cleanFileName = path.parse(file.originalFilename).name.replace(/\s+/g, '-').toLowerCase();
                  }


                  const sizes = {
                    sm: 300,   // Thumb
                    xl: 2048   // XL / Web-ready Original
                  };

                  if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                  }


                  const originalImage = sharp(file.path);

                  try {
                    // 1. Process XL (Full Size - Original Dimensions)
                    await originalImage
                      .clone()
                      .webp({ quality: 100, lossless: true })
                      .toFile(path.join(targetDir, `${cleanFileName}_xl.webp`));

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

                    fs.unlinkSync(file.path);

                    const finalId = customId || `${today}/${cleanFileName}`;
                    const finalDateDir = customId ? customId.split('/')[0] : today;

                    res.end(JSON.stringify({
                      id: finalId,
                      value: cleanFileName,
                      src: `/api/storage/file/${finalDateDir}/${cleanFileName}_xl.webp`,
                      thumb: `/api/storage/file/${finalDateDir}/${cleanFileName}_sm.webp`
                    }));
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
