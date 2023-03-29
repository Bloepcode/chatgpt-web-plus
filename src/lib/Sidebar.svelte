<script lang="ts">
  import { params, replace } from "svelte-spa-router";

  import { apiKeyStorage, chatsStorage, clearChats } from "./Storage.svelte";
  import { exportAsMarkdown } from "./Export.svelte";

  $: sortedChats = $chatsStorage.sort((a, b) => b.id - a.id);

  $: activeChatId =
    $params && $params.chatId ? parseInt($params.chatId) : undefined;
</script>

<p class="label-text ml-2 mt-2">Chats</p>
<ul class="menu menu-normal bg-base-100 w-full rounded-box p-2">
  <li>
    <a href={"#/chat/new"}>New chat</a>
  </li>
</ul>

<ul class="menu menu-normal bg-base-100 w-full rounded-box p-2 gap-2">
  {#if sortedChats.length == 0}
    <li class="disabled"><p class="label-text">No chats yet...</p></li>
  {/if}
  {#each sortedChats as chat}
    <li>
      <a class:active={activeChatId == chat.id} href={`#/chat/${chat.id}`}
        >{chat.name || `Chat ${chat.id}`}</a
      >
    </li>
  {/each}
</ul>

<p class="label-text ml-2 mt-2">Actions</p>
<ul class="menu menu-normal bg-base-100 w-full rounded-box p-2 gap-2">
  <li>
    <a
      class="panel-block"
      href={"#/"}
      on:click|preventDefault={() => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete all your chats?"
        );
        if (confirmDelete) {
          replace("#/").then(() => clearChats());
        }
      }}>Clear chats</a
    >
  </li>
  {#if activeChatId}
    <li>
      <a
        href={"#/"}
        on:click|preventDefault={() => {
          if (activeChatId) {
            exportAsMarkdown(activeChatId);
          }
        }}>Export chat</a
      >
    </li>
  {/if}
  <li>
    <a href={"#/"} class:active={!activeChatId} class="panel-block">Settings</a>
  </li>
</ul>
