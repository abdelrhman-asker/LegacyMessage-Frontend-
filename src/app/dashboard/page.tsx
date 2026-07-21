'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useI18n } from '@/i18n/I18nProvider';

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    credits?: {
      balance: number;
      unlimited?: boolean;
    };
  };
};

type Friend = {
  id: string;
  name: string;
  email: string;
  username: string;
  friendSince: string;
};

type FriendRequest = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  direction: 'incoming' | 'outgoing';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
};

type Message = {
  id: string;
  title: string;
  content: string;
  status: string;
  releaseType: string;
  createdAt: string;
  readAt?: string | null;
  unread: boolean;
  direction: 'sent' | 'received';
  sender: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  recipient: {
    id: string | null;
    name: string;
    email: string;
    username: string;
  } | null;
};

type FriendsResponse = {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
};

type AddFriendResponse = {
  status: 'pending' | 'accepted';
  friend?: Friend;
  request?: FriendRequest;
};

type MessagesResponse = {
  messages: Message[];
};

type SendMessageResponse = {
  message: Message;
  credits?: {
    balance: number;
    unlimited?: boolean;
  } | null;
};

type FriendRequestActionResponse = {
  status: 'accepted' | 'declined';
  friend?: Friend;
  request?: FriendRequest;
};

type MarkReadResponse = {
  message: Message;
};

type DashboardTab = 'messages' | 'friends' | 'requests';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [user, setUser] = useState<MeResponse['user'] | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [friendStatus, setFriendStatus] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageStatus, setMessageStatus] = useState('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('messages');
  const [friendLoading, setFriendLoading] = useState(false);
  const [requestActionId, setRequestActionId] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [readLoadingId, setReadLoadingId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const [meData, friendsData, messagesData] = await Promise.all([
          apiRequest<MeResponse>('/auth/me'),
          apiRequest<FriendsResponse>('/friends'),
          apiRequest<MessagesResponse>('/messages'),
        ]);

        if (mounted) {
          setUser(meData.user);
          setFriends(friendsData.friends);
          setIncomingRequests(friendsData.incomingRequests);
          setOutgoingRequests(friendsData.outgoingRequests);
          setMessages(messagesData.messages);
          setSelectedFriendId((current) => current || friendsData.friends[0]?.id || '');
        }
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function refreshFriendRequests() {
      try {
        const friendsData = await apiRequest<FriendsResponse>('/friends');
        if (!mounted) {
          return;
        }
        setFriends(friendsData.friends);
        setIncomingRequests(friendsData.incomingRequests);
        setOutgoingRequests(friendsData.outgoingRequests);
        setSelectedFriendId((current) => current || friendsData.friends[0]?.id || '');
      } catch {
        // Dashboard auth guard handles session failures on primary loads.
      }
    }

    const interval = window.setInterval(refreshFriendRequests, 15000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshFriendRequests();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedFriendId) || null,
    [friends, selectedFriendId],
  );

  const visibleMessages = useMemo(() => {
    if (!selectedFriendId) {
      return messages;
    }

    return messages.filter((message) => {
      return (
        message.sender.id === selectedFriendId ||
        message.recipient?.id === selectedFriendId
      );
    });
  }, [messages, selectedFriendId]);

  const creditBalance = user?.credits?.balance ?? 0;
  const isUnlimited = user?.credits?.unlimited ?? false;
  const unreadCount = messages.filter((message) => message.unread).length;
  const canSendMessage =
    Boolean(selectedFriendId) &&
    messageContent.trim().length > 0 &&
    (isUnlimited || creditBalance > 0);

  async function handleAddFriend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFriendStatus('');

    if (!friendIdentifier.trim()) {
      setFriendStatus('Enter an email or username.');
      return;
    }

    setFriendLoading(true);

    try {
      const data = await apiRequest<AddFriendResponse>('/friends', {
        method: 'POST',
        body: JSON.stringify({ identifier: friendIdentifier }),
      });

      if (data.status === 'accepted' && data.friend) {
        const acceptedFriend = data.friend;
        setFriends((current) => {
          const withoutDuplicate = current.filter(
            (friend) => friend.id !== acceptedFriend.id,
          );
          return [acceptedFriend, ...withoutDuplicate];
        });
        setSelectedFriendId(acceptedFriend.id);
        setFriendStatus(`${acceptedFriend.name} accepted your request.`);
      }

      if (data.status === 'pending' && data.request) {
        const pendingRequest = data.request;
        setOutgoingRequests((current) => {
          const withoutDuplicate = current.filter(
            (request) => request.id !== pendingRequest.id,
          );
          return [pendingRequest, ...withoutDuplicate];
        });
        setFriendStatus(`Request sent to ${pendingRequest.user.name}.`);
        setActiveTab('requests');
      }

      setFriendIdentifier('');
    } catch (error) {
      setFriendStatus(
        error instanceof Error ? error.message : 'Could not add friend.',
      );
    } finally {
      setFriendLoading(false);
    }
  }

  async function handleRequestAction(
    request: FriendRequest,
    action: 'accept' | 'decline',
  ) {
    setFriendStatus('');
    setRequestActionId(request.id);

    try {
      const data = await apiRequest<FriendRequestActionResponse>(
        `/friends/requests/${request.id}/${action}`,
        {
          method: 'POST',
        },
      );

      setIncomingRequests((current) =>
        current.filter((currentRequest) => currentRequest.id !== request.id),
      );

      if (action === 'accept' && data.friend) {
        const acceptedFriend = data.friend;
        setFriends((current) => {
          const withoutDuplicate = current.filter(
            (friend) => friend.id !== acceptedFriend.id,
          );
          return [acceptedFriend, ...withoutDuplicate];
        });
        setSelectedFriendId(acceptedFriend.id);
        setFriendStatus(`${acceptedFriend.name} is now a friend.`);
        setActiveTab('messages');
      } else {
        setFriendStatus(`Request from ${request.user.name} declined.`);
      }
    } catch (error) {
      setFriendStatus(
        error instanceof Error ? error.message : 'Could not update request.',
      );
    } finally {
      setRequestActionId('');
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessageStatus('');

    if (!selectedFriendId) {
      setMessageStatus('Choose a friend first.');
      return;
    }

    if (!messageContent.trim()) {
      setMessageStatus('Write a message before sending.');
      return;
    }

    setMessageLoading(true);

    try {
      const data = await apiRequest<SendMessageResponse>('/messages', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: selectedFriendId,
          title: messageTitle,
          content: messageContent,
        }),
      });

      setMessages((current) => [
        data.message,
        ...current.filter((message) => message.id !== data.message.id),
      ]);
      setUser((current) =>
        current
          ? {
              ...current,
              credits: data.credits ?? current.credits,
            }
          : current,
      );
      setMessageTitle('');
      setMessageContent('');
      setMessageStatus('Message sent. 1 credit used.');
    } catch (error) {
      setMessageStatus(
        error instanceof Error ? error.message : 'Could not send message.',
      );
    } finally {
      setMessageLoading(false);
    }
  }

  async function handleMarkRead(message: Message) {
    if (!message.unread || message.direction !== 'received') {
      return;
    }

    setReadLoadingId(message.id);

    try {
      const data = await apiRequest<MarkReadResponse>(
        `/messages/${message.id}/read`,
        {
          method: 'POST',
        },
      );

      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === message.id ? data.message : currentMessage,
        ),
      );
    } catch (error) {
      setMessageStatus(
        error instanceof Error ? error.message : 'Could not mark message read.',
      );
    } finally {
      setReadLoadingId('');
    }
  }


  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        {t('dashboard.loading')}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3efeb] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-4 rounded-lg border border-[#dfd2c7] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.welcome', { name: user?.name ?? 'User' })}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <p className="mt-1 text-sm font-semibold text-[#612014]">@{user?.username}</p>
          </div>

          <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="buttonMain rounded-lg border px-4 py-2">
            {t('dashboard.logout')}
          </button>
        </div>

        {incomingRequests.length > 0 ? (
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className="flex w-full flex-col gap-1 rounded-lg border border-[#612014] bg-[#fff8f2] p-4 text-left shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <span className="block text-sm font-bold text-[#612014]">
                New friend request{incomingRequests.length === 1 ? '' : 's'}
              </span>
              <span className="block text-sm text-[#604b3d]">
                {incomingRequests[0]?.user.name}
                {incomingRequests.length > 1 ? ` and ${incomingRequests.length - 1} more` : ''} want to connect.
              </span>
            </span>
            <span className="rounded-full bg-[#612014] px-3 py-1 text-xs font-semibold text-white">
              Review
            </span>
          </button>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1fr]">
          <section className="rounded-lg border border-[#dfd2c7] bg-white p-5 shadow-sm">
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="flex flex-col rounded-lg border border-[#eadfd5] bg-[#fffdfb] p-3">
                <p className="text-sm text-gray-500">{t('dashboard.credits')}</p>
                <h2 className="text-2xl font-bold text-[#231815]">
                  {isUnlimited ? '∞' : creditBalance}
                </h2>
                <p className="text-xs text-gray-500">
                  {isUnlimited ? 'Unlimited credits' : '1 message = 1 credit'}
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/billing')}
                  className="mt-2 self-start rounded-lg border border-[#612014] px-3 py-1 text-xs font-semibold text-[#612014] hover:bg-[#fff8f2]"
                >
                  {isUnlimited ? 'Manage credits' : 'Buy credits'}
                </button>
              </div>
              <div className="rounded-lg border border-[#eadfd5] bg-[#fff8f2] p-3">
                <p className="text-sm text-gray-500">Unread</p>
                <h2 className="text-2xl font-bold text-[#612014]">{unreadCount}</h2>
                <p className="text-xs text-gray-500">new messages</p>
              </div>
              <div className="rounded-lg border border-[#eadfd5] bg-[#fffdfb] p-3">
                <p className="text-sm text-gray-500">Requests</p>
                <h2 className="text-2xl font-bold text-[#231815]">{incomingRequests.length}</h2>
                <p className="text-xs text-gray-500">waiting</p>
              </div>
            </div>

            <form className="space-y-3 rounded-lg border border-[#eadfd5] bg-[#fffdfb] p-4 grid lg:grid-cols-[0.75fr_0.25fr] gap-2" onSubmit={handleAddFriend}>
            <div className="!m-0">

              <label className="block text-sm mb-2 font-semibold text-gray-700" htmlFor="friendIdentifier">
                Send friend request
              </label>
              <input
                id="friendIdentifier"
                value={friendIdentifier}
                onChange={(event) => setFriendIdentifier(event.target.value)}
                className="w-full rounded-lg border border-[#d8c6b5] px-3 py-2 outline-none focus:border-[#612014]"
                placeholder="email or username"
                disabled={friendLoading}
              />
              </div>
              <button
                type="submit"
                disabled={friendLoading}
                className="buttonMain self-end w-full max-h-fit rounded-lg px-4 py-2 disabled:opacity-60"
              >
                {friendLoading ? 'Sending...' : 'Send request'}
              </button>
              {friendStatus ? (
                <p className="text-sm text-[#612014]">{friendStatus}</p>
              ) : null}
            </form>

            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold uppercase text-gray-500">
                Quick friends
              </h3>
              {friends.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#d8c6b5] p-3 text-sm text-gray-500">
                  No friends yet.
                </p>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => setSelectedFriendId(friend.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedFriendId === friend.id
                        ? 'border-[#612014] bg-[#fff8f2]'
                        : 'border-[#e7dbd0] bg-white hover:border-[#b99f89]'
                    }`}
                  >
                    <span className="block font-semibold text-[#231815]">{friend.name}</span>
                    <span className="block text-sm text-gray-500">@{friend.username}</span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[#dfd2c7] bg-white p-5 shadow-sm">
            <div className="mb-5 grid grid-cols-3 rounded-lg border border-[#eadfd5] bg-[#fffdfb] p-1">
              {([
                ['messages', `Messages${unreadCount ? ` (${unreadCount})` : ''}`],
                ['friends', `Friends${friends.length ? ` (${friends.length})` : ''}`],
                ['requests', `Requests${incomingRequests.length ? ` (${incomingRequests.length})` : ''}`],
              ] as [DashboardTab, string][]).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? 'bg-[#612014] text-white shadow-sm'
                      : 'text-[#604b3d] hover:bg-[#f6ece3]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'messages' ? (
              <>
            <div className="flex flex-col gap-2 border-b border-[#eadfd5] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Messaging</p>
                <h2 className="text-xl font-bold text-[#231815]">
                  {selectedFriend ? selectedFriend.name : 'All messages'}
                </h2>
                {unreadCount > 0 ? (
                  <p className="mt-1 text-sm font-semibold text-[#612014]">
                    {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
                  </p>
                ) : null}
              </div>

              <select
                className="rounded-lg border border-[#d8c6b5] px-3 py-2"
                value={selectedFriendId}
                onChange={(event) => setSelectedFriendId(event.target.value)}
              >
                <option value="">All friends</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.name} (@{friend.username})
                  </option>
                ))}
              </select>
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleSendMessage}>
              <input
                value={messageTitle}
                onChange={(event) => setMessageTitle(event.target.value)}
                className="w-full rounded-lg border border-[#d8c6b5] px-3 py-2 outline-none focus:border-[#612014]"
                placeholder="Title"
                disabled={messageLoading}
              />
              <textarea
                value={messageContent}
                onChange={(event) => setMessageContent(event.target.value)}
                className="min-h-32 w-full resize-y rounded-lg border border-[#d8c6b5] px-3 py-2 outline-none focus:border-[#612014]"
                placeholder="Write your message"
                disabled={messageLoading}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  {isUnlimited
                    ? 'Unlimited credits'
                    : creditBalance > 0
                      ? `${creditBalance} credits available`
                      : 'No credits available'}
                </p>
                <button
                  type="submit"
                  disabled={!canSendMessage || messageLoading}
                  className="buttonMain rounded-lg px-5 py-2 disabled:opacity-60"
                >
                  {messageLoading ? 'Sending...' : 'Send message'}
                </button>
              </div>
              {messageStatus ? (
                <p className="text-sm text-[#612014]">{messageStatus}</p>
              ) : null}
            </form>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold uppercase text-gray-500">
                Recent messages
              </h3>
              {visibleMessages.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#d8c6b5] p-4 text-sm text-gray-500">
                  No messages yet.
                </p>
              ) : (
                visibleMessages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-lg border p-4 transition ${
                      message.unread
                        ? 'border-[#612014] bg-[#fff8f2] shadow-[0_10px_28px_rgba(97,32,20,0.10)]'
                        : 'border-[#eadfd5] bg-[#fffdfb]'
                    }`}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-[#231815]">{message.title}</h4>
                          {message.unread ? (
                            <span className="rounded-full bg-[#612014] px-2 py-0.5 text-xs font-semibold text-white">
                              New
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-500">
                          {message.direction === 'sent' ? 'To' : 'From'}{' '}
                          {message.direction === 'sent'
                            ? message.recipient?.name ?? message.recipient?.email ?? 'recipient'
                            : message.sender.name}
                        </p>
                      </div>
                      <time className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {message.content}
                    </p>
                    {message.unread ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(message)}
                        disabled={readLoadingId === message.id}
                        className="mt-3 rounded-lg border border-[#612014] px-3 py-2 text-sm font-semibold text-[#612014] disabled:opacity-60"
                      >
                        {readLoadingId === message.id ? 'Updating...' : 'Mark as read'}
                      </button>
                    ) : null}
                  </article>
                ))
              )}
            </div>
              </>
            ) : null}

            {activeTab === 'friends' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Accepted friends</p>
                  <h2 className="text-xl font-bold text-[#231815]">
                    People you can message
                  </h2>
                </div>
                {friends.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[#d8c6b5] p-4 text-sm text-gray-500">
                    No accepted friends yet. Send a request from the left panel.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {friends.map((friend) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => {
                          setSelectedFriendId(friend.id);
                          setActiveTab('messages');
                        }}
                        className="rounded-lg border border-[#eadfd5] bg-[#fffdfb] p-4 text-left transition hover:border-[#612014] hover:bg-[#fff8f2]"
                      >
                        <span className="block font-semibold text-[#231815]">{friend.name}</span>
                        <span className="block text-sm text-gray-500">@{friend.username}</span>
                        <span className="mt-3 inline-flex rounded-full bg-[#f3eadf] px-3 py-1 text-xs font-semibold text-[#612014]">
                          Message
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === 'requests' ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500">Friend requests</p>
                  <h2 className="text-xl font-bold text-[#231815]">
                    Accept or reject safely
                  </h2>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase text-gray-500">
                    Incoming
                  </h3>
                  {incomingRequests.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[#d8c6b5] p-4 text-sm text-gray-500">
                      No incoming requests.
                    </p>
                  ) : (
                    incomingRequests.map((request) => (
                      <article
                        key={request.id}
                        className="rounded-lg border border-[#612014] bg-[#fff8f2] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-semibold text-[#231815]">{request.user.name}</h4>
                            <p className="text-sm text-gray-500">@{request.user.username} · {request.user.email}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:w-56">
                            <button
                              type="button"
                              onClick={() => handleRequestAction(request, 'accept')}
                              disabled={requestActionId === request.id}
                              className="rounded-lg bg-[#1f6f43] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestAction(request, 'decline')}
                              disabled={requestActionId === request.id}
                              className="rounded-lg border border-[#d8c6b5] bg-white px-3 py-2 text-sm font-semibold text-[#612014] disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase text-gray-500">
                    Sent
                  </h3>
                  {outgoingRequests.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[#d8c6b5] p-4 text-sm text-gray-500">
                      No sent requests waiting.
                    </p>
                  ) : (
                    outgoingRequests.map((request) => (
                      <article
                        key={request.id}
                        className="rounded-lg border border-[#eadfd5] bg-[#fffdfb] p-4"
                      >
                        <h4 className="font-semibold text-[#231815]">{request.user.name}</h4>
                        <p className="text-sm text-gray-500">
                          Waiting for @{request.user.username} to accept.
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
