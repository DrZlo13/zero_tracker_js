<script>
    import {
        Song,
        note_to_string,
        effect_to_string,
        effect_record_is_empty,
        effect_record_value_to_string,
    } from "./SongData.js";

    export let order_id = 0;
    export let row_id = 0;

    /**
     * @type {Song}
     */
    export let song;

    $: pattern_id = song.pattern_order.data[order_id];
    $: pattern = song.patterns[pattern_id];
    let channel_id = 0;
    $: records = pattern.channels[channel_id].records;

    function to_hex(d) {
        return ("0" + Number(d).toString(16)).slice(-2).toUpperCase();
    }
</script>

<div class="view">
    <div class="pattern">
        <div class="pattern-row">
            <span class="mark">{to_hex(pattern_id)}</span>
            <span class="id">rw</span>
            <span class="note">nnn</span>
            <span class="effect">eee</span>
            <span class="value">vv</span>
        </div>
        {#each records as row, i}
            <div class="pattern-row">
                <span class="mark">
                    {#if i === row_id}
                        <span class="mark-arrow">&nbsp;></span>
                    {:else}
                        <span class="mark-space">&nbsp;&nbsp;</span>
                    {/if}
                </span>
                <span class="id">{to_hex(i)}</span>
                <span class="note">{note_to_string(row.note_record)}</span>
                {#if effect_record_is_empty(row.effect_record)}
                    <span class="fx">---</span>
                    <span class="fx_data">--</span>
                {:else}
                    <span class="fx">
                        {effect_to_string(row.effect_record.effect)}
                    </span>
                    <span class="fx_data">
                        {effect_record_value_to_string(row.effect_record)}
                    </span>
                {/if}
            </div>
        {/each}
    </div>

    <div class="order">
        <div class="pattern-row">
            <span class="mark">{to_hex(pattern_id)}</span>
            <span class="id">nn</span>
        </div>
        {#each song.pattern_order.data as pattern_id, i}
            <div class="pattern-row">
                <span class="mark">
                    {#if i === order_id}
                        <span class="mark-arrow">&nbsp;></span>
                    {:else}
                        <span class="mark-space">&nbsp;&nbsp;</span>
                    {/if}
                </span>
                <span class="id">{to_hex(pattern_id)}</span>
            </div>
        {/each}
    </div>
</div>

<style>
    .pattern,
    .order {
        display: flex;
        flex-direction: column;
    }

    .order {
        margin-left: 1em;
    }

    .view {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        justify-content: space-between;
    }
</style>
