<script>
  import * as Tone from "tone";
  import PatternView from "./lib/PatternView.svelte";
  import { demo_song } from "./lib/SongData.js";
  import { Osc, Track, SongPlayer } from "./lib/SongPlayer.js";

  let song = demo_song;
  let pattern_id = 0;
  let row_id = 0;

  /** @type {Tone.PulseOscillator} */
  let osc;

  let loop;
  let start = false;

  let frequency = 440;
  let width = 1.0;

  const player_osc = new Osc(
    () => {
      osc.start();
    },
    () => {
      osc.stop();
    },
    (/** @type {number} */ frequency) => {
      osc.frequency.value = frequency;
    },
    (/** @type {number} */ pwm) => {
      // map pwm [0, 0.5] to [1.0, 0.0]
      pwm = 1.0 - pwm * 2.0;
      osc.width.value = pwm;
    }
  );

  const track = new Track(
    (/** @type {number} */ row) => {
      row_id = row;
    },
    (/** @type {number} */ pattern) => {
      if (pattern == -1) {
        pattern_id = 0;
        row_id = 0;
        start = false;
      } else {
        pattern_id = pattern;
      }
    }
  );

  let player = new SongPlayer(song, player_osc, track);
  player.state.playing = true;

  const interrupt_body = () => {
    player.interrupt();
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
