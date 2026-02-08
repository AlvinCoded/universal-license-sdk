import { describe, it, expect } from 'vitest';
import { ImportModule } from '../../src/modules/ImportModule';

describe('ImportModule', () => {
  it('sends form data to preview and handles CSV response', async () => {
    const fakeHttp: any = {
      postForm: async (url: string, _form: any) => {
        if (url.includes('/import/licenses/preview')) {
          return { format: 'csv', previewCount: 2, records: [{ foo: 'bar' }, { foo: 'baz' }] };
        }
        throw new Error('unexpected');
      },
    };

    const mod = new ImportModule(fakeHttp);
    const fakeFile = new Blob(['col1,col2\na,b\nc,d'], { type: 'text/csv' }) as any;

    const res = await mod.preview('licenses', fakeFile, { format: 'csv', previewCount: 2 } as any);
    expect(res.format).toBe('csv');
    expect(res.previewCount).toBe(2);
    expect(res.records.length).toBe(2);
  });

  it('handles server error on execute', async () => {
    const fakeHttp: any = {
      postForm: async () => ({ success: false, errors: ['Row 1: invalid'] }),
    };

    const mod = new ImportModule(fakeHttp);
    const fakeFile = new Blob(['[]'], { type: 'application/json' }) as any;

    const res = await mod.execute('licenses', fakeFile, { format: 'json' } as any);
    expect(res.success).toBe(false);
    expect(res.errors).toBeDefined();
  });
});
