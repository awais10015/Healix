export function serializeUser(doc: Record<string, unknown>) {
  const { passwordHash: _hash, ...rest } = doc;
  const id = String(doc._id);
  return { ...rest, id };
}
