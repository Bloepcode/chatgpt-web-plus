<script lang="ts">
  import Code from "./Code.svelte";
  import SvelteMarkdown from "svelte-markdown";
  import type { Message, Model, Usage } from "./Types.svelte";
  import Loading from "svelte-material-icons/Loading.svelte";
  import Pencil from "svelte-material-icons/Pencil.svelte";

  // Marked options
  const markedownOptions = {
    gfm: true, // Use GitHub Flavored Markdown
    breaks: true, // Enable line breaks in markdown
    mangle: false, // Do not mangle email addresses
  };

  export let messages: Message[];
  export let input: HTMLTextAreaElement;
  export let updating: boolean;
  export let editMessage: (i: number) => void;

  console.log(messages);
</script>

<div class="flex flex-col gap-4 py-4">
  {#each messages as message, i}
    {#if !message.hide}
      <div
        class="card max-w-9-10 lg:max-w-4-5"
        class:self-end={message.role === "user"}
        class:bg-success={message.role === "user"}
        class:text-success-content={message.role === "user"}
        class:bg-neutral={message.role === "assistant"}
        class:bg-info={message.role === "plugin"}
        class:text-info-content={message.role === "plugin"}
        class:bg-error={message.role === "error"}
        class:text-error-content={message.role === "error"}
        class:max-w-3-5={message.role === "plugin" || message.role === "error"}
      >
        <div class="group card-body content p-6 relative">
          {#if message.role === "user"}
            <button
              class="absolute transition-transform scale-0 group-hover:scale-100 top-0 left-0 btn btn-circle -translate-x-1/4 -translate-y-1/4"
              on:click={() => {
                input.value = message.content;
                input.focus();
                editMessage(i);
              }}
            >
              <Pencil size={20} />
            </button>
          {/if}
          <SvelteMarkdown
            source={message.content}
            options={markedownOptions}
            renderers={{ code: Code, html: Code }}
          />
        </div>
      </div>
    {/if}
  {/each}
  {#if updating}
    <div class="card w-fit bg-warning text-warning-content">
      <div class="card-body content p-6 flex flex-row items-center">
        <Loading class="animate-spin" size={20} /> Loading...
      </div>
    </div>
  {/if}
</div>
