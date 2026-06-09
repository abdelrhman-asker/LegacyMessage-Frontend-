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

type Message = {
  id: string;
  title: string;
  content: string;
  status: string;
  releaseType: string;
  createdAt: string;
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
};

type AddFriendResponse = {
  friend: Friend;
};

type MessagesResponse = {
  messages: Message[];
};

type SendMessageResponse = {
  message: Message;
  credits?: {
    balance: number;
  } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [user, setUser] = useState<MeResponse['user'] | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [friendStatus, setFriendStatus] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageStatus, setMessageStatus] = useState('');
  const [friendLoading, setFriendLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
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
  const canSendMessage =
    Boolean(selectedFriendId) && messageContent.trim().length > 0 && creditBalance > 0;

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

      setFriends((current) => {
        const withoutDuplicate = current.filter(
          (friend) => friend.id !== data.friend.id,
        );
        return [data.friend, ...withoutDuplicate];
      });
      setSelectedFriendId(data.friend.id);
      setFriendIdentifier('');
      setFriendStatus(`${data.friend.name} is now a friend.`);
    } catch (error) {
      setFriendStatus(
        error instanceof Error ? error.message : 'Could not add friend.',
      );
    } finally {
      setFriendLoading(false);
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

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <section className="rounded-lg border border-[#dfd2c7] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm text-gray-500">{t('dashboard.credits')}</p>
              <h2 className="text-4xl font-bold text-[#231815]">{creditBalance}</h2>
              <p className="text-sm text-gray-500">1 message = 1 credit</p>
            </div>

            <form className="space-y-3" onSubmit={handleAddFriend}>
              <label className="block text-sm font-semibold text-gray-700" htmlFor="friendIdentifier">
                Add friend
              </label>
              <input
                id="friendIdentifier"
                value={friendIdentifier}
                onChange={(event) => setFriendIdentifier(event.target.value)}
                className="w-full rounded-lg border border-[#d8c6b5] px-3 py-2 outline-none focus:border-[#612014]"
                placeholder="email or username"
                disabled={friendLoading}
              />
              <button
                type="submit"
                disabled={friendLoading}
                className="buttonMain w-full rounded-lg px-4 py-2 disabled:opacity-60"
              >
                {friendLoading ? 'Adding...' : 'Add friend'}
              </button>
              {friendStatus ? (
                <p className="text-sm text-[#612014]">{friendStatus}</p>
              ) : null}
            </form>

            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold uppercase text-gray-500">
                Friends
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
            <div className="flex flex-col gap-2 border-b border-[#eadfd5] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Messaging</p>
                <h2 className="text-xl font-bold text-[#231815]">
                  {selectedFriend ? selectedFriend.name : 'All messages'}
                </h2>
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
                  {creditBalance > 0 ? `${creditBalance} credits available` : 'No credits available'}
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
                    className="rounded-lg border border-[#eadfd5] bg-[#fffdfb] p-4"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-[#231815]">{message.title}</h4>
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
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
