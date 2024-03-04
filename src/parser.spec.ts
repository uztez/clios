import { CliosParser } from './parser';
import { CliosOutput } from './schema';

describe('CliosParser', () => {
  let parser: CliosParser;
  beforeEach(() => {
    parser = CliosParser.of([
      ['tags|tag*', 'the tags'],
      ['host|hosts=localhost', 'the host'],
      ['port(p)=1080', 'the port'],
      ['lazy(L)', 'load it lazily'],
      ['silence(s)', 'show no output'],
      ['no-proxy', 'use no proxy'],
    ]);
  });
  describe('parse', () => {
    it('returns default values', () => {
      let { options, values } = parser.parse([]);
      expect(values).toEqual([]);
      expect(options).toEqual({ host: 'localhost', port: '1080' });
    });
    it('understands option group', () => {
      let {
        options: { lazy, silence },
      }: CliosOutput = parser.parse('-Ls'.split(' '));
      expect({ lazy, silence }).toEqual({ lazy: true, silence: true });
    });
    it('ignores wrong option group', () => {
      let {
        options: { lazy, silence },
        values,
      }: CliosOutput = parser.parse('-ls'.split(' '));
      expect({ lazy, silence }).toEqual({ lazy: undefined, silence: undefined });
      expect(values).toEqual(['-ls']);
    });
    it('ignore type mixed option group', () => {
      let {
        options: { lazy, port },
        values,
      }: CliosOutput = parser.parse('-pL'.split(' '));
      expect({ lazy, port }).toEqual({ lazy: undefined, port: '1080' });
      expect(values).toEqual(['-pL']);
    });
    it('ignore malform option group', () => {
      let {
        options: { lazy, silence },
        values,
      }: CliosOutput = parser.parse('-Ls1'.split(' '));
      expect({ lazy, silence }).toEqual({ lazy: undefined, silence: undefined });
      expect(values).toEqual(['-Ls1']);
    });
    it('fail on wrong option group with strict', () => {
      let exception: any = null;
      try {
        parser.parse('-ls'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('fail on malform option group with strict', () => {
      let exception: any = null;
      try {
        parser.parse('-ab1'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('fail on type mixed option group with strict', () => {
      let exception: any = null;
      try {
        parser.parse('-pL'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('understands short boolean option', () => {
      let {
        options: { lazy },
      }: CliosOutput = parser.parse('-L'.split(' '));
      expect({ lazy }).toEqual({ lazy: true });
    });
    it('understands no- boolean option', () => {
      let {
        options: { lazy },
      }: CliosOutput = parser.parse('--no-lazy'.split(' '));
      expect({ lazy }).toEqual({ lazy: false });
    });
    it('understands no- named boolean option', () => {
      let {
        options: { noProxy },
      }: CliosOutput = parser.parse('--no-proxy'.split(' '));
      expect({ noProxy }).toEqual({ noProxy: true });
    });
    it('understands boolean option with value', () => {
      let {
        options: { lazy },
      }: CliosOutput = parser.parse('--lazy=no'.split(' '));
      expect({ lazy }).toEqual({ lazy: false });
    });
    it('understands short string option', () => {
      let {
        options: { port },
      }: CliosOutput = parser.parse('-p 2000'.split(' '));
      expect({ port }).toEqual({ port: '2000' });
    });
    it('understands string option with value', () => {
      let {
        options: { host },
      }: CliosOutput = parser.parse('--host=foo.com'.split(' '));
      expect({ host }).toEqual({ host: 'foo.com' });
    });
    it('understands string alias option with value', () => {
      let {
        options: { host, hosts },
      }: CliosOutput = parser.parse('--hosts=foo.com'.split(' '));
      expect({ host, hosts }).toEqual({ host: 'foo.com', hosts: undefined });
    });
    it('understands string option with value after', () => {
      let {
        options: { host },
      }: CliosOutput = parser.parse('--host foo.com'.split(' '));
      expect({ host }).toEqual({ host: 'foo.com' });
    });
    it('understands string option with value empty', () => {
      let {
        options: { host },
      }: CliosOutput = parser.parse('--host='.split(' '));
      expect({ host }).toEqual({ host: '' });
    });
    it('understands array option', () => {
      let {
        options: { tags },
        values,
      }: CliosOutput = parser.parse('--tags=windows --tag linux --tag'.split(' '));
      expect({ tags }).toEqual({ tags: ['windows', 'linux'] });
      expect(values).toEqual(['--tag']);
    });
    it('ignore short string option with value missing', () => {
      let {
        options: { port },
        values,
      }: CliosOutput = parser.parse('-p'.split(' '));
      expect({ port }).toEqual({ port: '1080' });
      expect(values).toEqual(['-p']);
    });
    it('ignore long option with value missing', () => {
      let {
        options: { host },
        values,
      }: CliosOutput = parser.parse('--host'.split(' '));
      expect({ host }).toEqual({ host: 'localhost' });
      expect(values).toEqual(['--host']);
    });
    it('ignore unrecognized short option', () => {
      let { values }: CliosOutput = parser.parse('-l'.split(' '));
      expect(values).toEqual(['-l']);
    });
    it('fail on unrecognized short option with strict', () => {
      let exception: any = null;
      try {
        parser.parse('-l'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('ignore unrecognized long option', () => {
      let { values }: CliosOutput = parser.parse('--unknown'.split(' '));
      expect(values).toEqual(['--unknown']);
    });
    it('fail on unrecognized long option with strict', () => {
      let exception: any = null;
      try {
        parser.parse('--unknown'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('ignore malformed long option', () => {
      let { values }: CliosOutput = parser.parse('--123'.split(' '));
      expect(values).toEqual(['--123']);
    });
    it('fail on malformed long option with strict', () => {
      let exception: any = null;
      try {
        parser.parse('--123'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('fail on missing option value', () => {
      let exception: any = null;
      try {
        parser.parse('--port -Ls'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
      exception = null;
      try {
        parser.parse('--port --silence'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('fail on option missing value with strict', () => {
      let exception: any = null;
      try {
        parser.parse('--host'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
    it('fail on ambiguity value with strict', () => {
      let exception: any = null;
      try {
        parser.parse('--port=1000 --port=2000'.split(' '), true);
      } catch (e) {
        exception = e;
      }
      expect(exception).toBeTruthy();
    });
  });
});
