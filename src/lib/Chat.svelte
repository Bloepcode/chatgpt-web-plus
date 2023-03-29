<script lang="ts">
  // import { fetchEventSource } from '@microsoft/fetch-event-source'

  import {
    apiKeyStorage,
    chatsStorage,
    addMessage,
    clearMessages,
    addPlugin,
    removePlugin,
    editMessage,
    emailPasswordStorage,
    deleteMessages,
  } from "./Storage.svelte";
  import type { Message, Chat } from "./Types.svelte";
  import Messages from "./Messages.svelte";

  import { afterUpdate, onMount } from "svelte";
  import { replace } from "svelte-spa-router";
  import Plugins from "./Plugins.svelte";
  import { get } from "svelte/store";
  import Pencil from "svelte-material-icons/Pencil.svelte";
  import Delete from "svelte-material-icons/Delete.svelte";
  import Connection from "svelte-material-icons/Connection.svelte";
  import Send from "svelte-material-icons/Send.svelte";
  // import baseSystem from "../assets/base_system.txt";

  const apiBase = import.meta.env.VITE_API_BASE || "https://api.openai.com";

  let socket: WebSocket;
  export let params = { chatId: "" };
  const chatId: number = parseInt(params.chatId);
  console.log(get(emailPasswordStorage));
  let updating: boolean = false;
  let input: HTMLTextAreaElement;
  let messagesDiv: HTMLDivElement;
  let chatNameInput: HTMLInputElement;
  let plugins: string[] = [];
  let connected: boolean = false;

  $: chat = $chatsStorage.find((chat) => chat.id === chatId) as Chat;

  function removePluginWrapper(i: number) {
    removePlugin(chatId, i);
  }
  function addPluginWrapper(name: string) {
    addPlugin(chatId, name);
  }
  function editMessageWrapper(i: number) {
    deleteMessages(chatId, i);
  }

  afterUpdate(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Send API request
  const sendRequest = (messages: Message[]) => {
    // Show updating bar
    updating = true;

    socket.send(
      JSON.stringify({
        type: "complete",
        data: {
          messages: chat.messages.filter(
            (message) =>
              message.role == "assistant" ||
              message.role == "user" ||
              message.role == "system"
          ),
          plugins: chat.plugins || [],
          extra: { email: get(emailPasswordStorage) },
        },
      })
    );
  };

  const submitForm = async (): Promise<void> => {
    addMessage(chatId, {
      role: "user",
      content: input.value,
      hide: false,
    });
    // Clear the input value
    input.value = "";
    input.blur();

    // Resize back to single line height
    input.style.height = "auto";

    sendRequest(chat.messages);
  };
  const connect = () => {
    socket = new WebSocket("ws://localhost:8000");

    socket.addEventListener("close", () => {
      connected = false;
    });
    socket.addEventListener("message", async (event) => {
      const blob = new Blob([event.data], {
        type: "application/json",
      });
      const unblobbed = await blob.text();
      const _data = JSON.parse(unblobbed);
      const data = _data.data;
      if (_data.type == "init") {
        connected = true;
        plugins = data.plugins;
      }

      if (_data.type == "used_plugins") {
        let plugins_str = "";
        const entries: [string, string[]][] = Object.entries(data.plugins);
        entries.forEach(([key, value]) => {
          plugins_str += " - " + key + ": " + value.join(", ");
        });
        addMessage(chatId, {
          role: "plugin",
          content: "ChatGPT used plugin(s):\n" + plugins_str,
          hide: false,
        });
      }
      if (_data.type == "completed") {
        updating = false;
        for (let i = 0; i < data.messages.length - 1; i++) {
          const message = data.messages[i];
          addMessage(chatId, {
            role: message.role,
            content: message.content,
            hide: true,
          });
        }
        console.log(data.messages);
        const message = data.messages[data.messages.length - 1];
        addMessage(chatId, {
          role: message.role,
          content: message.content,
          hide: false,
        });
      }
      if (_data.type == "error") {
        updating = false;
        addMessage(chatId, {
          role: "error",
          content: data,
          hide: false,
        });
      }
    });
  };

  const deleteChat = () => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      replace("/").then(() => {
        chatsStorage.update((chats) =>
          chats.filter((chat) => chat.id !== chatId)
        );
      });
    }
  };
  connect();
</script>

<div class="flex flex-col h-full">
  <div class="card bg-base-300 z-10 flex-grow-0">
    <div class="card-body flex flex-row items-center p-2 pl-6 justify-between">
      <div class="flex gap-4 flex-row items-center group">
        <h2 class="text-xl">{chat.name || `Chat ${chat.id}`}</h2>
        <!-- <a
          href={"#"}
          class="btn btn-info aspect-square btn-outline"
          title="Rename chat"
          on:click|preventDefault={showChatNameSettings}><Pencil size={20} /></a
        > -->
        <label for="name-modal" class="btn btn-info aspect-square btn-outline"
          ><Pencil size={20} /></label
        >
        <a
          href={"#"}
          class="btn btn-error aspect-square btn-outline"
          title="Delete this chat"
          on:click|preventDefault={deleteChat}><Delete size={20} /></a
        >
      </div>
      <Plugins
        bind:plugins
        selectedPlugins={chat.plugins}
        {connected}
        addPlugin={addPluginWrapper}
        removePlugin={removePluginWrapper}
      />
    </div>
  </div>

  <div
    class="overflow-x-scroll h-full my-4 rounded-box"
    bind:this={messagesDiv}
  >
    <Messages
      bind:input
      messages={chat.messages}
      {updating}
      editMessage={editMessageWrapper}
    />
  </div>

  <form
    on:submit|preventDefault={() => submitForm()}
    class="flex w-full gap-2 flex-grow-0"
  >
    <div class="form-control flex-1">
      <textarea
        class="textarea"
        placeholder="Type your message here..."
        rows="1"
        on:keydown={(e) => {
          // Only send if Enter is pressed, not Shift+Enter
          if (e.key === "Enter" && !e.shiftKey) {
            submitForm();
            e.preventDefault();
          }
        }}
        on:input={(e) => {
          // Resize the textarea to fit the content - auto is important to reset the height after deleting content
          input.style.height = "auto";
          input.style.height = input.scrollHeight + "px";
        }}
        bind:this={input}
      />
    </div>
    <div class="form-control w-fit">
      {#if connected}
        <button class="btn btn-success aspect-square" type="submit"
          ><Send size={20} /></button
        >
      {:else}
        <button
          class="btn btn-success"
          on:click={(e) => {
            e.preventDefault();
            connect();
          }}><Connection size={20} /></button
        >
      {/if}
    </div>
  </form>
</div>

<input type="checkbox" id="name-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-200">
    <h3 class="font-bold text-lg">Change name</h3>
    <div class="form-control">
      <label for="openai-api-key" class="label">
        <span class="label-text">New name</span>
      </label>
      <input
        aria-label="name"
        type="text"
        id="openai-api-key"
        autocomplete="off"
        class="input w-full"
        bind:this={chatNameInput}
        value={chat.name || `Chat ${chat.id}`}
      />
    </div>
    <div class="modal-action">
      <label for="name-modal" class="btn btn-error btn-outline">Cancel</label>
      <label
        for="name-modal"
        on:click={(e) => {
          chat.name = chatNameInput.value;
          chatsStorage.set($chatsStorage);
        }}
        class="btn btn-success">Change</label
      >
    </div>
  </div>
</div>
