<script>
    import { onMount } from "svelte";

    let version = "unknown";

    onMount(() => {
        // @ts-ignore
        version = __BRANCH__ + ":" + __COMMIT_HASH__;
    });
</script>

<div>
    {version}
</div>

<style>
    div {
        font-size: 0.8em;
        color: #888;
        text-align: right;
        margin: 0 0.5em;
        position: fixed;
        bottom: 0;
        right: 0;
    }
</style>
