export const updateFavoriteIds = (
  current: ReadonlySet<number>,
  roomId: number,
  shouldFavorite: boolean
) => {
  const next = new Set(current);
  if (shouldFavorite) next.add(roomId);
  else next.delete(roomId);
  return next;
};
