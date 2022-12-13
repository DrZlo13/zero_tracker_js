<script>
  import * as Tone from "tone";
  import PatternView from "./lib/PatternView.svelte";
  import { demo_song } from "./lib/SongData.js";

  let song = demo_song;
  let pattern_id = 0;
  let row_id = 0;

  let osc;
  let loop;
  let start = false;

  let frequency = 440;
  let width = 1.0;

  const interrupt_body = () => {
    osc.frequency.value = frequency;
    osc.width.value = width;
    frequency = frequency * 1.005;
    width = width * 0.99;
    osc.start();
    row_id = (row_id + 1) % 64;
  };

  const play = () => {
    if (!start) {
      start = true;

      osc = new Tone.PulseOscillator(frequency, width).toDestination();
      loop = setInterval(() => {
        interrupt_body();
      }, 1000 / song.ticks_per_second);
    } else {
      start = false;
      clearInterval(loop);
      osc.stop();
      row_id = 0;
    }
  };
</script>

<main>
  <button on:click={play}>{!start ? "Play" : "Stop"}</button>
  <PatternView {song} {pattern_id} {row_id} />
</main>
