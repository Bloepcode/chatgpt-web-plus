<script lang="ts">
  import logo from "../assets/logo.svg";
  import Menu from "svelte-material-icons/Menu.svelte";
</script>

<div
  class="navbar bg-base-200 lg:rounded-box lg:m-4 lg:ml-0 flex justify-between"
  aria-label="main navigation"
>
  <div>
    <a class="text-xl flex" href={"#/"}>
      <img src={logo} class=" mx-4" alt="ChatGPT-web" width="28" height="28" />
      <p class="text-xl">ChatGPT PLUS</p>
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
