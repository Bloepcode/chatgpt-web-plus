<script context="module" lang="ts">
  import { persisted } from "svelte-local-storage-store";
  import { get } from "svelte/store";
  import Plugins from "./Plugins.svelte";
  import type {
    Chat,
    EmailPassword,
    Message,
    Plugin,
    Prompt,
  } from "./Types.svelte";

  export const chatsStorage = persisted("chats", [] as Chat[]);
  export const promptsStorage = persisted("prompts", [] as Prompt[]);
  export const apiKeyStorage = persisted("apiKey", "" as string);
  export const emailPasswordStorage = persisted(
    "emailPassword",
    {} as EmailPassword
  );

  export const addChat = (): number => {
    const chats = get(chatsStorage);

    // Find the max chatId
    const chatId =
      chats.reduce((maxId, chat) => Math.max(maxId, chat.id), 0) + 1;

    // Add a new chat
    chats.push({
      id: chatId,
      name: `Chat ${chatId}`,
      messages: [{ role: "system", hide: true, content: "" }],
      plugins: [],
    });
    chatsStorage.set(chats);
    return chatId;
  };

  export const clearChats = () => {
    chatsStorage.set([]);
  };

  export const addMessage = (chatId: number, message: Message) => {
    const chats = get(chatsStorage);
    const chat = chats.find((chat) => chat.id === chatId) as Chat;
    chat.messages.push(message);
    chatsStorage.set(chats);
  };

  export const removePlugin = (chatId: number, i: number) => {
    const chats = get(chatsStorage);
    const chat = chats.find((chat) => chat.id === chatId) as Chat;
    chat.plugins.splice(i, 1);
    chatsStorage.set(chats);
  };

  export const addPlugin = (chatId: number, name: string) => {
    const chats = get(chatsStorage);
    const chat = chats.find((chat) => chat.id === chatId) as Chat;
    chat.plugins.push(name);
    chatsStorage.set(chats);
  };

  export const editMessage = (
    chatId: number,
    index: number,
    newMessage: Message,
    deleteAfter: boolean
  ) => {
    const chats = get(chatsStorage);
    const chat = chats.find((chat) => chat.id === chatId) as Chat;
    chat.messages[index] = newMessage;
    if (deleteAfter) {
      chat.messages.splice(index + 1); // remove the rest of the messages
    }
    chatsStorage.set(chats);
  };

  export const clearMessages = (chatId: number) => {
    const chats = get(chatsStorage);
    const chat = chats.find((chat) => chat.id === chatId) as Chat;
    chat.messages.splice(1);
    chatsStorage.set(chats);
  };

  export const deleteMessages = (chatId: number, index: number) => {
    const chats = get(chatsStorage);
    const chat = chats.find((chat) => chat.id === chatId) as Chat;
    chat.messages.splice(index);
    chatsStorage.set(chats);
  };

  export const deleteChat = (chatId: number) => {
    const chats = get(chatsStorage);
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);
    chats.splice(chatIndex, 1);
    chatsStorage.set(chats);
  };
</script>
