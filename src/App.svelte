<script>
  import * as Tone from "tone";
  import PatternView from "./lib/PatternView.svelte";

  let song = {
    ticks_per_second: 100,
    ticks_per_note: 2,
  };

  let osc;
  let loop;
  let start = false;

  let frequency = 440;
  const interrupt_body = () => {
    osc.frequency.value = frequency;
    frequency = frequency * 1.01;
    osc.start();
  };

  const play = () => {
    if (!start) {
      start = true;
      Tone.start();

      osc = new Tone.Oscillator(440, "square").toDestination();
      loop = setInterval(() => {
        interrupt_body();
      }, 1000 / song.ticks_per_second);
    }
  };
</script>

<main>
  <button on:click={play}>Play</button>
  <PatternView {song} />
</main>
