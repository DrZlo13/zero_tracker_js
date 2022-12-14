import { Note, Effects, Song, PATTERN_SIZE } from './SongData.js';

const NOTES_PER_OCT = 12;
const notes_oct = [
    130.813,
    138.591,
    146.832,
    155.563,
    164.814,
    174.614,
    184.997,
    195.998,
    207.652,
    220.00,
    233.082,
    246.942,
];

/**
 * @param {number} note
 */
function note_to_freq(note) {
    if (note === Note.None) return 0.0;
    note = note - Note.C2;
    const octave = note / NOTES_PER_OCT;
    const note_in_oct = note % NOTES_PER_OCT;
    return notes_oct[note_in_oct] * (1 << octave);
}

/**
 * @param {number} frequency
 * @param {number} semitones
 */
function frequency_offset_semitones(frequency, semitones) {
    return frequency * (1.0 + ((1.0 / 12.0) * semitones));
}


/**
 * @param {number} frequency
 */
function frequency_get_seventh_of_a_semitone(frequency) {
    return frequency * ((1.0 / 12.0) / 7.0);
}

const FREQUENCY_UNSET = -1.0;
const PWM_MIN = 0.01
const PWM_MAX = 0.5
const PWM_DEFAULT = PWM_MAX
const EFFECT_DATA_NONE = 0;
const EFFECT_DATA_1_MAX = 0x3F

class IntegerOscillator {
    /**
     * @param {number} speed
     * @param {number} depth
     * @param {number} direction
     * @param {number} value
     */
    constructor(speed, depth, direction, value) {
        this.speed = speed;
        this.depth = depth;
        this.direction = direction;
        this.value = value;
    }
}


class ChannelState {
    /**
     * @param {number} frequency
     * @param {number} frequency_target
     * @param {number} pwm
     * @param {boolean} play
     * @param {IntegerOscillator} vibrato
     */
    constructor(frequency, frequency_target, pwm, play, vibrato) {
        this.frequency = frequency;
        this.frequency_target = frequency_target;
        this.pwm = pwm;
        this.play = play;
        this.vibrato = vibrato;
    }
}

function channel_state_start() {
    return new ChannelState(0, 0, 0, false, new IntegerOscillator(0, 0, 0, 0));
}

export class Osc {
    /**
     * @param {function} start
     * @param {function} stop
     * @param {function} set_frequency
     * @param {function} set_pwm
     */
    constructor(start, stop, set_frequency, set_pwm) {
        this.start = start;
        this.stop = stop;
        this.set_frequency = set_frequency;
        this.set_pwm = set_pwm;
    }
}

export class Track {
    /**
     * @param {function} set_row
     * @param {function} set_order_id
     * @param {function} set_state
     */
    constructor(set_row, set_order_id, set_state) {
        this.set_row = set_row;
        this.set_order_id = set_order_id;
        this.set_state = set_state;
    }
}

class SongState {
    /**
     * @param {number} tick
     * @param {number} tick_limit
     * @param {number} row_index
     * @param {number} order_list_index
     * @param {number} pattern_index
     * @param {boolean} playing
     */
    constructor(tick, tick_limit, row_index, order_list_index, pattern_index, playing) {
        this.tick = tick;
        this.tick_limit = tick_limit;
        this.row_index = row_index;
        this.order_list_index = order_list_index;
        this.pattern_index = pattern_index;
        this.playing = playing;
    }
}


/**
 * @param {Song} song
 */
function song_state_start(song) {
    const order_list_index = 0;
    return new SongState(0, song.ticks_per_note, 0, order_list_index, song.pattern_order.data[order_list_index], false);
}

export class SongPlayer {
    /**
    * @param {Song} song
    * @param {Osc} osc
    * @param {Track} track
    */
    constructor(song, osc, track) {
        this.song = song;
        this.osc = osc;
        this.track = track;
        this.channels = Array(song.channel_count);
        for (let i = 0; i < this.channels.length; i++) {
            this.channels[i] = channel_state_start();
        }

        this.state = song_state_start(song);
    }

    send_order_id(order_id) {
        if (order_id >= this.song.pattern_order.data.length) {
            order_id = 0;
        }
        this.track.set_order_id(order_id);
    }

    advance_order_and_get_next_pattern_index() {
        this.state.order_list_index++;
        this.send_order_id(this.state.order_list_index);

        if (this.state.order_list_index >= this.song.pattern_order.data.length) {
            return -1;
        } else {
            return this.song.pattern_order.data[this.state.order_list_index];
        }
    }

    set_row(row_index) {
        this.track.set_row(row_index);
        this.state.row_index = row_index;
    }

    set_pattern(pattern_index) {
        this.state.pattern_index = pattern_index;
        this.set_row(0);
    }

    set_order(order_list_index) {
        this.state.order_list_index = order_list_index;
        this.send_order_id(order_list_index);
        this.set_pattern(this.song.pattern_order.data[order_list_index]);
    }

    set_playing(playing) {
        this.state.playing = playing;
        this.track.set_state(playing);
    }

    row() {
        const channel_index = 0;

        let state = this.state;
        return this.song.patterns[state.pattern_index].channels[channel_index].records[state.row_index];
    }

    interrupt() {
        const channel_index = 0;

        let osc = this.osc;
        let state = this.state;
        let channel_state = this.channels[channel_index];

        if (!state.playing) {
            this.track.set_state(state.playing);
            osc.stop();
        }

        if (state.pattern_index < 0) {
            state.playing = false;
            this.track.set_state(state.playing);
            osc.stop();
            return;
        }

        let row = this.row();
        let note = row.note_record;
        let effect = row.effect_record.effect;
        let effect_data = row.effect_record.data;

        // load frequency from note at tick 0
        if (state.tick == 0) {
            let invalidate_row = false;
            // handle "on first tick" effects
            if (effect == Effects.BreakPattern) {
                let next_row_index = effect_data[0];
                let next_pattern_index = this.advance_order_and_get_next_pattern_index();
                this.set_pattern(next_pattern_index);
                this.set_row(next_row_index);
                invalidate_row = true;
            }

            if (effect == Effects.JumpToOrder) {
                state.order_list_index = effect_data[0];
                if (state.order_list_index >= this.song.pattern_order.data.length) {
                    state.order_list_index = this.song.pattern_order.data.length - 1;
                }

                this.send_order_id(state.order_list_index);
                let next_pattern_index = this.song.pattern_order.data[state.order_list_index];
                this.set_pattern(next_pattern_index);
                invalidate_row = true;
            }

            // tracker state can be affected by effects
            if (!state.playing) {
                this.track.set_state(state.playing);
                osc.stop();
                return;
            }

            if (invalidate_row) {
                row = this.row();
                note = row.note_record;
                effect = row.effect_record.effect;
                effect_data = row.effect_record.data;

                if (effect == Effects.SetSpeed) {
                    state.tick_limit = effect_data[0];
                }
            }

            // handle note effects
            if (note == Note.OFF) {
                channel_state.play = false;
            } else if ((note > Note.None) && (note < Note.OFF)) {
                channel_state.play = true;

                // reset vibrato
                channel_state.vibrato.speed = 0;
                channel_state.vibrato.depth = 0;
                channel_state.vibrato.value = 0;
                channel_state.vibrato.direction = 0;

                // reset pwm
                channel_state.pwm = PWM_DEFAULT;

                if (effect == Effects.SlideToNote) {
                    channel_state.frequency_target = note_to_freq(note);
                } else {
                    channel_state.frequency = note_to_freq(note);
                    channel_state.frequency_target = FREQUENCY_UNSET;
                }
            }
        }

        if (channel_state.play) {
            let frequency, pwm;

            if ((effect == Effects.SlideUp || effect == Effects.SlideDown) &&
                effect_data[0] != EFFECT_DATA_NONE) {
                // apply slide effect
                channel_state.frequency += (effect == Effects.SlideUp ? 1 : -1) * effect_data[0];
            } else if (effect == Effects.SlideToNote) {
                // apply slide to note effect, if target frequency is set
                if (channel_state.frequency_target > 0) {
                    if (channel_state.frequency_target > channel_state.frequency) {
                        channel_state.frequency += effect_data[0];
                        if (channel_state.frequency > channel_state.frequency_target) {
                            channel_state.frequency = channel_state.frequency_target;
                            channel_state.frequency_target = FREQUENCY_UNSET;
                        }
                    } else if (channel_state.frequency_target < channel_state.frequency) {
                        channel_state.frequency -= effect_data[0];
                        if (channel_state.frequency < channel_state.frequency_target) {
                            channel_state.frequency = channel_state.frequency_target;
                            channel_state.frequency_target = FREQUENCY_UNSET;
                        }
                    }
                }
            }

            frequency = channel_state.frequency;
            pwm = channel_state.pwm;

            // apply arpeggio effect
            if (effect == Effects.Arpeggio) {
                if (effect_data[0] != EFFECT_DATA_NONE && effect_data[1] != EFFECT_DATA_NONE) {
                    if ((state.tick % 3) == 1) {
                        let note_offset = effect_data[0];
                        frequency = frequency_offset_semitones(frequency, note_offset);
                    } else if ((state.tick % 3) == 2) {
                        let note_offset = effect_data[1];
                        frequency = frequency_offset_semitones(frequency, note_offset);
                    }
                }
            } else if (effect == Effects.Vibrato) {
                // apply vibrato effect, data = speed, depth
                let vibrato_speed = effect_data[0];
                let vibrato_depth = effect_data[1];

                // update vibrato parameters if speed or depth is non-zero
                if (vibrato_speed != 0) channel_state.vibrato.speed = vibrato_speed;
                if (vibrato_depth != 0) channel_state.vibrato.depth = vibrato_depth;

                // update vibrato value
                channel_state.vibrato.value +=
                    channel_state.vibrato.direction * channel_state.vibrato.speed;

                // change direction if value is at the limit
                if (channel_state.vibrato.value > channel_state.vibrato.depth) {
                    channel_state.vibrato.direction = -1;
                } else if (channel_state.vibrato.value < -channel_state.vibrato.depth) {
                    channel_state.vibrato.direction = 1;
                } else if (channel_state.vibrato.direction == 0) {
                    // set initial direction, if it is not set
                    channel_state.vibrato.direction = 1;
                }

                frequency +=
                    (frequency_get_seventh_of_a_semitone(frequency) * channel_state.vibrato.value);
            } else if (effect == Effects.PWM) {
                pwm = (pwm - PWM_MIN) / EFFECT_DATA_1_MAX * effect_data[0] + PWM_MIN;
            }

            osc.set_frequency(frequency);
            osc.set_pwm(pwm);
            osc.start();
        } else {
            osc.stop();
        }

        state.tick++;
        if (state.tick >= state.tick_limit) {
            state.tick = 0;

            // next note
            state.row_index = (state.row_index + 1);

            if (state.row_index >= PATTERN_SIZE) {
                let next_pattern_index = this.advance_order_and_get_next_pattern_index();
                this.set_pattern(next_pattern_index);
            } else {
                this.track.set_row(state.row_index);
            }
        }
    }
}
