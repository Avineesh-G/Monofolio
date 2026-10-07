import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// In-memory / browser fallback storage for dev mode
const browserFileStorage = new Map<string, ArrayBuffer>();

export const filesStorage = {
  /**
   * Save binary buffer to device storage (Capacitor Filesystem on Android, memory/blob in web dev)
   * Returns relative file path
   */
  async saveFile(fileName: string, data: ArrayBuffer | Uint8Array): Promise<string> {
    const isNative = Capacitor.isNativePlatform();
    const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    if (isNative) {
      // Convert buffer to base64
      let binary = '';
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      await Filesystem.writeFile({
        path: `documents/${safeName}`,
        data: base64Data,
        directory: Directory.Data,
        recursive: true,
      });

      return `documents/${safeName}`;
    } else {
      // Web fallback
      let buffer: ArrayBuffer;
      if (data instanceof Uint8Array) {
        const copy = new Uint8Array(data.byteLength);
        copy.set(data);
        buffer = copy.buffer;
      } else {
        buffer = data;
      }
      browserFileStorage.set(`documents/${safeName}`, buffer);
      return `documents/${safeName}`;
    }
  },

  /**
   * Read file as ArrayBuffer
   */
  async readFile(filePath: string): Promise<ArrayBuffer> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const result = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });

      if (typeof result.data === 'string') {
        const binaryString = atob(result.data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }
      throw new Error('Unexpected file data format from native storage');
    } else {
      const buffer = browserFileStorage.get(filePath);
      if (!buffer) {
        throw new Error(`File not found in browser storage: ${filePath}`);
      }
      return buffer;
    }
  },

  /**
   * Delete file from device
   */
  async deleteFile(filePath: string): Promise<void> {
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      try {
        await Filesystem.deleteFile({
          path: filePath,
          directory: Directory.Data,
        });
      } catch (err) {
        console.warn('Could not delete file from filesystem', err);
      }
    } else {
      browserFileStorage.delete(filePath);
    }
  }
};
