import { describe, it, expect } from 'vitest';
import { resolveCjsModule } from './cjsInterop.js';

describe('resolveCjsModule', () => {
  it('uses the namespace when Node detected the named exports', () => {
    const ns = { PlanarYUVLuminanceSource: class {}, default: {} };

    expect(resolveCjsModule(ns, 'PlanarYUVLuminanceSource')).toBe(ns);
  });

  it('falls back to default when the named exports were not detected', () => {
    const exportsObject = { PlanarYUVLuminanceSource: class {} };
    const ns = { default: exportsObject };

    expect(resolveCjsModule(ns, 'PlanarYUVLuminanceSource')).toBe(exportsObject);
  });

  it('throws when neither shape exposes the expected export', () => {
    expect(() => resolveCjsModule({ default: {} }, 'PlanarYUVLuminanceSource'))
      .toThrow('Module does not export PlanarYUVLuminanceSource');
  });
});
