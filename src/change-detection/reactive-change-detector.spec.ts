import { ReactiveChangeDetector } from './reactive-change-detector';

describe('reactive change detector', () => {
  it('should create a new detector and adopt it', () => {
    const cd = new ReactiveChangeDetector();
    const child = cd.fork();

    expect(child.parent).toBe(cd);
    expect(child.root).toBe(cd);
    expect(cd.root).toBe(cd);
  });
});