<script lang="ts">
  import Menu from "svelte-material-icons/Menu.svelte";
</script>

<div
  class="navbar bg-base-200 lg:rounded-box lg:m-4 lg:ml-0 flex justify-between"
  aria-label="main navigation"
>
  <div>
    <a class="text-xl flex" href={"#/"}>
      <p class="text-xl mx-4">ChatGPT PLUS</p>
    </a>
  </div>
  <div>
    <label
      for="sidebar"
      class="btn btn-primary btn-square drawer-button lg:hidden"
      ><Menu size={20} /></label
    >
  </div>
</div>
