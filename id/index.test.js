const id = require('./index');

test('default length', () => {
  expect(id.generate().length).toBe(20);
});

test('length parameter', () => {
  expect(id.generate(25).length).toBe(25);
});

test('type is string', () => {
  expect(typeof(id.generate())).toBe('string');
});
