<script>
    import {
        Song,
        note_to_string,
        effect_to_string,
        effect_record_is_empty,
        effect_record_value_to_string,
    } from "./SongData.js";
    // @ts-ignore
    import { SongPlayer } from "./SongPlayer.js";

    export let order_id = 0;
    export let row_id = 0;
    export let on_play = () => {};

    /**
     * @type {Song}
     */
    export let song;

    /**
     * @type {SongPlayer}
     */
    export let player;

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
        <div class="pattern-columns">
            <div class="pattern-column-1">
                <div class="header">Pattern 1/2</div>
                <div class="row">
                    <span class="mark">{to_hex(pattern_id)}</span>
                    <span class="id">rw</span>
                    <span class="note">nnn</span>
                    <span class="effect">eee</span>
                    <span class="value">vv</span>
                </div>
                {#each records.slice(0, 32) as row, i}
                    <div class="row">
                        <span class="mark">
                            {#if i === row_id}
                                <span class="mark-arrow">&nbsp;></span>
                            {:else}
                                <span class="mark-space">&nbsp;&nbsp;</span>
                            {/if}
                        </span>
                        <span class="id {i % 4 == 0 ? 'quad' : ''}">
                            {to_hex(i)}
                        </span>
                        <span class="note"
                            >{note_to_string(row.note_record)}</span
                        >
                        {#if effect_record_is_empty(row.effect_record)}
                            <span class="fx">---</span>
                            <span class="fx_data">--</span>
                        {:else}
                            <span class="fx">
                                {effect_to_string(row.effect_record.effect)}
                            </span>
                            <span class="fx_data">
                                {effect_record_value_to_string(
                                    row.effect_record
                                )}
                            </span>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class="pattern-column-2">
                <div class="header">Pattern 2/2</div>
                <div class="row">
                    <span class="mark">{to_hex(pattern_id)}</span>
                    <span class="id">rw</span>
                    <span class="note">nnn</span>
                    <span class="effect">eee</span>
                    <span class="value">vv</span>
                </div>
                {#each records.slice(32, 64) as row, i}
                    <div class="row">
                        <span class="mark">
                            {#if i + 32 === row_id}
                                <span class="mark-arrow">&nbsp;></span>
                            {:else}
                                <span class="mark-space">&nbsp;&nbsp;</span>
                            {/if}
                        </span>
                        <span class="id {i % 4 == 0 ? 'quad' : ''}">
                            {to_hex(i + 32)}
                        </span>
                        <span class="note"
                            >{note_to_string(row.note_record)}</span
                        >
                        {#if effect_record_is_empty(row.effect_record)}
                            <span class="fx">---</span>
                            <span class="fx_data">--</span>
                        {:else}
                            <span class="fx">
                                {effect_to_string(row.effect_record.effect)}
                            </span>
                            <span class="fx_data">
                                {effect_record_value_to_string(
                                    row.effect_record
                                )}
                            </span>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <div class="order">
        <div class="header">Order</div>
        <div class="row">
            <span class="mark">{to_hex(order_id)}</span>
            <span class="id">oo</span>
        </div>
        {#each song.pattern_order.data as pattern_id, i}
            <div class="row">
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

    <div class="song">
        <div class="header">Song</div>
        <div class="song-column">
            <div class="row">
                TpS: {song.ticks_per_second}
            </div>
            <div class="row">
                TpN: {song.ticks_per_note}
            </div>
            <div class="row">
                Vol: {4}
            </div>
            <div class="row ala-button" on:click={on_play}>Play</div>
        </div>
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

    .quad {
        color: #ff9200;
    }

    .pattern-columns {
        display: flex;
        flex-direction: row;
    }

    .pattern-column-2 {
        margin-left: 1em;
    }

    .song {
        margin-left: 1em;
    }

    .song-column {
        text-align: left;
    }

    .ala-button {
        text-align: center;
        background-color: #1a1a1a;
        margin: 1px px 0;
        line-height: 22px;
        cursor: pointer;
        border-radius: 3px;
    }

    .ala-button:hover {
        background-color: #2a2a2a;
    }
</style>
