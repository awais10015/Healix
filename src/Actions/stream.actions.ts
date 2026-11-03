"use server";
import { getSession } from "@/lib/auth";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const session = await getSession();
  if (!session) throw new Error("User is not Logged In");
  if (!apiKey) throw new Error("API key is missing, no API key");
  if (!apiSecret) throw new Error("API secret is missing, no API secret");

  const client = new StreamClient(apiKey, apiSecret);
  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;

  const token = client.generateUserToken({
    user_id: session.sub,
    validity_in_seconds: exp,
  });
  return token;
};
