<script lang="ts">
  import Router, { location, querystring, replace } from "svelte-spa-router";
  import { wrap } from "svelte-spa-router/wrap";

  import Navbar from "./lib/Navbar.svelte";
  import Sidebar from "./lib/Sidebar.svelte";
  import Home from "./lib/Home.svelte";
  import Chat from "./lib/Chat.svelte";
  import NewChat from "./lib/NewChat.svelte";
  import Close from "svelte-material-icons/Close.svelte";
  import { chatsStorage, apiKeyStorage } from "./lib/Storage.svelte";

  // Check if the API key is passed in as a "key" query parameter - if so, save it
  // Example: https://niek.github.io/chatgpt-web/#/?key=sk-...
  const urlParams: URLSearchParams = new URLSearchParams($querystring);
  if (urlParams.has("key")) {
    apiKeyStorage.set(urlParams.get("key") as string);
  }

  // The definition of the routes with some conditions
  const routes = {
    "/": Home,

    "/chat/new": wrap({
      component: NewChat,
      conditions: () => {
        return !!$apiKeyStorage;
      },
    }),

    "/chat/:chatId": wrap({
      component: Chat,
      conditions: (detail) => {
        return (
          $chatsStorage.find(
            (chat) => chat.id === parseInt(detail?.params?.chatId as string)
          ) !== undefined
        );
      },
    }),

    "*": Home,
  };
</script>

<div class="drawer drawer-mobile">
  <input id="sidebar" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content lg:pl-0 flex flex-col pb-4">
    <Navbar />
    <div
      class="content w-full flex-1 h-full lg:rounded-box bg-base-200 p-4 overflow-x-scroll relative"
    >
      {#key $location}
        <Router {routes} on:conditionsFailed={() => replace("/")} />
      {/key}
    </div>
  </div>
  <div class="drawer-side">
    <label for="sidebar" class="drawer-overlay" />
    <div
      class="p-4 lg:m-4 w-80 bg-base-200 text-base-content lg:rounded-box relative overflow-y-scroll"
    >
      <div class="gap-4 menu">
        <Sidebar />
        <label
          class="absolute transition-transform top-0 right-0 btn btn-circle rounded-tr-none lg:hidden"
          for="sidebar"
        >
          <Close size={20} />
        </label>
      </div>
    </div>
  </div>
</div>
