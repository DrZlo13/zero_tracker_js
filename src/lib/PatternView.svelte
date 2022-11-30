<script>
    export let song;
    export let selected_id = 0;

    const pattern_size = 64;

    function toHex(d) {
        return ("0" + Number(d).toString(16)).slice(-2).toUpperCase();
    }
</script>

<div class="pattern">
    {#each Array(pattern_size).fill(0) as _, i}
        <div class="pattern-cell {selected_id == i ? 'selected' : ''}">
            <span class="id">{toHex(i)}</span>
            <span class="note">C 2</span>
            <span class="fx">A</span>
            <span class="fx_data">47</span>
        </div>
    {/each}
</div>

<style>
    .pattern {
        width: 100%;
        height: 100%;
    }
</style>
