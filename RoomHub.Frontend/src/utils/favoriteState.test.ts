import test from 'node:test';
import assert from 'node:assert/strict';
import { updateFavoriteIds } from './favoriteState.ts';

test('optimistic favorite update can be rolled back after a failed add', () => {
  const initial = new Set<number>();
  const optimistic = updateFavoriteIds(initial, 42, true);
  const rolledBack = updateFavoriteIds(optimistic, 42, false);

  assert.equal(optimistic.has(42), true);
  assert.equal(rolledBack.has(42), false);
  assert.equal(initial.has(42), false);
});

test('optimistic remove can restore the previous favorite after failure', () => {
  const initial = new Set([42]);
  const optimistic = updateFavoriteIds(initial, 42, false);
  const rolledBack = updateFavoriteIds(optimistic, 42, true);

  assert.equal(optimistic.has(42), false);
  assert.equal(rolledBack.has(42), true);
  assert.equal(initial.has(42), true);
});
