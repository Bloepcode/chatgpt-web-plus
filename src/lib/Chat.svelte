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
  } from "./Storage.svelte";
  import type { Message, Chat } from "./Types.svelte";
  import Messages from "./Messages.svelte";

  import { afterUpdate, onMount } from "svelte";
  import { replace } from "svelte-spa-router";
  import Plugins from "./Plugins.svelte";
  import { get } from "svelte/store";
  // import baseSystem from "../assets/base_system.txt";

  const apiBase = import.meta.env.VITE_API_BASE || "https://api.openai.com";

  const socket = new WebSocket("ws://localhost:8000");
  export let params = { chatId: "" };
  const chatId: number = parseInt(params.chatId);
  console.log(get(emailPasswordStorage));
  let updating: boolean = false;
  let input: HTMLTextAreaElement;
  let settings: HTMLDivElement;
  let chatNameSettings: HTMLFormElement;
  let recognition: any = null;
  let recording = false;
  let plugins: string[] = [];

  function removePluginWrapper(i: number) {
    removePlugin(chatId, i);
  }
  function addPluginWrapper(name: string) {
    addPlugin(chatId, name);
  }

  $: chat = $chatsStorage.find((chat) => chat.id === chatId) as Chat;

  onMount(async () => {
    // Focus the input on mount
    $: input.focus();

    // Try to detect speech recognition support
    if ("SpeechRecognition" in window) {
      // @ts-ignore
      recognition = new window.SpeechRecognition();
    } else if ("webkitSpeechRecognition" in window) {
      // @ts-ignore
      recognition = new window.webkitSpeechRecognition(); // eslint-disable-line new-cap
    }

    if (recognition) {
      recognition.interimResults = false;
      recognition.onstart = () => {
        recording = true;
      };
      recognition.onresult = (event) => {
        // Stop speech recognition, submit the form and remove the pulse
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        input.value = text;
        recognition.stop();
        recording = false;
        submitForm();
      };
    } else {
      console.log("Speech recognition not supported");
    }
  });

  // Scroll to the bottom of the chat on update
  afterUpdate(() => {
    // Scroll to the bottom of the page after any updates to the messages array
    document
      .querySelector("#content")
      ?.scrollIntoView({ behavior: "smooth", block: "end" });
    input.focus();
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

  socket.addEventListener("message", async (event) => {
    const blob = new Blob([event.data], {
      type: "application/json",
    });
    const unblobbed = await blob.text();
    const _data = JSON.parse(unblobbed);
    const data = _data.data;
    if (_data.type == "plugins") {
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

  const deleteChat = () => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      replace("/").then(() => {
        chatsStorage.update((chats) =>
          chats.filter((chat) => chat.id !== chatId)
        );
      });
    }
  };

  const showChatNameSettings = () => {
    chatNameSettings.classList.add("is-active");
    (
      chatNameSettings.querySelector("#settings-chat-name") as HTMLInputElement
    ).focus();
  };

  const saveChatNameSettings = () => {
    const newChatName = (
      chatNameSettings.querySelector("#settings-chat-name") as HTMLInputElement
    ).value;
    // save if changed
    if (newChatName && newChatName !== chat.name) {
      chat.name = newChatName;
      chatsStorage.set($chatsStorage);
    }
    closeChatNameSettings();
  };

  const closeChatNameSettings = () => {
    chatNameSettings.classList.remove("is-active");
  };

  const recordToggle = () => {
    // Check if already recording - if so, stop - else start
    if (recording) {
      recognition?.stop();
      recording = false;
    } else {
      recognition?.start();
    }
  };
</script>

<nav class="level chat-header">
  <div class="level-left">
    <div class="level-item">
      <p class="subtitle is-5">
        {chat.name || `Chat ${chat.id}`}
        <a
          href={"#"}
          class="greyscale ml-2 is-hidden has-text-weight-bold editbutton"
          title="Rename chat"
          on:click|preventDefault={showChatNameSettings}>✏️</a
        >
        <a
          href={"#"}
          class="greyscale ml-2 is-hidden has-text-weight-bold editbutton"
          title="Delete this chat"
          on:click|preventDefault={deleteChat}>🗑️</a
        >
      </p>
    </div>
  </div>

  <div class="level-right">
    <p class="level-item">
      <button
        class="button is-warning"
        on:click={() => {
          clearMessages(chatId);
        }}><span class="greyscale mr-2">🗑️</span> Clear messages</button
      >
    </p>
  </div>
</nav>

<Plugins
  bind:plugins
  selectedPlugins={chat.plugins}
  addPlugin={addPluginWrapper}
  removePlugin={removePluginWrapper}
/>

<Messages bind:input messages={chat.messages} {chatId} />

{#if updating}
  <article class="message is-success assistant-message">
    <div class="message-body content">
      <span class="is-loading" />
    </div>
  </article>
{/if}

<form
  class="field has-addons has-addons-right is-align-items-flex-end"
  on:submit|preventDefault={() => submitForm()}
>
  <p class="control is-expanded">
    <textarea
      class="input is-info is-focused chat-input"
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
        $: input.style.height = "auto";
        $: input.style.height = input.scrollHeight + "px";
      }}
      bind:this={input}
    />
  </p>
  <p class="control" class:is-hidden={!recognition}>
    <button
      class="button"
      class:is-pulse={recording}
      on:click|preventDefault={recordToggle}
      ><span class="greyscale">🎤</span></button
    >
  </p>
  <p class="control">
    <button class="button is-info" type="submit">🚀 Send</button>
  </p>
</form>

<!-- rename modal -->
<form
  class="modal"
  bind:this={chatNameSettings}
  on:submit={saveChatNameSettings}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="modal-background" on:click={closeChatNameSettings} />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Enter a new name for this chat</p>
    </header>
    <section class="modal-card-body">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="settings-chat-name">New name:</label>
        </div>
        <div class="field-body">
          <div class="field">
            <input
              class="input"
              type="text"
              id="settings-chat-name"
              value={chat.name}
            />
          </div>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      <input type="submit" class="button is-info" value="Save" />
      <button class="button" on:click={closeChatNameSettings}>Cancel</button>
    </footer>
  </div>
</form>
<!-- end -->
