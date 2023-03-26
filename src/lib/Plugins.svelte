<script lang="ts">
  import { plugins } from "./plugins/Plugins";
  import type { Plugin } from "./Types.svelte";

  export let selectedPlugins: string[];
  export let addPlugin: (name: string) => void;
  export let removePlugin: (i: number) => void;

  const inputPlugin = (pluginName: string) => {
    if (selectedPlugins.some((name) => name === pluginName)) {
      removePlugin(selectedPlugins.findIndex((name) => name === pluginName));
    } else {
      addPlugin(pluginName);
    }
    console.log(selectedPlugins);
  };

  let active: boolean = false;
</script>

<div class="columns is-centered">
  <div class="column is-half">
    <div class="dropdown is-fullwidth" class:is-active={active}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="dropdown-trigger"
        on:click={() => {
          active = !active;
        }}
      >
        <button
          class="button is-fullwidth"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
        >
          <span>Select some plugins</span>
          <span class="icon is-small">👇</span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          {#each plugins as plugin}
            {#if selectedPlugins.some((name) => name === plugin.name)}
              <a
                class="dropdown-item is-active"
                href={"#"}
                on:click|preventDefault={() => inputPlugin(plugin.name)}
              >
                {plugin.name}
              </a>
            {/if}
            {#if !selectedPlugins.some((name) => name === plugin.name)}
              <a
                class="dropdown-item"
                href={"#"}
                on:click|preventDefault={() => inputPlugin(plugin.name)}
              >
                {plugin.name}
              </a>
            {/if}
          {/each}
        </div>
        <!-- <div class="dropdown-content">
          {#each plugins as plugin}
            <a
              class="dropdown-item"
              href={"#"}
              on:click|preventDefault={() => inputPlugin(plugin.name)}
            >
              {plugin.name}
            </a>
          {/each}
        </div> -->
      </div>
    </div>
  </div>
</div>
