<script lang="ts">
  import { apiKeyStorage, emailPasswordStorage } from "./Storage.svelte";

  $: apiKey = $apiKeyStorage;
  $: emailPassword = $emailPasswordStorage;
</script>

<div
  class="card bg-base-300 mb-4"
  class:is-danger={!apiKey}
  class:is-warning={apiKey}
>
  <div class="card-body">
    <h2 class="card-title">Set your OpenAI API key below:</h2>

    <form
      on:submit|preventDefault={(event) => {
        if (event.target && event.target[0].value) {
          apiKeyStorage.set(event.target[0].value);
        }
      }}
    >
      <div class="form-control">
        <label for="openai-api-key" class="label">
          <span class="label-text">API key</span>
        </label>
        <input
          aria-label="OpenAI API key"
          type="password"
          id="openai-api-key"
          autocomplete="off"
          class="input w-full"
          value={apiKey}
        />
      </div>
      <button class="btn btn-primary mt-2" type="submit">Save</button>
    </form>

    {#if !apiKey}
      <p class="help is-danger">
        Please enter your <a href="https://platform.openai.com/account/api-keys"
          >OpenAI API key</a
        > above to use ChatGPT-web. It is required to use ChatGPT-web.
      </p>
    {/if}
  </div>
</div>
{#if apiKey}
  <div class="card bg-base-300">
    <div class="card-body">
      Select an existing chat on the sidebar, or
      <a class="link-primary" href={"#/chat/new"}>create a new chat</a>
    </div>
  </div>
{/if}
