<script>
  import * as Tone from "tone";
  import PatternView from "./lib/PatternView.svelte";
  import { demo_song } from "./lib/SongData.js";
  import { Osc, Track, SongPlayer } from "./lib/SongPlayer.js";
  import Version from "./lib/Version.svelte";

  let song = demo_song;
  let row_id = 0;
  let order_id = 0;

  /** @type {Tone.PulseOscillator} */
  let osc;
  let volume;

  let loop;
  let playing = false;

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

  const stop_player = () => {
    playing = false;
    clearInterval(loop);
    osc.stop();
    row_id = 0;
    order_id = 0;
  };

  const track = new Track(
    (/** @type {number} */ row) => {
      row_id = row;
    },
    (/** @type {number} */ order) => {
      order_id = order;
    },
    (/** @type {boolean}*/ state) => {
      if (!state) {
        stop_player();
      }
    }
  );

  let player = new SongPlayer(song, player_osc, track);
  player.state.playing = true;

  const interrupt_body = () => {
    player.interrupt();
  };

  const play = () => {
    if (!playing) {
      playing = true;
      volume = new Tone.Volume(-30).toDestination();
      osc = new Tone.PulseOscillator(frequency, width).connect(volume).start();
      player.set_order(order_id);
      player.set_row(row_id);
      player.set_playing(playing);
      loop = setInterval(() => {
        interrupt_body();
      }, 1000 / song.ticks_per_second);
    } else {
      stop_player();
    }
  };
</script>

<main>
  <PatternView {song} {order_id} {row_id} {player} on_play={play} />
</main>

<Version />
