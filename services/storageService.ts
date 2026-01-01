export interface MediaItem {
    id: string;
    value: string;
    size: number;
    date: number;
    type: string;
    src: string;
    thumb?: string; // Add thumb support
    path: string;
}

export const storageService = {
    async getFiles(type: 'image' | 'video' | 'audio' | 'file' = 'image'): Promise<MediaItem[]> {
        try {
            const response = await fetch(`/api/storage/list?type=${type}`);
            if (!response.ok) throw new Error('Failed to list files');
            const files = await response.json();
            return files.map((f: any) => ({
                ...f,
                type: f.type || 'file',
                path: f.id.split('/')[1] // The date folder
            }));
        } catch (err) {
            console.error('Storage error:', err);
            return [];
        }
    },

    async uploadFile(file: File, customPath?: string, type?: 'image' | 'video' | 'audio' | 'file'): Promise<MediaItem | null> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (customPath) {
                formData.append('customPath', customPath);
            }
            if (type) {
                formData.append('type', type);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120_000);

            const response = await fetch('/api/storage/upload', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));

            if (!response.ok) {
                const details = await response.text().catch(() => '');
                throw new Error(`Upload failed (${response.status})${details ? `: ${details}` : ''}`);
            }
            const result = await response.json();

            return {
                id: result.id,
                value: result.value,
                size: file.size,
                date: Date.now() / 1000,
                type: "file",
                src: result.src,
                thumb: result.thumb,
                path: result.id.split('/')[0]
            };
        } catch (err) {
            console.error('Upload error:', err);
            return null;
        }
    },

    async deleteFile(fileId: string): Promise<boolean> {
        try {
            // Use the full ID (date/filename) for deletion
            const response = await fetch(`/api/storage/delete/${encodeURIComponent(fileId)}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (err) {
            console.error('Delete error:', err);
            return false;
        }
    }
};
