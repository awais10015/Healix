"use client";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { tokenProvider } from "@/Actions/stream.actions";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthProvider";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export const StreamVideoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setVideoClient(null);
      return;
    }
    if (!apiKey) return;

    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.id,
        name: user.username || user.firstName || user.email,
        image: user.photo,
      },
      tokenProvider,
    });

    setVideoClient(client);
  }, [user, isLoading]);

  if (!apiKey || !user) return <>{children}</>;
  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};
