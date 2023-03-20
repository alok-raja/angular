/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImageLoader, ImageLoaderConfig} from '@angular/common/src/directives/ng_optimized_image';
import {createCloudflareUrl} from '@angular/common/src/directives/ng_optimized_image/image_loaders/cloudflare_loader';
import {createCloudinaryUrl, provideCloudinaryLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/cloudinary_loader';
import {createImageLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/image_loader';
import {createImagekitUrl, provideImageKitLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/imagekit_loader';
import {createImgixUrl} from '@angular/common/src/directives/ng_optimized_image/image_loaders/imgix_loader';
import {isValidPath} from '@angular/common/src/directives/ng_optimized_image/url';

const absoluteUrlError = (src: string, path: string) =>
    `NG02959: Image loader has detected a \`<img>\` tag with an invalid ` +
    `\`ngSrc\` attribute: ${src}. This image loader expects \`ngSrc\` ` +
    `to be a relative URL - however the provided value is an absolute URL. ` +
    `To fix this, provide \`ngSrc\` as a path relative to the base URL ` +
    `configured for this loader (\`${path}\`).`;

const invalidPathError = (path: string, formats: string) =>
    `NG02959: Image loader has detected an invalid path (\`${path}\`). ` +
    `To fix this, supply a path using one of the following formats: ${formats}`;

describe('Built-in image directive loaders', () => {
  describe('Imgix loader', () => {
    function createImgixLoader(path: string) {
      const stubLoader = (createImageLoader(createImgixUrl)(path)[0] as {
                           provide: any,
                           useValue: (config: ImageLoaderConfig) => string
                         }).useValue;
      return (config: ImageLoaderConfig) => stubLoader(config);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(path);
      const config = {src: 'img.png'};
      expect(loader(config)).toBe(`${path}/img.png?auto=format`);
    });

    it('should handle a trailing forward slash on the path', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(`${path}/`);
      const config = {src: 'img.png'};
      expect(loader(config)).toBe(`${path}/img.png?auto=format`);
    });

    it('should handle a leading forward slash on the image src', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(path);
      const config = {src: '/img.png'};
      expect(loader(config)).toBe(`${path}/img.png?auto=format`);
    });

    it('should construct an image loader with the given path', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(path);
      const config = {src: 'img.png', width: 100};
      expect(loader(config)).toBe(`${path}/img.png?auto=format&w=100`);
    });

    it('should throw if an absolute URL is provided as a loader input', () => {
      const path = 'https://somesite.imgix.net';
      const src = 'https://angular.io/img.png';
      const loader = createImgixLoader(path);
      expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
    });
  });

  describe('Cloudinary loader', () => {
    function createCloudinaryLoader(path: string): ImageLoader {
      const stubLoader = (createImageLoader(createCloudinaryUrl)(path)[0] as {
                           provide: any,
                           useValue: (config: ImageLoaderConfig) => string
                         }).useValue;
      return (config: ImageLoaderConfig) => stubLoader(config);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://res.cloudinary.com/mysite';
      const loader = createCloudinaryLoader(path);
      expect(loader({src: 'img.png'})).toBe(`${path}/image/upload/f_auto,q_auto/img.png`);
      expect(loader({
        src: 'marketing/img-2.png'
      })).toBe(`${path}/image/upload/f_auto,q_auto/marketing/img-2.png`);
    });

    describe('input validation', () => {
      it('should throw if an absolute URL is provided as a loader input', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const src = 'https://angular.io/img.png';
        const loader = createCloudinaryLoader(path);
        expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
      });

      it('should throw if the path is invalid', () => {
        expect(() => provideCloudinaryLoader('my-cloudinary-account'))
            .toThrowError(invalidPathError(
                'my-cloudinary-account',
                'https://res.cloudinary.com/mysite or https://mysite.cloudinary.com ' +
                    'or https://subdomain.mysite.com'));
      });

      it('should handle a trailing forward slash on the path', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const loader = createCloudinaryLoader(`${path}/`);
        expect(loader({src: 'img.png'})).toBe(`${path}/image/upload/f_auto,q_auto/img.png`);
      });

      it('should handle a leading forward slash on the image src', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const loader = createCloudinaryLoader(path);
        expect(loader({src: '/img.png'})).toBe(`${path}/image/upload/f_auto,q_auto/img.png`);
      });
    });
  });

  describe('ImageKit loader', () => {
    function createImageKitLoader(path: string): ImageLoader {
      const stubLoader = (createImageLoader(createImagekitUrl)(path)[0] as {
                           provide: any,
                           useValue: (config: ImageLoaderConfig) => string
                         }).useValue;
      return (config: ImageLoaderConfig) => stubLoader(config);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://ik.imageengine.io/imagetest';
      const loader = createImageKitLoader(path);
      expect(loader({src: 'img.png'})).toBe(`${path}/tr:q-auto/img.png`);
      expect(loader({src: 'marketing/img-2.png'})).toBe(`${path}/tr:q-auto/marketing/img-2.png`);
    });

    describe('input validation', () => {
      it('should throw if an absolute URL is provided as a loader input', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const src = 'https://angular.io/img.png';
        const loader = createImageKitLoader(path);
        expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
      });

      it('should throw if the path is invalid', () => {
        expect(() => provideImageKitLoader('my-imagekit-account'))
            .toThrowError(invalidPathError(
                'my-imagekit-account',
                'https://ik.imagekit.io/mysite or https://subdomain.mysite.com'));
      });

      it('should handle a trailing forward slash on the path', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const loader = createImageKitLoader(`${path}/`);
        expect(loader({src: 'img.png'})).toBe(`${path}/tr:q-auto/img.png`);
      });

      it('should handle a leading forward slash on the image src', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const loader = createImageKitLoader(path);
        expect(loader({src: '/img.png'})).toBe(`${path}/tr:q-auto/img.png`);
      });
    });
  });

  describe('Cloudflare loader', () => {
    function createCloudflareLoader(path: string): ImageLoader {
      const stubLoader = (createImageLoader(createCloudflareUrl)(path)[0] as {
                           provide: any,
                           useValue: (config: ImageLoaderConfig) => string
                         }).useValue;
      return (config: ImageLoaderConfig) => stubLoader(config);
    }
    it('should construct an image loader with the given path', () => {
      const loader = createCloudflareLoader('https://mysite.com');
      let config = {src: 'img.png'};
      expect(loader(config)).toBe('https://mysite.com/cdn-cgi/image/format=auto/img.png');
    });
    it('should construct an image loader with the given path', () => {
      const loader = createCloudflareLoader('https://mysite.com');
      const config = {src: 'img.png', width: 100};
      expect(loader(config)).toBe('https://mysite.com/cdn-cgi/image/format=auto,width=100/img.png');
    });

    it('should throw if an absolute URL is provided as a loader input', () => {
      const path = 'https://mysite.com';
      const src = 'https://angular.io/img.png';
      const loader = createCloudflareLoader(path);
      expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
    });
  });

  describe('loader utils', () => {
    it('should identify valid paths', () => {
      expect(isValidPath('https://cdn.imageprovider.com/image-test')).toBe(true);
      expect(isValidPath('https://cdn.imageprovider.com')).toBe(true);
      expect(isValidPath('https://imageprovider.com')).toBe(true);
    });

    it('should reject empty paths', () => {
      expect(isValidPath('')).toBe(false);
    });

    it('should reject path if it is not a URL', () => {
      expect(isValidPath('myaccount')).toBe(false);
    });

    it('should reject path if it does not include a protocol', () => {
      expect(isValidPath('myaccount.imageprovider.com')).toBe(false);
    });

    it('should reject path if is malformed', () => {
      expect(isValidPath('somepa\th.imageprovider.com? few')).toBe(false);
    });
  });
});
