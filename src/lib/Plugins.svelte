<script lang="ts">
  import ToyBrick from "svelte-material-icons/ToyBrick.svelte";

  export let plugins: string[];
  export let connected: boolean;
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

<div class="dropdown dropdown-end ">
  <button
    class="btn lg:m-1 max-lg:btn-square"
    class:btn-primary={connected && selectedPlugins.length > 0}
    ><ToyBrick class="lg:mr-2" size={20} />
    <span class="hidden lg:block"
      >Select plugins ({selectedPlugins.length})</span
    ></button
  >
  <ul
    class="dropdown-content menu p-2 mt-1 shadow bg-base-100 rounded-box gap-2"
  >
    {#if !connected}
      <li class="disabled">
        <p>You are not connected.</p>
      </li>
    {:else if plugins.length === 0}
      <li class="disabled">
        <p>No plugins found.</p>
      </li>
    {:else}
      {#each plugins as plugin}
        <li>
          <a
            class:active={selectedPlugins.some((name) => name === plugin)}
            href={"#"}
            on:click|preventDefault={() => inputPlugin(plugin)}
          >
            {plugin}
          </a>
        </li>
      {/each}
    {/if}
  </ul>
</div>

<input type="checkbox" id="my-modal" class="modal-toggle" />
<!-- <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          {#each plugins as plugin}
            {#if selectedPlugins.some((name) => name === plugin)}
              <a
                class="dropdown-item is-active"
                href={"#"}
                on:click|preventDefault={() => inputPlugin(plugin)}
              >
                {plugin}
              </a>
            {/if}
            {#if !selectedPlugins.some((name) => name === plugin)}
              <a
                class="dropdown-item"
                href={"#"}
                on:click|preventDefault={() => inputPlugin(plugin)}
              >
                {plugin}
              </a>
            {/if}
          {/each}
        </div>
      </div> -->
