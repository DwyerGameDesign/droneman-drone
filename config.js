/**
 * Drone: The Daily Commute
 * Configuration file - Simplified for single sprite approach
 */

// Song lyrics from the album that appear at certain days
const SONG_LYRICS = [
    { day: 5, text: "Every day the same, rolling to a paycheck" },
    { day: 10, text: "6:40 train, drink my 40 on the way back" },
    { day: 15, text: "Soul's nearly drained, gotta be a way out" },
    { day: 20, text: "Signal in my brain, stopping me with self-doubt" },
    { day: 30, text: "Drone no more, I'm clean and free" },
    { day: 40, text: "The Man ain't got his grip on me" },
    { day: 50, text: "Drone no more, I'm my own man" },
    { day: 60, text: "Gotta engineer a plan" },
    { day: 75, text: "Time for a change, bell's ringing louder" },
    { day: 90, text: "No one left to blame, 'cause I'm my biggest doubter" },
    { day: 100, text: "Drone no more, I'm my own man" }
];

// First change configuration (hat appears on day 4)
const FIRST_CHANGE = {
    type: 'hat',
    property: 'hasHat',
    value: true,
    commuterId: 0 // This will be the first commuter
};

// Awareness meter configuration
const AWARENESS_METER_CONFIG = {
    maxLevel: 100,
    segmentSize: 20, // Each segment represents 20 awareness points
    meterWidth: 200,
    meterHeight: 15,
    activeColor: '#4e4eb2', // Matches the most aware color stage
    inactiveColor: '#3a3a3a',
    borderColor: '#666'
};

// Configuration for commuter addition
const COMMUTER_ADDITION = {
    // We'll add a new commuter when each segment is filled
    // So max 5 commuters (using 20 awareness per segment)
    maxCommuters: 5,
    // Starting positions for each commuter (percentage from left)
    positions: [50, 30, 70, 10, 90]
};

// Thoughts shown in thought bubble based on awareness levels
const THOUGHTS = {
    early: [
        "Another day, another dollar.",
        "6:40 train again.",
        "Same commute, different day.",
        "This seat feels familiar.",
        "Two more stops to go."
    ],
    mid: [
        "Why do I do this every day?",
        "The train moves, but am I going anywhere?",
        "That person seems different today.",
        "I never noticed that building before.",
        "Time feels different when you pay attention."
    ],
    late: [
        "I don't have to do this forever.",
        "There's more to life than this cycle.",
        "I could engineer a plan to change things.",
        "My soul feels less drained today.",
        "The grip is loosening."
    ],
    final: [
        "I am not just a drone.",
        "The man ain't got his grip on me.",
        "I'm going to break this cycle.",
        "Today will be different.",
        "I'm my own person."
    ]
};

// Game settings
const GAME_SETTINGS = {
    // Faster transition timing
    fadeOutDuration: 300,  // How long the fade out animation takes (ms)
    fadeInDuration: 300,   // How long the fade in animation takes (ms)
    waitDuration: 200,     // How long to wait between fade out and fade in (ms)
    
    // Highlight a missed change
    missedChangeHighlightColor: '#e9cb5f', // Changed to match the goldish/yellow color
    missedChangeHighlightDuration: 1500,
    
    // Gameplay settings
    baseAwarenessGain: 4,  // How much awareness increases per correct guess - increased to fill meter faster
    
    // Background stage thresholds
    colorStages: [
        { threshold: 0, class: 'stage-1' },
        { threshold: 10, class: 'stage-2' },
        { threshold: 20, class: 'stage-3' },
        { threshold: 30, class: 'stage-4' },
        { threshold: 40, class: 'stage-5' },
        { threshold: 50, class: 'stage-6' },
        { threshold: 60, class: 'stage-7' },
        { threshold: 70, class: 'stage-8' },
        { threshold: 80, class: 'stage-9' },
        { threshold: 90, class: 'stage-10' }
    ]
};