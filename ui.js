/**
 * Drone: The Daily Commute
 * UI and Display - All UI and display-related functions
 */

/**
 * Update the awareness display
 */
function updateAwarenessDisplay() {
    // Update meter if available
    if (awarenessMeter) {
        awarenessMeter.update(awareness);
    }
}

/**
 * Update the background color stage based on awareness
 */
function updateColorStage() {
    // Color stages
    const colorStages = [
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
    ];

    // Remove all stage classes first
    colorStages.forEach(stage => {
        sceneContainer.classList.remove(stage.class);
    });

    // Find the appropriate stage for current awareness
    for (let i = colorStages.length - 1; i >= 0; i--) {
        if (awareness >= colorStages[i].threshold) {
            sceneContainer.classList.add(colorStages[i].class);
            break;
        }
    }
}

/**
 * Check for lyrics for the current day
 */
function checkForLyrics() {
    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);
    if (lyricForToday) {
        if (typewriter) {
            typewriter.stop();
            narrativeText.textContent = '';
            setTimeout(() => {
                typewriter.type(`"${lyricForToday.text}"`);
            }, 100);
        } else {
            narrativeText.textContent = `"${lyricForToday.text}"`;
        }
    }
}

/**
 * Update the narrative text based on the current awareness
 */
function updateNarrativeText() {
    const lyricForToday = SONG_LYRICS.find(lyric => lyric.day === day);
    
    if (lyricForToday) {
        if (typewriter) {
            typewriter.stop();
            narrativeText.textContent = '';
            setTimeout(() => {
                typewriter.type(`"${lyricForToday.text}"`);
            }, 100);
        } else {
            narrativeText.textContent = `"${lyricForToday.text}"`;
        }
    } else {
        let newText = "";
        if (awareness < 25) {
            newText = "The routine continues, but something feels different today.";
        } else if (awareness < 50) {
            newText = "You're starting to notice the world around you more clearly.";
        } else if (awareness < 75) {
            newText = "The grip is loosening. Each day you feel more alive.";
        } else {
            newText = "The world is more vibrant now. You're breaking free.";
        }
        
        if (typewriter) {
            typewriter.stop();
            narrativeText.textContent = '';
            setTimeout(() => {
                typewriter.type(newText);
            }, 100);
        } else {
            narrativeText.textContent = newText;
        }
    }
}

/**
 * Show a thought bubble with text based on awareness level
 */
/**
 * Show segment narrative text
 */
function showSegmentNarrative(segmentNumber) {
    // Define narratives for each segment
    const narratives = [
        "The routine continues. Same faces, same train. But something feels different today.",
        "You're starting to notice the world around you more clearly. The routine is still there, but you're waking up.",
        "The grip is loosening. Each day you feel more conscious, more alive. The routine can be broken.",
        "The world is more vibrant now. The daily commute is becoming a journey of choice, not necessity.",
        "Colors appear more vivid. Details you never noticed before demand your attention.",
        "Time seems to flow differently now. You're present in each moment.",
        "Other commuters begin to appear as individuals, not a faceless crowd.",
        "The train no longer feels like a prison. It's merely a vehicle, and you control where it takes you.",
        "DRONE NO MORE, I'M MY OWN PERSON. You've broken free from the cycle."
    ];

    // Get the narrative for this segment (0-indexed array)
    const narrative = narratives[segmentNumber - 1] ||
        "Your awareness continues to grow...";

    // Update the narrative display
    if (typewriter) {
        typewriter.stop();
        narrativeText.textContent = '';
        setTimeout(() => {
            typewriter.type(narrative);
        }, 100);
    } else {
        narrativeText.textContent = narrative;
    }
}

/**
 * Update typewriter text
 */
function updateTypewriterText(text) {
    if (typewriter) {
        typewriter.stop();
        narrativeText.textContent = '';
        setTimeout(() => {
            typewriter.type(text);
        }, 100);
    } else {
        narrativeText.textContent = text;
    }
}

/**
 * Show a message for a specified duration
 */
function showMessage(text, duration = 2000) {
    message.textContent = text;
    message.style.visibility = 'visible';

    setTimeout(() => {
        message.style.visibility = 'hidden';
    }, duration);
}

/**
 * Show a popup message at the click location
 */
function showPopupMessage(text, x, y) {
    // Find or create the popup element
    let popup = document.getElementById('popup-message');

    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popup-message';
        document.body.appendChild(popup);

        // Style the popup
        popup.style.position = 'absolute';
        popup.style.padding = '8px 12px';
        popup.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        popup.style.color = '#d4d4c8';
        popup.style.borderRadius = '5px';
        popup.style.fontSize = '14px';
        popup.style.fontFamily = "'Courier New', monospace";
        popup.style.zIndex = '1000';
        popup.style.pointerEvents = 'none'; // Let clicks pass through
        popup.style.transition = 'opacity 0.5s ease';
    }

    // Set the text and position
    popup.textContent = text;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.opacity = '1';

    // Show and then fade out
    clearTimeout(popup.fadeTimeout);
    popup.style.display = 'block';

    popup.fadeTimeout = setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 2000);
}

/**
 * Show a thought bubble with text based on awareness level
 */
function showThoughtBubble() {
    // Define thoughts based on awareness levels
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

    // Select appropriate thought based on awareness level
    let thoughtPool;

    if (awareness < 25) {
        thoughtPool = THOUGHTS.early;
    } else if (awareness < 50) {
        thoughtPool = THOUGHTS.mid;
    } else if (awareness < 75) {
        thoughtPool = THOUGHTS.late;
    } else {
        thoughtPool = THOUGHTS.final;
    }

    // Randomly select a thought
    const thought = thoughtPool[Math.floor(Math.random() * thoughtPool.length)];
    thoughtBubble.textContent = thought;

    // Position the thought bubble near the player
    thoughtBubble.style.top = '40%';
    thoughtBubble.style.left = '75%';
    thoughtBubble.style.visibility = 'visible';

    setTimeout(() => {
        thoughtBubble.style.visibility = 'hidden';
    }, 3000);
}

/**
 * Game completion
 */
function gameComplete() {
    const sceneContainer = gameState.elements.sceneContainer;
    const trainButton = gameState.elements.trainButton;
    
    sceneContainer.classList.add('completion');

    setTimeout(() => {
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message';
        completionMessage.innerHTML = `
            <h2>DRONE NO MORE</h2>
            <p>You've reached 100% awareness and broken free from the daily grind.</p>
            <p>Days on the train: ${gameState.day}</p>
            <p>Changes found: ${gameState.changesFound}</p>
        `;

        // Style the completion message
        Object.assign(completionMessage.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#d4d4c8',
            padding: '20px',
            textAlign: 'center',
            zIndex: '1000',
            borderRadius: '5px'
        });

        sceneContainer.appendChild(completionMessage);
        updateTypewriterText("DRONE NO MORE, I'M MY OWN MAN. You've broken free from the cycle.");

        if (trainButton) {
            trainButton.disabled = true;
        }
    }, 2000);
}

/**
 * Show a hint to help the player
 */
function showHint() {
    // Only provide hint if there is an active change
    if (!gameState.currentChange) {
        showMessage("No changes to find yet. Take the train!", 1500);
        return;
    }

    // Find the commuter for the current change
    const commuter = commuters.allCommuters.find(c => c.id === gameState.currentChange.commuterId);

    if (commuter && commuter.element && !gameState.currentChange.found) {
        // Determine which quadrant the change is in
        const rect = commuter.element.getBoundingClientRect();
        const sceneRect = gameState.elements.sceneContainer.getBoundingClientRect();

        const isTop = rect.top < (sceneRect.top + sceneRect.height / 2);
        const isLeft = rect.left < (sceneRect.left + sceneRect.width / 2);

        let location = isTop ? 'top' : 'bottom';
        location += isLeft ? ' left' : ' right';

        // Show hint message
        showMessage(`Look for a change in the ${location} area`, 2000);

        // Disable hint button temporarily
        const hintButton = document.getElementById('hint-button');
        if (hintButton) {
            hintButton.disabled = true;
            setTimeout(() => {
                hintButton.disabled = false;
            }, 5000);
        }
    } else {
        showMessage("No unfound changes left today", 1500);
    }
}

// Export UI functions to window object
window.ui = {
    updateAwarenessDisplay,
    updateColorStage,
    showMessage,
    showPopupMessage,
    showThoughtBubble,
    updateNarrativeText,
    showSegmentNarrative,
    updateTypewriterText,
    checkForLyrics,
    gameComplete,
    showHint
};