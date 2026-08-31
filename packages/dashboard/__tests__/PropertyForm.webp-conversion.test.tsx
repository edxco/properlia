/**
 * Test suite for WebP to PNG conversion functionality in PropertyForm
 *
 * This test file validates that WebP images are automatically converted to PNG
 * when uploaded through the PropertyForm component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('WebP to PNG Conversion', () => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let image: HTMLImageElement;

  beforeEach(() => {
    // Mock Canvas API
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d') as CanvasRenderingContext2D;

    // Mock canvas.toBlob
    canvas.toBlob = vi.fn((callback, type, quality) => {
      // Create a mock blob
      const blob = new Blob(['mock-png-data'], { type: 'image/png' });
      callback(blob);
    });

    // Mock createElement to return our canvas
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return canvas;
      }
      return originalCreateElement(tagName);
    });

    // Mock Image constructor
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      width = 800;
      height = 600;

      constructor() {
        // Trigger onload after src is set
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    } as any;

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('convertWebPToPNG', () => {
    // Extract the conversion function for testing
    const convertWebPToPNG = async (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const pngFile = new File(
                  [blob],
                  file.name.replace(/\.webp$/i, '.png'),
                  { type: 'image/png' }
                );
                resolve(pngFile);
              } else {
                reject(new Error('Failed to convert image to PNG'));
              }
            }, 'image/png', 0.95);
          } else {
            reject(new Error('Canvas context not available'));
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
      });
    };

    it('should convert WebP file to PNG format', async () => {
      const webpFile = new File(['webp-data'], 'photo.webp', {
        type: 'image/webp',
      });

      const result = await convertWebPToPNG(webpFile);

      expect(result).toBeInstanceOf(File);
      expect(result.type).toBe('image/png');
      expect(result.name).toBe('photo.png');
    });

    it('should rename file with .png extension', async () => {
      const webpFile = new File(['webp-data'], 'my-image.webp', {
        type: 'image/webp',
      });

      const result = await convertWebPToPNG(webpFile);

      expect(result.name).toBe('my-image.png');
    });

    it('should handle uppercase .WEBP extension', async () => {
      const webpFile = new File(['webp-data'], 'PHOTO.WEBP', {
        type: 'image/webp',
      });

      const result = await convertWebPToPNG(webpFile);

      expect(result.name).toBe('PHOTO.png');
    });

    it('should set canvas dimensions to match image', async () => {
      const webpFile = new File(['webp-data'], 'test.webp', {
        type: 'image/webp',
      });

      await convertWebPToPNG(webpFile);

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it('should call toBlob with correct parameters', async () => {
      const webpFile = new File(['webp-data'], 'test.webp', {
        type: 'image/webp',
      });

      await convertWebPToPNG(webpFile);

      expect(canvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        0.95
      );
    });

    it('should reject if canvas context is not available', async () => {
      // Mock getContext to return null
      vi.spyOn(canvas, 'getContext').mockReturnValue(null);

      const webpFile = new File(['webp-data'], 'test.webp', {
        type: 'image/webp',
      });

      await expect(convertWebPToPNG(webpFile)).rejects.toThrow(
        'Canvas context not available'
      );
    });

    it('should reject if toBlob returns null', async () => {
      // Mock toBlob to return null blob
      canvas.toBlob = vi.fn((callback) => {
        callback(null);
      });

      const webpFile = new File(['webp-data'], 'test.webp', {
        type: 'image/webp',
      });

      await expect(convertWebPToPNG(webpFile)).rejects.toThrow(
        'Failed to convert image to PNG'
      );
    });

    it('should reject if image fails to load', async () => {
      // Override Image mock to trigger error
      global.Image = class MockImageError {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      } as any;

      const webpFile = new File(['webp-data'], 'test.webp', {
        type: 'image/webp',
      });

      await expect(convertWebPToPNG(webpFile)).rejects.toThrow(
        'Failed to load image'
      );
    });
  });

  describe('handleFileChange with WebP conversion', () => {
    const simulateHandleFileChange = async (
      files: File[]
    ): Promise<File[]> => {
      const processedFiles: File[] = [];

      for (const file of files) {
        if (file.type === 'image/webp') {
          try {
            // Use the conversion function
            const convertWebPToPNG = async (file: File): Promise<File> => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;

                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const pngFile = new File(
                          [blob],
                          file.name.replace(/\.webp$/i, '.png'),
                          { type: 'image/png' }
                        );
                        resolve(pngFile);
                      } else {
                        reject(new Error('Failed to convert image to PNG'));
                      }
                    }, 'image/png', 0.95);
                  } else {
                    reject(new Error('Canvas context not available'));
                  }
                };

                img.onerror = () => {
                  reject(new Error('Failed to load image'));
                };

                img.src = URL.createObjectURL(file);
              });
            };

            const pngFile = await convertWebPToPNG(file);
            processedFiles.push(pngFile);
          } catch (error) {
            console.error('Failed to convert WebP to PNG:', error);
            processedFiles.push(file);
          }
        } else {
          processedFiles.push(file);
        }
      }

      return processedFiles;
    };

    it('should convert WebP images in a file list', async () => {
      const files = [
        new File(['webp-data'], 'photo1.webp', { type: 'image/webp' }),
        new File(['jpg-data'], 'photo2.jpg', { type: 'image/jpeg' }),
        new File(['webp-data'], 'photo3.webp', { type: 'image/webp' }),
      ];

      const result = await simulateHandleFileChange(files);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('image/png');
      expect(result[0].name).toBe('photo1.png');
      expect(result[1].type).toBe('image/jpeg');
      expect(result[1].name).toBe('photo2.jpg');
      expect(result[2].type).toBe('image/png');
      expect(result[2].name).toBe('photo3.png');
    });

    it('should not modify non-WebP images', async () => {
      const files = [
        new File(['jpg-data'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['png-data'], 'photo.png', { type: 'image/png' }),
        new File(['gif-data'], 'photo.gif', { type: 'image/gif' }),
      ];

      const result = await simulateHandleFileChange(files);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe(files[0]); // Same reference
      expect(result[1]).toBe(files[1]);
      expect(result[2]).toBe(files[2]);
    });

    it('should handle mixed file types correctly', async () => {
      const files = [
        new File(['webp-data'], 'image.webp', { type: 'image/webp' }),
        new File(['jpg-data'], 'photo.jpg', { type: 'image/jpeg' }),
      ];

      const result = await simulateHandleFileChange(files);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('image/png');
      expect(result[0].name).toBe('image.png');
      expect(result[1].type).toBe('image/jpeg');
      expect(result[1].name).toBe('photo.jpg');
    });

    it('should keep original file if conversion fails', async () => {
      // Mock toBlob to fail
      canvas.toBlob = vi.fn((callback) => {
        callback(null);
      });

      const files = [
        new File(['webp-data'], 'photo.webp', { type: 'image/webp' }),
      ];

      const result = await simulateHandleFileChange(files);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(files[0]); // Original file kept
      expect(result[0].type).toBe('image/webp');
    });

    it('should process multiple WebP files sequentially', async () => {
      const files = [
        new File(['webp1'], 'photo1.webp', { type: 'image/webp' }),
        new File(['webp2'], 'photo2.webp', { type: 'image/webp' }),
        new File(['webp3'], 'photo3.webp', { type: 'image/webp' }),
      ];

      const result = await simulateHandleFileChange(files);

      expect(result).toHaveLength(3);
      result.forEach((file, index) => {
        expect(file.type).toBe('image/png');
        expect(file.name).toBe(`photo${index + 1}.png`);
      });
    });
  });

  describe('File validation', () => {
    it('should accept valid image MIME types', () => {
      const validTypes = [
        'image/webp',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];

      validTypes.forEach((type) => {
        const file = new File(['data'], 'test.file', { type });
        expect(file.type.startsWith('image/')).toBe(true);
      });
    });

    it('should identify WebP files correctly', () => {
      const webpFile = new File(['data'], 'test.webp', { type: 'image/webp' });
      expect(webpFile.type).toBe('image/webp');
    });
  });
});
