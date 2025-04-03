/**
 * Drone: The Daily Commute
 * Configuration file - Simplified for XP system
 */

// First change configuration (hat appears on day 4)
const FIRST_CHANGE = {
    type: 'hat',
    property: 'hasHat',
    value: true,
    commuterId: 0 // This will be the first commuter
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

// Day-based narrative text
const DAY_NARRATIVES = {
    1: "Another day, another commute...",
    2: "The station feels different today...",
    3: "Something's not quite right...",
    4: "Wait... did that commuter just change?",
    5: "I need to pay more attention...",
    6: "The changes are becoming more obvious...",
    7: "I'm starting to notice patterns...",
    8: "The world is shifting around me...",
    9: "I can see the changes clearly now...",
    10: "The veil is lifting...",
    default: "The world keeps changing..."
};

// Level-up narrative text
const LEVEL_UP_NARRATIVES = {
    1: "I notice someone new on the platform...",
    2: "Another person stands out from the crowd...",
    3: "I'm starting to recognize faces in the crowd...",
    4: "The commuters are becoming more distinct...",
    5: "I can see more details in each person now...",
    6: "The world is becoming more vibrant...",
    7: "I'm seeing connections between people...",
    8: "The veil is lifting, I can see clearly now...",
    9: "Everything is coming into focus...",
    10: "I am fully aware now. I am not just a drone...",
    default: "Something feels different about the crowd..."
};

// Game settings
const GAME_SETTINGS = {
    // Transition timing
    fadeOutDuration: 300,  // How long the fade out animation takes (ms)
    fadeInDuration: 300,   // How long the fade in animation takes (ms)
    waitDuration: 200,     // How long to wait between fade out and fade in (ms)
    
    // Highlight a missed change
    missedChangeHighlightColor: '#e9cb5f', // Changed to match the goldish/yellow color
    missedChangeHighlightDuration: 1500
};

// Progression configuration referenced in commuters.js
const PROGRESSION_CONFIG = {
    // Base awareness gain per change found
    awarenessGainPerChange: 25,
    
    // Number of changes needed to fill each segment
    changesToFillSegment: [2, 2, 3, 3, 4, 4, 5, 5, 6, 6]
};

// Configuration for XP/Awareness system
const AWARENESS_CONFIG = {
    // Maximum achievable level
    maxLevel: 10,
    
    // Base XP values for actions
    baseXpForFindingChange: 25,   // Base XP for finding a change
    baseXpForTakingTrain: 10,     // Base XP for taking the train (when no change was present)
    
    // Hardcoded XP requirements for each level
    xpRequirements: [
        null,   // Level 0 (not used)
        100,    // XP needed to reach level 2 from level 1
        150,    // XP needed to reach level 3 from level 2
        225,    // XP needed to reach level 4 from level 3
        340,    // XP needed to reach level 5 from level 4
        510,    // XP needed to reach level 6 from level 5
        765,    // XP needed to reach level 7 from level 6
        1150,   // XP needed to reach level 8 from level 7
        1725,   // XP needed to reach level 9 from level 8
        2590,   // XP needed to reach level 10 from level 9
        3885    // XP needed to complete level 10 (game completion)
    ],
    
    // XP multipliers based on the current level (makes finding changes more valuable at higher levels)
    xpMultiplierByLevel: [
        null, // Index 0 not used
        1.0,  // Level 1
        1.2,  // Level 2
        1.5,  // Level 3
        1.7,  // Level 4
        1.9,  // Level 5
        2.1,  // Level 6
        2.3,  // Level 7
        2.5,  // Level 8
        2.7,  // Level 9
        3.0   // Level 10
    ],
    
    // Color stages corresponding to awareness levels
    colorStages: [
        { level: 0, class: 'stage-1' }, // Not used
        { level: 1, class: 'stage-1' },
        { level: 2, class: 'stage-2' },
        { level: 3, class: 'stage-3' },
        { level: 4, class: 'stage-4' },
        { level: 5, class: 'stage-5' },
        { level: 6, class: 'stage-6' },
        { level: 7, class: 'stage-7' },
        { level: 8, class: 'stage-8' },
        { level: 9, class: 'stage-9' },
        { level: 10, class: 'stage-10' }
    ]
};