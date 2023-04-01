export class CliosError extends Error {
  static of = (message: string): CliosError => new CliosError(message);
}
