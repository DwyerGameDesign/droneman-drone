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
        "Same shoes, same steps.",
        "Coffee. Platform. Silence. Repeat.",
        "Soul is nearly drained.",
        "Just me and my thoughts again.",
        "Same routine for years, still a stranger.",
        "Do I even belong here?",
        "We're all alone, just in the same place.",
        "Do I always stand in the same spot?",
        "Feels like I’ve lived this day before.",
        "Is this the same old story?",
        "Is this all there is?"
    ],
    mid: [
        "No one ever says good morning.",
        "Why do I do this every day?",
        "The train moves, but am I going anywhere?",
        "Do they notice me, like I notice them?",
        "They never speak. Just like me.",
        "Is it just me?",
        "Time feels different when you pay attention.",
        "Should I talk to them? Smile?",
        "We all stand together, but apart.",
        "Not a single nod. Not a smile.",
        "Why is it so quiet when we’re here?",
        "Am I the only one who feels this?"

    ],
    late: [
        "I don't have to do this forever.",
        "We all wait like clockwork toys.",
        "There's more to life than this cycle.",
        "My soul feels less drained today.",
        "The grip is loosening.",
        "Maybe we're not meant to do this.",
        "There’s a version of me I haven’t met yet.",
        "Maybe this isn’t a rut, it’s a launchpad.",
        "The rhythm’s still there, but I’m hearing melody."
    ],
    final: [
        "I am not just a drone.",
        "The man ain't got his grip on me.",
        "I'm going to break this cycle.",
        "Today will be different.",
        "I'm my own person.",
        "I am more than my inbox.",
        "Awake. For real this time."
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
        "Everyday the same??",
        "Something's not quite right...",
        "Is this day different somehow?",
        "The routine feels... off today.",
        "Familiar, but not quite right...",
        "The platform appears unchanged... almost.",
        "Nothing new... or is there?",
        "The pieces fit, but not quite the same.",
        "The routine is familiar, but something's off.",
        "The morning looks identical, but...",
        "All seems in order, but..."
    ],
    // Mid awareness levels (3-4)
    mid: [
        "The changes are becoming more obvious...",
        "The pattern is changing subtly...",
        "The shift happens every day now.",
        "The difference is here, somewhere.",
        "The change blends into the routine.",
        "The pattern keeps evolving.",
        "A new detail is present.",
        "The scene adapts, will they...",
        "Familiar forms rearranged again.",
        "Change hides behind the ordinary.",
        "The transformation is part of the cycle.",
        "Alteration has become the norm.",
        "Each day rewrites the scene.",
        "The world shifts...",
        "The illusion updates...",
        "The platform no longer repeats itself."
    ],
    // Late awareness levels (5-7)
    late: [
        "The world is shifting...",
        "The platform isn't static anymore...",
        "Reality seems more fluid today...",
        "The environment no longer holds its shape.",
        "Stability is only an illusion.",
        "The platform breathes between moments.",
        "Familiarity fades with each sunrise.",
        "The edges of the scene are beginning to fray.",
        "The pattern no longer loops — it spirals.",
        "Nothing settles like it used to.",
        "The routine melts into something else.",
        "Structure bends without breaking.",
        "The rules are rewriting themselves.",
        "The background hum has changed its pitch.",
        "Surfaces reflect more than they should."
    ],
    // Final awareness levels (8-10)
    final: [
        "The veil is lifting...",
        "The illusion is breaking down...",
        "Perception expands with each passing day...",
        "The mask of reality is slipping.",
        "This was never just a commute.",
        "The truth hums beneath the surface.",
        "The system reveals its seams.",
        "The architecture of illusion is exposed.",
        "Every object is a message now.",
        "The ordinary has become sacred.",
        "Time folds in on itself here.",
        "The scene is a memory — not a place.",
        "The simulation stutters under observation.",
        "Meaning bleeds through the cracks.",
        "The platform was always a threshold.",
        "The standard is dissolving."      
    ],
    // Default backup narrative
    default: "The world keeps changing..."
};

// Level-up narratives grouped by awareness stage
const LEVEL_UP_NARRATIVES = {
    // Early stage (levels 1-2)
    early: [
        "A new person is seen. Were they always there?",
        "Another soul enters the view.",
        "A new face in the fog.",
        "Someone is noticed. The veil thins.",
        "They are no longer alone. Not entirely.",
        "A figure becomes distinct.",
        "A Connection begins...",
        "Another shape gains meaning.",
        "The pattern breaks. A person is noticed.",
        "A stranger appears, yet feels familiar.",
        "A new soul emerges...",
        "One sees another. A quiet beginning.",
        "Another awakens within the frame.",
        "Someone steps forward from the blur.",
        "A gaze is returned for the first time.",
        "The veil parts, and someone steps through.",
        "A shape becomes a person. A person becomes a sign.",
        "Another soul stirs the stillness."
    ],
    // Mid stage (levels 3-4)
    mid: [
        "They start to recognize faces in the crowd...",
        "Each person is becoming more distinct...",
        "They can see more details in each other...",
        "The world is becoming more than a blur...",
        "The people around are taking shape, becoming individuals...",
        "The fog is lifting from perception...",
        "The crowd divides into people.",
        "Awareness brings the world into focus.",
        "The veil of sameness is wearing thin.",
        "Names are not known, but presence is felt."       
    ],
    // Late stage (levels 5-7)
    late: [
        "There are connections between people...",
        "The veil is lifting, We can see clearly now...",
        "Everything is coming into focus...",
        "The patterns are revealing themselves...",
        "Awareness stretches beyond the platform now...",
        "The boundaries between are thinning..."
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
    "The brief moment of clarity fades...",
    "The routine claims you once more...",
    "Everyone looks the same again...",
    "Awareness flickers and dims...",
    "The cycle of sameness resumes...",
    "Perception blurs back to normal...",
    "Back to being another passenger...",
    "The numbness returns, familiar and comforting...",
    "Clarity is lose in the noise...",
    "Monotony drifts back in...",
    "Awareness slips away..."
];

// Game over summary popup texts
const GAME_OVER_SUMMARY_TEXT = [
    "Your awareness wasn't strong enough to notice the changes.",
    "The subtle differences escaped your observation.",
    "Your perception couldn't capture the changes.",
    "The details slipped through the cracks.",
    "Your mind wasn't quite sharp enough to spot the differences.",
    "The changes were there, but your awareness was not.",
    "Your awareness needs more development.",
    "The shift was beyond your grasp.",
    "You let the routine blind you to the change.",
    "Your focus slipped, and the differences vanished.",
    "Your attention drifted, and the change was lost.",
    "Your focus faltered, and the changes slipped by."
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

// Messages for when players miss a change
const CHANGE_MESSAGES = {
    // Commuter change messages
    commuter: {
        // Messages for when a commuter's appearance changes
        'commuter1': {
            'commuter1_a': "Yesterday, he had a briefcase...",
        },
        'commuter1_a': {
            'commuter1': "Yesterday, he did not have a briefcase..."
        },
        'commuter2': {
            'commuter2_a': "Yesterday, she had a briefcase...",
        },
        'commuter2_a': {
            'commuter2': "Yesterday, she did not have that briefcase..."
        },
        'commuter3': {
            'commuter3_a': "Yesterday, he had a shoulder bag...",
        },
        'commuter3_a': {
            'commuter3': "Yesterday, he had a briefcase..."
        },
        'commuter4': {
            'commuter4_a': "Yesterday, he had a briefcase...",
        },
        'commuter4_a': {
            'commuter4': "Yesterday, he did not have a briefcase..."
        },
        'commuter5': {
            'commuter5_a': "Yesterday, he had a hat and bag...",
        },
        'commuter5_a': {
            'commuter5': "Yesterday, he did not have a hat or bag..."
        },
        'commuter6': {
            'commuter6_a': "Yesterday, her purse was black...",
        },
        'commuter6_a': {
            'commuter6': "Yesterday, her purse was brown..."
        },
        'commuter7': {
            'commuter7_a': "Yesterday, he did not have a hat or briefcase...",
        },
        'commuter7_a': {
            'commuter7': "Yesterday, he had a hat and briefcase..."
        },
        'commuter8': {
            'commuter8_a': "Yesterday, he had a hat...",
        },
        'commuter8_a': {
            'commuter8': "Yesterday, he did not have a hat..."
        }
    },
    
    // Set dressing change messages
    setDressing: {
        // Messages for when a new set dressing item is added
        'new': {
            'bottle': "The bottle wasn't here yesterday...",
            'trash': "The trash wasn't here yesterday...",
            'trashcan': "The trashcan wasn't here yesterday...",
            'caution': "The caution sign wasn't here yesterday...",
            'backpack': "The backpack wasn't here yesterday...",
            'rat': "The rat wasn't here yesterday..."
        },
        'bottle': {
            'trash': "Yesterday, this was a bottle...",
            'trashcan': "Yesterday, this was a bottle...",
            'caution': "Yesterday, this was a bottle...",
            'backpack': "Yesterday, this was a bottle...",
            'rat': "Yesterday, this was a bottle..."
        },
        'trash': {
            'bottle': "Yesterday, this was trash...",
            'trashcan': "Yesterday, this was trash...",
            'caution': "Yesterday, this was trash...",
            'backpack': "Yesterday, this was trash...",
            'rat': "Yesterday, this was trash..."
        },
        'trashcan': {
            'bottle': "Yesterday, this was a trashcan...",
            'trash': "Yesterday, this was a trashcan...",
            'caution': "Yesterday, this was a trashcan...",
            'backpack': "Yesterday, this was a trashcan...",
            'rat': "Yesterday, this was a trashcan..."
        },
        'caution': {
            'bottle': "Yesterday, this was a caution sign...",
            'trash': "Yesterday, this was a caution sign...",
            'trashcan': "Yesterday, this was a caution sign...",
            'backpack': "Yesterday, this was a caution sign...",
            'rat': "Yesterday, this was a caution sign..."
        },
        'backpack': {
            'bottle': "Yesterday, this was a backpack...",
            'trash': "Yesterday, this was a backpack...",
            'trashcan': "Yesterday, this was a backpack...",
            'caution': "Yesterday, this was a backpack...",
            'rat': "Yesterday, this was a backpack..."
        },
        'rat': {
            'bottle': "Yesterday, this was a rat...",
            'trash': "Yesterday, this was a rat...",
            'trashcan': "Yesterday, this was a rat...",
            'caution': "Yesterday, this was a rat...",
            'backpack': "Yesterday, this was a rat..."
        }
    }
};