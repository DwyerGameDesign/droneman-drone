/**
 * Drone: The Daily Commute
 * Configuration file
 */

// Song lyrics that appear at milestone days
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

// Changeable elements configuration
const CHANGEABLE_ELEMENTS = [
    // Hat properties
    {
        type: 'hat',
        property: 'backgroundColor',
        ids: [
            'person1-hat', 'person2-hat', 'person3-hat', 
            'person4-hat', 'person5-hat', 'person6-hat'
        ],
        values: [
            '#333333', '#555555', '#777777', '#999999', 
            '#4a6741', '#6d504a', '#4a5a6d', '#6d4a5a'
        ]
    },
    // Hat visibility
    {
        type: 'hat-visibility',
        property: 'visibility',
        ids: [
            'person1-hat', 'person2-hat', 'person3-hat', 
            'person4-hat', 'person5-hat', 'person6-hat'
        ],
        values: ['visible', 'hidden']
    },
    // Torso color
    {
        type: 'torso',
        property: 'backgroundColor',
        ids: [
            'person1-body', 'person2-body', 'person3-body', 
            'person4-body', 'person5-body', 'person6-body'
        ],
        values: [
            '#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a',
            '#4a6741', '#6d504a', '#4a5a6d', '#6d4a5a'
        ]
    },
    // Torso size
    {
        type: 'torso-size',
        property: 'width',
        ids: [
            'person1-body', 'person2-body', 'person3-body', 
            'person4-body', 'person5-body', 'person6-body'
        ],
        values: ['8px', '10px', '12px', '14px']
    },
    // Bag color
    {
        type: 'bag',
        property: 'backgroundColor',
        ids: [
            'person1-bag', 'person2-bag', 'person3-bag', 
            'person4-bag', 'person5-bag', 'person6-bag'
        ],
        values: [
            '#555555', '#666666', '#777777', '#888888',
            '#4a6741', '#6d504a', '#4a5a6d', '#6d4a5a'
        ]
    },
    // Bag visibility
    {
        type: 'bag-visibility',
        property: 'visibility',
        ids: [
            'person1-bag', 'person2-bag', 'person3-bag', 
            'person4-bag', 'person5-bag', 'person6-bag'
        ],
        values: ['visible', 'hidden']
    },
    // Pants color
    {
        type: 'pants',
        property: 'backgroundColor',
        ids: [
            'person1-pants', 'person2-pants', 'person3-pants', 
            'person4-pants', 'person5-pants', 'person6-pants'
        ],
        values: [
            '#333333', '#444444', '#555555', '#666666',
            '#2d3e28', '#3e2d28', '#2d303e', '#3e2d30'
        ]
    },
    // Shoe style (height)
    {
        type: 'shoe-style',
        property: 'height',
        ids: [
            'person1-left-shoe', 'person1-right-shoe',
            'person2-left-shoe', 'person2-right-shoe',
            'person3-left-shoe', 'person3-right-shoe',
            'person4-left-shoe', 'person4-right-shoe',
            'person5-left-shoe', 'person5-right-shoe',
            'person6-left-shoe', 'person6-right-shoe'
        ],
        values: ['5px', '7px', '9px']
    },
    // Shoe color
    {
        type: 'shoe-color',
        property: 'backgroundColor',
        ids: [
            'person1-left-shoe', 'person1-right-shoe',
            'person2-left-shoe', 'person2-right-shoe',
            'person3-left-shoe', 'person3-right-shoe',
            'person4-left-shoe', 'person4-right-shoe',
            'person5-left-shoe', 'person5-right-shoe',
            'person6-left-shoe', 'person6-right-shoe'
        ],
        values: [
            '#222222', '#333333', '#444444', '#555555',
            '#4a3520', '#203a4a', '#4a2035', '#354a20'
        ]
    }
];

// Progress thoughts that can appear in the thought bubble
const THOUGHTS = {
    early: [
        "Another day, another dollar.",
        "6:40 train again.",
        "Same commute, different day.",
        "This seat feels familiar.",
        "Wonder what's for lunch today.",
        "Two more stops to go."
    ],
    mid: [
        "Why do I do this every day?",
        "The train moves, but am I going anywhere?",
        "That person seems different today.",
        "I never noticed that building before.",
        "The sky looks beautiful today.",
        "Time feels different when you pay attention."
    ],
    late: [
        "I don't have to do this forever.",
        "There's more to life than this cycle.",
        "I could engineer a plan to change things.",
        "My soul feels less drained today.",
        "The grip is loosening.",
        "I'm starting to see clearly now."
    ],
    final: [
        "I am not just a drone.",
        "The man ain't got his grip on me.",
        "I'm going to break this cycle.",
        "Today will be different.",
        "I'm my own person.",
        "Time for a change."
    ]
};

// Game settings
const GAME_SETTINGS = {
    // Transition timing
    fadeOutDuration: 1000,  // How long the fade out animation takes (ms)
    fadeInDuration: 1000,   // How long the fade in animation takes (ms)
    waitDuration: 1000,     // How long to wait between fade out and fade in (ms)

    // Add at the end of the GAME_SETTINGS object
    multipleChangesThreshold: 60, // Day when multiple changes start appearing
    missedChangeHighlightColor: '#e9cb5f', // A muted yellow that fits the aesthetic
    missedChangeHighlightDuration: 2000, // How long the highlight shows (ms)    

    // Gameplay settings
    baseAwarenessGain: 5,   // How much awareness increases per correct guess

    // Win conditions
    maxAwareness: 100,      // Maximum awareness level
    winDay: 100,            // Day to reach for win condition

    // Background stage thresholds (percentage of awareness)
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