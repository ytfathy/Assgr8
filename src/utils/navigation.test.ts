import test from 'node:test';
import assert from 'node:assert/strict';
import { MAIN_NAV_ITEMS, getNavItemById, isValidTabId } from './navigationConfig';

test('navigation items list contains all 7 core modules including smart generator', () => {
  assert.equal(MAIN_NAV_ITEMS.length, 7);
  
  const ids = MAIN_NAV_ITEMS.map(item => item.id);
  assert.ok(ids.includes('home'), 'Must include home');
  assert.ok(ids.includes('zaker_li'), 'Must include zaker_li');
  assert.ok(ids.includes('weekly'), 'Must include weekly');
  assert.ok(ids.includes('skills'), 'Must include skills');
  assert.ok(ids.includes('generator'), 'Must include generator (منشئ الامتحانات الذكي)');
  assert.ok(ids.includes('progress'), 'Must include progress');
  assert.ok(ids.includes('solutions'), 'Must include solutions');
});

test('smart exam generator item has accurate Arabic labels', () => {
  const generator = getNavItemById('generator');
  assert.ok(generator, 'Generator item must exist');
  assert.equal(generator?.label, 'منشئ الامتحانات الذكي');
  assert.equal(generator?.icon, '⚡');
});

test('isValidTabId returns true for valid tabs and false for unknown', () => {
  assert.equal(isValidTabId('generator'), true);
  assert.equal(isValidTabId('zaker_li'), true);
  assert.equal(isValidTabId('admin_infographics'), true);
  assert.equal(isValidTabId('unknown_random_tab'), false);
});
