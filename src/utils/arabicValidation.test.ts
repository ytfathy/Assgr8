import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeArabicText, validateArabicAnswer, calculatePoints, getStudentRank } from './arabicValidation';

test('normalizeArabicText removes tashkeel and normalizes alefs and taa marbuta', () => {
  const input = 'أولَى الدُّوَلِ الأَسْيَوِيَّةِ!';
  const expected = 'اولي الدول الاسيويه';
  assert.equal(normalizeArabicText(input), expected);
});

test('validateArabicAnswer matches identical or slight spelling differences', () => {
  const correct = 'قارة آسيا';
  assert.equal(validateArabicAnswer('قارة اسيا', correct), true);
  assert.equal(validateArabicAnswer('اسيا', correct, ['اسيا', 'آسيا']), true);
  assert.equal(validateArabicAnswer('افريقيا', correct), false);
});

test('calculatePoints handles first try bonus and difficulty', () => {
  assert.equal(calculatePoints('سهل', true), 10);
  assert.equal(calculatePoints('سهل', false), 5);
  assert.equal(calculatePoints('متقدم', true), 30);
  assert.equal(calculatePoints('متقدم', false), 15);
});

test('getStudentRank calculates correct tier', () => {
  assert.equal(getStudentRank(50).title.includes('مستكشف'), true);
  assert.equal(getStudentRank(300).title.includes('مؤرخ'), true);
  assert.equal(getStudentRank(1200).title.includes('عبقري'), true);
});
