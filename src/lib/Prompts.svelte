<script lang="ts">
  import { get } from 'svelte/store'
  import { promptsStorage } from './Storage.svelte'
  
  const inputPrompt = (prompt: string) => {
    input.value = prompt
    input.style.height = 'auto'
    input.style.height = input.scrollHeight + 'px'
    active = false
  }

  export let input : HTMLTextAreaElement

  let active: boolean = false
</script>

{#if input}
<div class="columns is-centered">
  <div class="column is-half">
    <div class="dropdown is-fullwidth" class:is-active={active}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="dropdown-trigger" on:click={() => { active = !active }}>
        <button class="button is-fullwidth" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>Select a pre-made prompt</span>
          <span class="icon is-small">👇</span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          {#each get(promptsStorage) as prompt}
            <a class="dropdown-item" href={'#'} on:click|preventDefault={() => inputPrompt(prompt.name)}>
              {prompt.system}
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<div class="columns is-centered">
  <div class="column is-half has-text-centered">or type below:</div>
</div>
{/if}