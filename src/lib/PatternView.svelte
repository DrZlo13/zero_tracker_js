<script>
    import {
        Song,
        note_to_string,
        effect_to_string,
        effect_record_is_empty,
        effect_record_value_to_string,
    } from "./SongData.js";

    export let pattern_id = 0;
    export let row_id = 0;

    /**
     * @type {Song}
     */
    export let song = null;

    let records = [];
    if (song) {
        let pattern = song.patterns[pattern_id];
        let channel_id = 0;
        records = pattern.channels[channel_id].records;
    }

    function to_hex(d) {
        return ("0" + Number(d).toString(16)).slice(-2).toUpperCase();
    }
</script>

<div class="pattern">
    <div class="pattern-cell">
        <span class="mark">&nbsp;</span>
        <span class="id">rw</span>
        <span class="note">nnn</span>
        <span class="effect">eee</span>
        <span class="value">vv</span>
    </div>
    {#each records as row, i}
        <div class="pattern-cell">
            <span class="mark">
                {#if i === row_id}
                    <span class="mark-arrow">></span>
                {:else}
                    <span class="mark-space">&nbsp;</span>
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

<style>
    .pattern {
        width: 100%;
        height: 100%;
    }

    .pattern-cell {
        position: relative;
    }
</style>
