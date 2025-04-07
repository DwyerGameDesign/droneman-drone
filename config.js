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

// Day-based narrative text grouped by awareness level
const DAY_NARRATIVES = {
    // Early awareness levels (1-2)
    early: [
        "Everyday the same...",
        "Everyday the same... but something feels different",
        "Something's not quite right...",
        "Is this day different somehow?",
        "The routine feels... off today."
    ],
    // Mid awareness levels (3-4)
    mid: [
        "Wait... did that commuter just change?",
        "I need to pay more attention...",
        "The changes are becoming more obvious...",
        "My eyes are starting to open...",
        "The pattern is changing subtly..."
    ],
    // Late awareness levels (5-7)
    late: [
        "I'm starting to notice patterns...",
        "The world is shifting around me...",
        "I can see the changes clearly now...",
        "The platform isn't static anymore...",
        "Reality seems more fluid today..."
    ],
    // Final awareness levels (8-10)
    final: [
        "The veil is lifting...",
        "I'm beginning to see beyond the surface...",
        "The illusion is breaking down...",
        "My perception expands with each passing day...",
        "The train isn't just a train anymore..."
    ],
    // Default backup narrative
    default: "The world keeps changing..."
};

// Level-up narratives grouped by awareness stage
const LEVEL_UP_NARRATIVES = {
    // Early stage (levels 1-2)
    early: [
        "I notice someone new on the platform...",
        "Another person stands out from the crowd...",
        "Wait... is that someone new? They weren't here yesterday...",
        "Another commuter has appeared... but they seem different somehow.",
        "I'm starting to recognize more distinct faces in the crowd..."
    ],
    // Mid stage (levels 3-4)
    mid: [
        "I'm starting to recognize faces in the crowd...",
        "The commuters are becoming more distinct...",
        "I can see more details in each person now...",
        "The world is becoming more vibrant...",
        "The people around me are taking shape, becoming individuals...",
        "The fog is lifting from my perception..."
    ],
    // Late stage (levels 5-7)
    late: [
        "I'm seeing connections between people...",
        "The veil is lifting, I can see clearly now...",
        "Everything is coming into focus...",
        "The patterns are revealing themselves...",
        "My awareness stretches beyond the platform now...",
        "The boundaries between us all are thinning..."
    ],
    // Final stage (levels 8-10)
    final: [
        "I am fully aware now. I am not just a drone...",
        "My perception has expanded beyond the mundane...",
        "I can see the truth of this daily ritual now...",
        "The illusion is breaking down around me...",
        "I am becoming more than I was..."
    ]
};

// Game over texts
const GAME_OVER_TEXTS = [
    "Back to being a drone...",
    "Your brief moment of clarity fades...",
    "The routine claims you once more...",
    "The commuters all look the same again...",
    "Your awareness flickers and dims...",
    "The cycle of sameness resumes...",
    "Your perception blurs back to normal...",
    "Back to being another passenger...",
    "The numbness returns, familiar and comforting...",
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
    
    // XP requirements for each level (amount needed to progress from previous level)
    xpRequirements: [
        null,   // Level 0 (not used)
        60,     // XP needed for level 1 → level 2
        50,     // XP needed for level 2 → level 3
        75,     // XP needed for level 3 → level 4
        75,     // XP needed for level 4 → level 5
        100,    // XP needed for level 5 → level 6
        100,    // XP needed for level 6 → level 7
        150,    // XP needed for level 7 → level 8
        200,    // XP needed for level 8 → level 9
        200,    // XP needed for level 9 → level 10
        250     // XP needed to complete level 10 (game completion)
    ]
};