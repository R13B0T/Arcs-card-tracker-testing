/* Style for buttons like New App Controlled Game, New Court Card, Reset Court Deck */
.new-game-button, .new-court-card-button, .reset-deck-button {
    padding: 10px 15px; /* Same size as the navigation buttons */
    background-color: var(--button-background);
    color: var(--button-color);
    border-radius: 5px;
    margin: 10px;
    cursor: pointer;
    border: none;
    text-align: center;
    font-size: 16px; /* Match the size of the other buttons */
    display: inline-block; /* Align them horizontally */
}

.new-game-button:hover, .new-court-card-button:hover, .reset-deck-button:hover {
    background-color: var(--active-button-background); /* Darker background on hover */
}

/* Discard button (X) styling for removing cards */
.discard-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    text-align: center;
}

.discard-button:hover {
    background-color: darkred; /* Darker red on hover */
}

/* Match the size of other buttons for the new game buttons */
.filter-buttons {
    display: flex;
    justify-content: center; /* Centre the buttons horizontally */
    gap: 10px; /* Add spacing between buttons */
    margin-bottom: 20px;
}

.filter-button {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    text-align: center;
}

.nav-button, .filter-button {
    background-color: var(--button-background);
    color: var(--button-color);
}

.nav-button.active, .filter-button.active {
    background-color: var(--active-button-background);
}