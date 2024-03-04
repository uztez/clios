import { CliosParser } from './parser';
import { Clios } from './clios';
import { CliosPrinter } from './printer';

describe('Clios', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it('create with parser', () => {
    jest.spyOn(CliosParser, 'of');
    jest.spyOn(CliosPrinter, 'of');
    Clios.of([], []);
    expect(CliosParser.of).toHaveBeenCalled();
    expect(CliosPrinter.of).toHaveBeenCalled();
  });
  it('parse', () => {
    let clios = Clios.of([['all']], '--all');
    jest.spyOn(clios.parser, 'parse').mockImplementation();
    clios.parse(true);
    expect(clios.parser.parse).toHaveBeenCalledWith(['--all'], true);
  });
  it('parse with no strict set', () => {
    let clios = Clios.of([['all']], '--all');
    jest.spyOn(clios.parser, 'parse').mockImplementation();
    clios.parse();
    expect(clios.parser.parse).toHaveBeenCalledWith(['--all'], false);
  });
  it('parse with no strict set', () => {
    let clios = Clios.of([['all']], '--all');
    jest.spyOn(clios.printer, 'print').mockImplementation();
    clios.print();
    expect(clios.printer.print).toHaveBeenCalledWith({ prefix: '<command>', suffix: '', shell: false });
  });
});
