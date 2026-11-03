export async function ensureChat(participants: [string, string]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participants }),
  });
  if (!res.ok) {
    throw new Error("Failed to create or fetch chat");
  }
  return res.json();
}
