class Effect {
    /**
     * @param {number} value
     * @param {string} abbr
     * @param {boolean} dual_data
     * @param {string} name
     * @param {string} description
     */
    constructor(value, abbr, dual_data, name, description) {
        this.value = value;
        this.abbr = abbr;
        this.dual_data = dual_data;
        this.name = name;
        this.description = description;
    }
}

export const Effects = {
    Arpeggio: new Effect(0x00, "ARP", true, "", ""),
    SlideUp: new Effect(0x01, "SLU", false, "", ""),
    SlideDown: new Effect(0x02, "SLD", false, "", ""),
    SlideToNote: new Effect(0x03, "SLN", false, "", ""),
    Vibrato: new Effect(0x04, "VIB", true, "", ""),
    JumpToOrder: new Effect(0x0B, "JMP", false, "", ""),
    PWM: new Effect(0x0C, "PWM", false, "", ""),
    BreakPattern: new Effect(0x0D, "BRK", false, "", ""),
    Speed: new Effect(0x0F, "SPD", false, "", ""),
};

/**
 * @param {Effect} effect
 */
export function effect_to_string(effect) {
    return effect.abbr;
}


export const Note = {
    None: 0,
    C2: 1,
    C2s: 2,
    D2: 3,
    D2s: 4,
    E2: 5,
    F2: 6,
    F2s: 7,
    G2: 8,
    G2s: 9,
    A2: 10,
    A2s: 11,
    B2: 12,
    C3: 13,
    C3s: 14,
    D3: 15,
    D3s: 16,
    E3: 17,
    F3: 18,
    F3s: 19,
    G3: 20,
    G3s: 21,
    A3: 22,
    A3s: 23,
    B3: 24,
    C4: 25,
    C4s: 26,
    D4: 27,
    D4s: 28,
    E4: 29,
    F4: 30,
    F4s: 31,
    G4: 32,
    G4s: 33,
    A4: 34,
    A4s: 35,
    B4: 36,
    C5: 37,
    C5s: 38,
    D5: 39,
    D5s: 40,
    E5: 41,
    F5: 42,
    F5s: 43,
    G5: 44,
    G5s: 45,
    A5: 46,
    A5s: 47,
    B5: 48,
    C6: 49,
    C6s: 50,
    D6: 51,
    D6s: 52,
    E6: 53,
    F6: 54,
    F6s: 55,
    G6: 56,
    G6s: 57,
    A6: 58,
    A6s: 59,
    B6: 60,
    OFF: 63,
}


/**
 * @param {number} note
 */
export function note_to_string(note) {
    if (note == Note.None) {
        return "---";
    } else if (note == Note.OFF) {
        return "OFF";
    } else {
        let octave = Math.floor((note - 1) / 12) + 2;
        let note_name = "C |C#|D |D#|E |F |F#|G |G#|A |A#|B ".split("|")[(note - 1) % 12];
        return note_name + octave;
    }
}

export class EffectRecord {
    /**
     * @param {Effect} effect
     * @param {number[]} data
     */
    constructor(effect, ...data) {
        this.effect = effect;
        this.data = [];
        this.data[0] = data[0];
        if (effect.dual_data) {
            this.data[1] = data[1];
        } else {
            if (data.length > 1) {
                throw new Error("EffectRecord: Dual data passed to non-dual effect.");
            }
        }
    }
}

/**
 * @param {EffectRecord} effect_record
 */
export function effect_record_is_empty(effect_record) {
    return effect_record.effect == Effects.Arpeggio && effect_record.data[0] == 0 && effect_record.data[1] == 0;
}

/**
 * @param {EffectRecord} effect_record
 */
export function effect_record_value_to_string(effect_record) {
    let ret;
    if (effect_record.effect.dual_data) {
        ret = effect_record.data[0].toString(16).padStart(1, "0") + effect_record.data[1].toString(16).padStart(1, "0");
    } else {
        ret = effect_record.data[0].toString(16).padStart(2, "0");
    }
    return ret.toUpperCase();
}

export class Record {
    /**
     * @param {number} note_record
     * @param {EffectRecord[]} effect_record
     */
    constructor(note_record, ...effect_record) {
        this.note_record = note_record;

        if (effect_record.length == 0) {
            effect_record = [new EffectRecord(Effects.Arpeggio, 0, 0)];
        }

        this.effect_record = effect_record[0];
        if (effect_record.length > 1) {
            throw new Error("Record: More than 1 effect record passed.");
        }
    }
}

export class Channel {
    /**
     * @param {Record[]} records
     */
    constructor(records) {
        this.records = records;
        if (records.length != 64) {
            throw new Error("Channel: Channel must have 64 records.");
        }
    }
}

export class Pattern {
    /**
     * @param {Channel[]} channels
     */
    constructor(channels) {
        this.channels = channels;
    }
}

export class PatternOrder {
    /**
     * @param {number[]} pattern_order
     */
    constructor(pattern_order) {
        this.pattern_order = pattern_order;
    }
}

export class Song {
    /**
     * @param {number} channel_count
     * @param {Pattern[]} patterns
     * @param {PatternOrder} pattern_order
     * @param {number} ticks_per_second
     * @param {number} ticks_per_note
     */
    constructor(channel_count, patterns, pattern_order, ticks_per_second, ticks_per_note) {
        this.channel_count = channel_count;
        this.patterns = patterns;
        this.pattern_order = pattern_order;
        this.ticks_per_second = ticks_per_second;
        this.ticks_per_note = ticks_per_note;

        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].channels.length != this.channel_count) {
                throw new Error("Song: Channel count mismatch.");
            }
        }
    }
}

export let demo_song = new Song(1, [new Pattern([new Channel([
    new Record(Note.C4, new EffectRecord(Effects.Arpeggio, 4, 7)),
    new Record(Note.C3),
    new Record(Note.F2),
    new Record(Note.C3),

    new Record(Note.E4),
    new Record(Note.C3),
    new Record(Note.E4, new EffectRecord(Effects.PWM, 50)),
    new Record(Note.OFF),

    new Record(Note.A4),
    new Record(Note.None, new EffectRecord(Effects.PWM, 55)),
    new Record(Note.None, new EffectRecord(Effects.PWM, 45)),
    new Record(Note.OFF),

    new Record(Note.E5),
    new Record(Note.None, new EffectRecord(Effects.PWM, 55)),
    new Record(Note.None, new EffectRecord(Effects.PWM, 45)),
    new Record(Note.OFF),

    new Record(Note.D5),
    new Record(Note.C3, new EffectRecord(Effects.SlideDown, 0x30)),
    new Record(Note.F2),
    new Record(Note.C3),

    new Record(Note.C5),
    new Record(Note.C3),
    new Record(Note.C5),
    new Record(Note.OFF),

    new Record(Note.A4),
    new Record(Note.None),
    new Record(Note.None),
    new Record(Note.None, new EffectRecord(Effects.Vibrato, 1, 1)),

    new Record(Note.None, new EffectRecord(Effects.Vibrato, 1, 1)),
    new Record(Note.None, new EffectRecord(Effects.Vibrato, 2, 2)),
    new Record(Note.None, new EffectRecord(Effects.Vibrato, 2, 2)),
    new Record(Note.OFF),

    new Record(Note.B4, new EffectRecord(Effects.Arpeggio, 4, 7)),
    new Record(Note.D3),
    new Record(Note.G2),
    new Record(Note.D3),

    new Record(Note.E4),
    new Record(Note.D3),
    new Record(Note.E4, new EffectRecord(Effects.PWM, 50)),
    new Record(Note.OFF),

    new Record(Note.A4),
    new Record(Note.None, new EffectRecord(Effects.PWM, 55)),
    new Record(Note.None, new EffectRecord(Effects.PWM, 45)),
    new Record(Note.OFF),

    new Record(Note.E5),
    new Record(Note.None, new EffectRecord(Effects.PWM, 55)),
    new Record(Note.None, new EffectRecord(Effects.PWM, 45)),
    new Record(Note.OFF),

    new Record(Note.D5),
    new Record(Note.D3, new EffectRecord(Effects.SlideDown, 0x3F)),
    new Record(Note.G2),
    new Record(Note.D3),

    new Record(Note.C5),
    new Record(Note.D3),
    new Record(Note.C5),
    new Record(Note.OFF),

    new Record(Note.A4),
    new Record(Note.None),
    new Record(Note.None),
    new Record(Note.None, new EffectRecord(Effects.Vibrato, 1, 1)),

    new Record(Note.None, new EffectRecord(Effects.Vibrato, 1, 1)),
    new Record(Note.None, new EffectRecord(Effects.Vibrato, 2, 2)),
    new Record(Note.None, new EffectRecord(Effects.Vibrato, 2, 2)),
    new Record(Note.OFF),
])])], new PatternOrder([0]), 120, 2);