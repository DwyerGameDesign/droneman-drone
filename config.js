/**
 * Drone: The Daily Commute
 * Configuration file
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

// Element categories that can change
const CHANGEABLE_ELEMENTS = [
    // Hat properties
    {
        type: 'hat',
        property: 'backgroundColor',
        ids: [
            'person1-hat', 'person2-hat', 'person3-hat', 
            'person4-hat', 'person5-hat', 'person6-hat', 'person7-hat'
        ],
        values: [
            '#3d3d3d', '#4a4a4a', '#5a5a5a', 
            '#403020', '#302010', '#202030', '#483935'
        ]
    },
    // Hat visibility
    {
        type: 'hat-visibility',
        property: 'visibility',
        ids: [
            'person1-hat', 'person2-hat', 'person3-hat', 
            'person4-hat', 'person5-hat', 'person6-hat', 'person7-hat'
        ],
        values: ['visible', 'hidden']
    },
    // Trench coat color
    {
        type: 'trench-coat',
        property: 'backgroundColor',
        ids: [
            'person1-body', 'person2-body', 'person3-body', 
            'person4-body', 'person5-body', 'person6-body', 'person7-body'
        ],
        values: [
            '#4e392e', '#3b2e26', '#544033', '#4a3629',
            '#2e2e40', '#352b2b', '#4d3f34', '#58473a'
        ]
    },
    // Briefcase/bag color
    {
        type: 'briefcase',
        property: 'backgroundColor',
        ids: [
            'person1-bag', 'person2-bag', 'person3-bag', 
            'person4-bag', 'person5-bag', 'person6-bag', 'person7-bag'
        ],
        values: [
            '#59493f', '#4a3a30', '#5c4b41', '#4d3e34',
            '#3c3c3c', '#4a4a4a', '#3a3a3a'
        ]
    },
    // Briefcase/bag visibility
    {
        type: 'briefcase-visibility',
        property: 'visibility',
        ids: [
            'person1-bag', 'person2-bag', 'person3-bag', 
            'person4-bag', 'person5-bag', 'person6-bag', 'person7-bag'
        ],
        values: ['visible', 'hidden']
    },
    // Leg/pants color
    {
        type: 'pants',
        property: 'backgroundColor',
        ids: [
            'person1-left-leg', 'person1-right-leg',
            'person2-left-leg', 'person2-right-leg', 
            'person3-left-leg', 'person3-right-leg',
            'person4-left-leg', 'person4-right-leg', 
            'person5-left-leg', 'person5-right-leg',
            'person6-left-leg', 'person6-right-leg',
            'person7-left-leg', 'person7-right-leg'
        ],
        values: [
            '#37322e', '#2a2a2a', '#403a36', '#343434',
            '#2c2c35', '#35302c', '#3a332d'
        ]
    }
];

// First change configuration - modified to be on character 2
const FIRST_CHANGE = {
    type: 'hat-visibility',
    property: 'visibility',
    id: 'person2-hat',  // Changed to person2
    value: 'visible'    // Make a hat appear
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
    fadeOutDuration: 300,  // How long the fade out animation takes (ms) - MADE FASTER
    fadeInDuration: 300,   // How long the fade in animation takes (ms) - MADE FASTER
    waitDuration: 200,     // How long to wait between fade out and fade in (ms)
    
    // Highlight a missed change
    missedChangeHighlightColor: '#e9cb5f', // Changed to match the goldish/yellow color
    missedChangeHighlightDuration: 1500,
    
    // Gameplay settings
    baseAwarenessGain: 1,  // How much awareness increases per correct guess - just increment by 1
    multipleChangesThreshold: 60, // Day when multiple changes start appearing
    
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