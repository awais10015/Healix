"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserAvatar } from "@/components/UserAvatar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { FiSend } from "react-icons/fi";
import { FaVideo } from "react-icons/fa";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { toast } from "sonner";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "nextjs-toploader/app";

import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import { ensureChat } from "@/lib/ensure-chat";
import { pusherClient } from "@/lib/pusher";
import { sendMessage } from "@/lib/actions/message.action";
import selectedUserContext from "@/app/context/selectedUserContext";
import doctorContext from "@/app/context/doctorContext";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DoctorBrowseCard,
  PatientChatCard,
} from "../doctors/DoctorCard";
import { ChatInbox } from "./ChatInbox";

function ChatSearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Search"
      />
    </div>
  );
}

function PickerShell({ title, subtitle, query, onQueryChange, searchPlaceholder, children }) {
  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-6 bg-background text-foreground min-h-full">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        <ChatSearchBar
          value={query}
          onChange={onQueryChange}
          placeholder={searchPlaceholder}
        />
      </header>
      {children}
    </div>
  );
}

function EmptyMessage({ message }) {
  return (
    <p className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
      {message}
    </p>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { selectedUser, setSelectedUser } = useContext(selectedUserContext);
  const { doctor, setDoctor } = useContext(doctorContext);

  const isDoctor = isDoctorUser(user);

  const doctorIdParam = searchParams.get("doctorId") || "";
  const patientIdParam = searchParams.get("patientId") || "";
  const effectiveDoctorId = isDoctor
    ? doctor || doctorIdParam
    : doctorIdParam;

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [callParticipants, setCallParticipants] = useState([]);

  const [text, setText] = useState("");
  const [messageSentState, setMessageSentState] = useState(true);
  const [threads, setThreads] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const pickNew = searchParams.get("new") === "1";

  const client = useStreamVideoClient();
  const [values] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });

  const showThread =
    !!effectiveDoctorId &&
    (!isDoctor || !!(selectedUser?.id || selectedUser?._id)) &&
    !!chatId &&
    !chatLoading;

  const showChatLoading =
    !!effectiveDoctorId &&
    (!isDoctor || !!(selectedUser?.id || selectedUser?._id)) &&
    chatLoading;

  const showAdminPatients =
    isDoctor && !!effectiveDoctorId && !selectedUser?.id && pickNew;
  const showPatientPicker = !isDoctor && !doctorIdParam && pickNew;
  const showInbox =
    !showThread &&
    !showChatLoading &&
    !showAdminPatients &&
    !showPatientPicker &&
    (isDoctor ? !!effectiveDoctorId : true);

  useEffect(() => {
    const loadLists = async () => {
      setListLoading(true);
      try {
        const [docRes, userRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/users"),
        ]);
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(Array.isArray(docData) ? docData : []);
        }
        if (userRes.ok) {
          const userData = await userRes.json();
          setPatients(Array.isArray(userData) ? userData : []);
        }
      } finally {
        setListLoading(false);
      }
    };
    loadLists();
  }, []);

  useEffect(() => {
    if (!showInbox) return;
    const loadInbox = async () => {
      setInboxLoading(true);
      try {
        const res = await fetch("/api/chat", { credentials: "include" });
        if (!res.ok) {
          setThreads([]);
          return;
        }
        const text = await res.text();
        if (!text) {
          setThreads([]);
          return;
        }
        const data = JSON.parse(text);
        const list = Array.isArray(data) ? data : [];
        const enriched = list.map((chat) => {
          const parts = chat.participants || [];
          const peerId = parts.find(
            (p) =>
              String(p) !== String(user?.id) &&
              String(p) !== String(doctor) &&
              String(p) !== String(effectiveDoctorId)
          );
          let peerLabel = "Conversation";
          if (isDoctor) {
            const p = patients.find(
              (x) => String(x.id || x._id) === String(peerId)
            );
            peerLabel =
              p?.firstName || p?.email || peerLabel;
          } else {
            const d = doctors.find((x) => String(x.id) === String(peerId));
            peerLabel = d?.name || peerLabel;
          }
          const msgs = chat.messages || [];
          const last = msgs[msgs.length - 1];
          return {
            ...chat,
            peerId,
            peerLabel,
            lastPreview: last?.text,
          };
        });
        setThreads(enriched);
      } catch {
        setThreads([]);
      } finally {
        setInboxLoading(false);
      }
    };
    loadInbox();
  }, [
    showInbox,
    user?.id,
    doctor,
    effectiveDoctorId,
    isDoctor,
    patients,
    doctors,
  ]);

  const handleOpenInboxThread = (t) => {
    if (isDoctor) {
      const patient = patients.find(
        (p) => String(p.id || p._id) === String(t.peerId)
      );
      if (patient) {
        handleAdminSelectPatient(patient.id || patient._id, patient);
      }
    } else {
      const doc = doctors.find((d) => String(d.id) === String(t.peerId));
      if (doc) handlePatientSelectDoctor(doc.id, doc);
    }
  };

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (doc) =>
        doc.name?.toLowerCase().includes(q) ||
        doc.designation?.toLowerCase().includes(q)
    );
  }, [doctors, query]);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const haystack = [p.username, p.firstName, p.lastName, p.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [patients, query]);

  const threadPeer = useMemo(() => {
    if (isDoctor) return selectedUser;
    if (selectedUser?.id && selectedUser.id !== user?.id) return selectedUser;
    return doctors.find((d) => String(d.id) === String(doctorIdParam));
  }, [isDoctor, selectedUser, doctors, doctorIdParam, user?.id]);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  const createMeeting = useCallback(async () => {
    if (!client || !user) return;

    try {
      const res = await fetch("/api/meeting/active");
      if (res.ok) {
        const data = await res.json();
        for (const meeting of data) {
          if (isDoctorUser(user)) {
            if (
              callParticipants.every((item) =>
                meeting.participants.includes(item)
              ) &&
              meeting?.participants?.includes(doctor?.toString())
            ) {
              router.push(`/meeting/${meeting.meetingId}`);
              return;
            }
          } else if (
            callParticipants.every((item) =>
              meeting.participants.includes(item)
            ) &&
            meeting?.participants?.includes(user.id)
          ) {
            router.push(`/meeting/${meeting.meetingId}`);
            return;
          }
        }
      }

      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create call");

      const startsAt = values.dateTime.toISOString();
      const description = values.description || "Instant Meeting";
      const participants = callParticipants;

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: { description },
        },
      });

      await fetch("/api/meeting/create", {
        method: "POST",
        body: JSON.stringify({
          meetingId: id,
          createdBy: user.id,
          description,
          startsAt,
          participants,
        }),
      });

      router.push(`/meeting/${id}`);
    } catch (error) {
      console.error("Error in meeting flow:", error);
    }
  }, [
    client,
    user,
    callParticipants,
    doctor,
    router,
    values.dateTime,
    values.description,
  ]);

  useEffect(() => {
    const channel = pusherClient.subscribe("chat-app");

    const handler = (data) => {
      setMessage((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        data.message,
      ]);
    };

    const meetingHandler = (data) => {
      toast("New Meeting", {
        description: `${data.message}`,
        action: {
          label: "Join Meeting",
          onClick: () => {
            createMeeting();
          },
        },
      });
    };
    channel.bind("meeting-created", meetingHandler);
    channel.bind("upcomming-message", handler);

    return () => {
      channel.unbind("upcomming-message", handler);
      channel.unbind("meeting-created", meetingHandler);
      pusherClient.unsubscribe("chat-app");
    };
  }, [createMeeting]);

  useEffect(() => {
    if (!user) return;

    if (isDoctor) {
      if (!effectiveDoctorId || !selectedUser?.id) {
        setChatId(null);
        setMessage([]);
        setChatLoading(false);
        return;
      }
    } else if (!doctorIdParam) {
      setChatId(null);
      setMessage([]);
      setChatLoading(false);
      return;
    }

    let newSenderId = "";
    let newReceiverId = "";

    if (isDoctor) {
      newSenderId = effectiveDoctorId;
      newReceiverId = selectedUser.id;
      setCallParticipants([effectiveDoctorId, selectedUser.id]);
    } else {
      newSenderId = user.id;
      newReceiverId = doctorIdParam;
      setCallParticipants([doctorIdParam, user.id]);
    }

    setSenderId(newSenderId);
    setReceiverId(newReceiverId);

    let cancelled = false;

    const resolveChat = async () => {
      setChatLoading(true);
      try {
        const res = await fetch("/api/chat", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load chats");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter(
          (c) =>
            c.participants.includes(newSenderId) &&
            c.participants.includes(newReceiverId)
        );

        let resolved = filtered[0];
        if (!resolved) {
          resolved = await ensureChat([newSenderId, newReceiverId]);
        }

        if (!cancelled && resolved) {
          setChatId(resolved._id);
          setMessage(resolved.messages || []);
        }
      } catch (err) {
        console.error("Failed to resolve chat:", err);
        if (!cancelled) {
          setChatId(null);
          setMessage([]);
        }
      } finally {
        if (!cancelled) setChatLoading(false);
      }
    };

    resolveChat();
    return () => {
      cancelled = true;
    };
  }, [user, effectiveDoctorId, doctorIdParam, selectedUser, isDoctor]);

  const handlePatientSelectDoctor = async (docId, doc) => {
    if (!user?.id) return;
    try {
      await ensureChat([docId, user.id]);
      setSelectedUser(doc);
      setDoctor(docId);
      router.push(`/chat?doctorId=${doc.id}`);
    } catch (error) {
      console.error("Chat creation failed:", error);
    }
  };

  const handleAdminSelectPatient = async (patientId, patient) => {
    if (!effectiveDoctorId) return;
    try {
      await ensureChat([effectiveDoctorId, patientId]);
      setSelectedUser({ ...patient, id: patient.id || patient._id || patientId });
    } catch (error) {
      console.error("Chat creation failed:", error);
    }
  };

  useEffect(() => {
    if (
      !patientIdParam ||
      !isDoctor ||
      listLoading ||
      !effectiveDoctorId ||
      selectedUser?.id ||
      selectedUser?._id
    ) {
      return;
    }
    const patient = patients.find(
      (p) => String(p.id || p._id) === patientIdParam
    );
    if (patient) {
      handleAdminSelectPatient(patient.id || patient._id, patient);
    }
  }, [
    patientIdParam,
    patients,
    listLoading,
    isDoctor,
    effectiveDoctorId,
    selectedUser,
  ]);

  const handleBackFromThread = () => {
    setSelectedUser(null);
    setChatId(null);
    setMessage([]);
    router.push("/chat");
  };

  const submitHandler = async () => {
    if (!text.trim() || !chatId) return;

    try {
      setMessageSentState(false);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, senderId, receiverId, text }),
      });

      if (!res.ok) {
        console.error("Failed to send message");
        setMessageSentState(true);
        return;
      }
      const newMessage = await res.json();
      await sendMessage(newMessage);
      setText("");
      setMessageSentState(true);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageSentState(true);
    }
  };

  const peerName =
    threadPeer?.name ||
    threadPeer?.firstName ||
    threadPeer?.username ||
    "Chat";
  const peerSubtitle = isDoctor
    ? threadPeer?.email
    : threadPeer?.designation;
  const peerImage = threadPeer?.image || threadPeer?.photo;

  if (showInbox) {
    if (listLoading || inboxLoading) {
      return (
        <div className="p-10 flex justify-center min-h-[40vh]">
          <Loader />
        </div>
      );
    }
    return (
      <PickerShell
        title="Messages"
        subtitle="Your recent conversations"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Filter conversations…"
      >
        <ChatInbox
          threads={threads.filter((t) =>
            !query.trim()
              ? true
              : t.peerLabel?.toLowerCase().includes(query.toLowerCase())
          )}
          onOpenThread={handleOpenInboxThread}
          onNewChat={() => router.push("/chat?new=1")}
        />
      </PickerShell>
    );
  }

  if (showPatientPicker || showAdminPatients) {
    if (listLoading) {
      return (
        <div className="p-10 flex justify-center min-h-[40vh]">
          <Loader />
        </div>
      );
    }

    if (showAdminPatients) {
      return (
        <PickerShell
          title="Chat with patients"
          subtitle="Select a patient to start or continue a conversation."
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Search patients by name or email…"
        >
          {patients.length === 0 ? (
            <EmptyMessage message="No patients registered yet." />
          ) : filteredPatients.length === 0 ? (
            <EmptyMessage message={`No patients match "${query.trim()}".`} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <PatientChatCard
                  key={patient._id || patient.id}
                  patient={patient}
                  onChat={handleAdminSelectPatient}
                />
              ))}
            </div>
          )}
        </PickerShell>
      );
    }

    return (
      <PickerShell
        title="Start a conversation"
        subtitle="Choose a specialist to chat with securely."
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search by name or specialty…"
      >
        {doctors.length === 0 ? (
          <EmptyMessage message="No doctors available." />
        ) : filteredDoctors.length === 0 ? (
          <EmptyMessage message={`No doctors match "${query.trim()}".`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <DoctorBrowseCard
                key={doc.id}
                doc={doc}
                onChat={handlePatientSelectDoctor}
              />
            ))}
          </div>
        )}
      </PickerShell>
    );
  }

  if (showChatLoading) {
    return (
      <div className="p-10 flex justify-center min-h-[40vh] bg-background">
        <Loader />
      </div>
    );
  }

  if (!showThread) {
    return (
      <div className="p-10 flex justify-center min-h-[40vh] bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative p-4 md:p-6 w-full min-h-full bg-background text-foreground pb-24">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-4 mb-4">
        <div className="flex gap-2 items-center min-w-0">
          <div className="block md:hidden shrink-0">
            <SidebarTrigger />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleBackFromThread}
            className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <div className="flex items-center gap-3 min-w-0 ml-1">
            <UserAvatar
              src={peerImage}
              alt={peerName}
              size={40}
              className="h-10 w-10"
              fallbackClassName="bg-muted text-primary text-sm"
              fallbackText={(peerName[0] || "?").toUpperCase()}
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">{peerName}</p>
              {peerSubtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {peerSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          onClick={createMeeting}
          disabled={
            !callParticipants.length || callParticipants.includes(undefined)
          }
          aria-label="Start video call"
        >
          <FaVideo size={18} />
        </Button>
      </div>

      <div
        ref={chatBoxRef}
        id="chat-box"
        className="max-w-6xl mx-auto flex flex-col gap-2 h-[calc(100vh-180px)] overflow-y-auto p-4 rounded-xl border border-border bg-muted/30 shadow-inner scrollbar-hide"
      >
        {Array.isArray(message) && message.length > 0 ? (
          message.map((msg, i) => {
            let bubbleStyle = "";
            const isDoctor =
              msg.senderId === effectiveDoctorId && isDoctorUser(user);
            const isUser = selectedUser?.id === user?.id;

            if (isDoctor) {
              bubbleStyle =
                "bg-primary text-primary-foreground rounded-t-4xl rounded-bl-4xl self-end";
            } else if (
              isUser &&
              ["1", "2", "3", "4", "5", "6"].includes(msg.receiverId)
            ) {
              bubbleStyle =
                "bg-primary text-primary-foreground rounded-t-4xl rounded-bl-4xl self-end";
            } else if (msg.senderId === user?.id) {
              bubbleStyle =
                "bg-primary text-primary-foreground rounded-t-4xl rounded-bl-4xl self-end";
            } else {
              bubbleStyle =
                "bg-muted text-foreground rounded-t-4xl rounded-br-4xl self-start border border-border";
            }

            return (
              <div
                key={msg._id || i}
                className={`max-w-xs px-5 py-3 text-sm shadow-md ${bubbleStyle}`}
              >
                <div className="text-md font-medium mb-2">{msg.text}</div>
                <div className="text-[10px] opacity-80">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-lg">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Send a message to start the conversation.
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-[var(--sidebar-width)] bg-background border-t border-border z-20 p-4 flex items-center gap-2 sm:px-6 md:px-10">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitHandler();
            }
          }}
          className="flex-1"
          placeholder="Type your message..."
        />
        {messageSentState ? (
          <Button
            type="button"
            size="icon"
            onClick={submitHandler}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            aria-label="Send message"
          >
            <FiSend className="w-5 h-5" />
          </Button>
        ) : (
          <div className="shrink-0 px-2">
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>
        )}
      </div>
    </div>
  );
}
