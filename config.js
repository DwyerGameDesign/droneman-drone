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
    ],
    negative: [
        "Something feels off...",
        "That's not it...",
        "I'm not seeing clearly...",
        "My awareness is slipping...",
        "Focus is fading...",
        "Can't quite put my finger on it...",
        "I thought I was more observant...",
        "The details are blurring...",
        "I need to pay closer attention..."
    ]
};

// Day-based narrative text
const DAY_NARRATIVES = {
    1: "Everyday the same...",
    2: "Everyday the same... but something feels different",
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

// Game over texts
const GAME_OVER_TEXTS = [
    "The pattern continues without you...",
    "Back to being a drone...",
    "Your brief moment of clarity fades...",
    "The routine claims you once more...",
    "The commuters all look the same again...",
    "Your awareness flickers and dims...",
    "The cycle of sameness resumes...",
    "The train arrives, just like yesterday...",
    "Your perception blurs back to normal..."
];

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
        50,    // XP needed to reach level 2 from level 1
        100,    // XP needed to reach level 3 from level 2
        175,    // XP needed to reach level 4 from level 3
        250,    // XP needed to reach level 5 from level 4
        350,    // XP needed to reach level 6 from level 5
        450,    // XP needed to reach level 7 from level 6
        600,   // XP needed to reach level 8 from level 7
        800,   // XP needed to reach level 9 from level 8
        1000,   // XP needed to reach level 10 from level 9
        1250    // XP needed to complete level 10 (game completion)
    ]
};