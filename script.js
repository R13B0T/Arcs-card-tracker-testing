// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load the saved theme preference from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

// Event listener for theme toggle button
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

// Variables for card navigation and filtering
const navButtons = document.querySelectorAll('.nav-button');
const filterButtons = document.querySelectorAll('.filter-button');
let currentType = 'court'; // Default type is court cards
let currentFilter = null;  // No filter initially

// Placeholder for card data, will be populated from the JSON file
let cardData = [];

// Fetch the card data from cards.json
fetch('cards.json')
    .then(response => response.json())
    .then(data => {
        // Load card data from localStorage if it exists, otherwise use the JSON file
        const savedData = localStorage.getItem('cardData');
        if (savedData) {
            cardData = JSON.parse(savedData);
        } else {
            cardData = data.cards;
        }
        initializeApp(); // Initialize the app once the data is loaded
    })
    .catch(error => console.error('Error loading card data:', error));

// Initialize the app and setup event listeners
function initializeApp() {
    // Event listeners for navigation buttons (Court, Leader, Lore)
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentType = button.getAttribute('data-type');  // Update the current card type
            currentFilter = null;  // Reset filter when switching types
            filterButtons.forEach(btn => btn.classList.remove('active'));  // Clear active filters
            displayAllCards(currentType);  // Display cards of the selected type
        });
    });

    // Event listeners for filter buttons (Court, Draft, Red, etc.)
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-color');  // Update the filter based on the button
            displayAllCards(currentType);  // Display filtered cards
        });
    });

    // Event listener for search input to filter cards by search term
    document.getElementById('search-input').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        filterCardsBySearch(query);  // Filter cards by search query
    });

    // Initial display of cards (default type is court)
    displayAllCards(currentType);
}

// Function to display all cards of a certain type and apply any active filters
function displayAllCards(type) {
    document.getElementById('search-input').value = '';  // Clear search input
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';  // Clear existing cards

    // Filter cards by type (court, leader, or lore)
    let filteredCards = cardData.filter(card => card.type === type);

    // Apply the current filter (e.g., filter by player assignment)
    if (currentFilter) {
        filteredCards = filteredCards.filter(card => card.player === currentFilter);
    }

    displayFilteredCards(filteredCards);  // Display the filtered cards
}

// Function to display filtered cards
function displayFilteredCards(cards) {
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';  // Clear existing cards

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        // Card Title
        const title = document.createElement('h2');
        title.textContent = card.title;
        cardElement.appendChild(title);

        // Card Description
        const description = document.createElement('div');
        description.classList.add('description');
        description.innerHTML = formatDescription(card.description);
        cardElement.appendChild(description);

        // Only show discard button if the card is assigned to a player
        const validPlayers = ['court', 'red', 'blue', 'gold', 'white'];
        if (validPlayers.includes(card.player)) {
            // Discard Button (X) for removing cards to discard pile
            const discardButton = document.createElement('button');
            discardButton.classList.add('discard-button');
            discardButton.textContent = 'X';
            discardButton.addEventListener('click', () => {
                discardCard(card);  // Call discard function when button is clicked
            });
            cardElement.appendChild(discardButton);
        }

        // Player Picker for assigning the card to a player
        const playerPicker = document.createElement('div');
        playerPicker.classList.add('player-picker');

        // Options for player assignment based on card type
        let options = ['none', 'court', 'red', 'blue', 'gold', 'white'];
        if (card.type !== 'court') {
            options = ['none', 'draft', 'red', 'blue', 'gold', 'white'];
        }

        // Create buttons for assigning the card to a player
        options.forEach(optionValue => {
            const button = document.createElement('button');
            button.classList.add('assign-button', `${optionValue}-button`);
            button.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
            button.setAttribute('data-value', optionValue);

            // Highlight button if it's the current player assignment
            if (card.player === optionValue) {
                button.classList.add('active');
            }

            // Event listener to assign the card to a player
            button.addEventListener('click', () => {
                card.player = optionValue;  // Update the card's player assignment
                localStorage.setItem('cardData', JSON.stringify(cardData));  // Save updated card data
                displayAllCards(currentType);  // Refresh card display
            });

            playerPicker.appendChild(button);
        });

        cardElement.appendChild(playerPicker);
        cardList.appendChild(cardElement);
    });
}

// Function to discard a card to a discard pile
function discardCard(card) {
    card.player = 'discarded';  // Move the card to the discard pile
    localStorage.setItem('cardData', JSON.stringify(cardData));  // Save the updated card data
    displayAllCards(currentType);  // Refresh the card display
}

// Function to filter cards based on search query
function filterCardsBySearch(query) {
    let filteredCards = cardData.filter(card => {
        return card.type === currentType && (card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query));
    });

    // Apply player filter if one is active
    if (currentFilter) {
        filteredCards = filteredCards.filter(card => card.player === currentFilter);
    }

    displayFilteredCards(filteredCards);  // Display filtered cards
}

// Function to format card description and bold key phrases
function formatDescription(text) {
    const phrasesToBold = [
        "When Secured:", "Prelude:", "Abduct (Battle):", "Manufacture (Build):",
        "Pressgang (Build):", "Execute (Influence):", "Synthesize (Build):",
        "Trade (Tax):", "Guide (Move):", "Annex (Build):"
    ];
    
    const escapedPhrases = phrasesToBold.map(phrase => phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp('\\b(' + escapedPhrases.join('|') + ')', 'g');
    
    return text.replace(regex, '<strong>$1</strong>');  // Bold the phrases in the description
}

// Event listener for the "New App Controlled Game" button
document.getElementById('new-game-btn').addEventListener('click', () => {
    const playerCount = prompt("Select Player Count: 2, 3, or 4");
    if (['2', '3', '4'].includes(playerCount)) {
        startNewAppControlledGame(parseInt(playerCount));  // Start the game with the selected player count
    } else {
        alert("Invalid player count.");
    }
});

// Function to start the app-controlled game and assign cards
function startNewAppControlledGame(playerCount) {
    const courtCardCount = playerCount === 2 ? 3 : 4;  // Assign 3 court cards for 2 players, 4 for 3-4 players
    const draftCardCount = playerCount === 4 ? 5 : playerCount + 1;  // 3 players = 4 draft cards, 4 players = 5 draft cards

    assignRandomCourtCards(courtCardCount);  // Assign court cards to "Court" player
    assignDraftCards(draftCardCount, 'leader');  // Assign leader cards to "Draft" pool
    assignDraftCards(draftCardCount, 'lore');  // Assign lore cards to "Draft" pool
}

// Assign a random number of court cards
function assignRandomCourtCards(count) {
    const availableCourtCards = cardData.filter(card => card.type === 'court' && card.player === 'none'); // Filter only available court cards
    const randomCourtCards = getRandomCards(availableCourtCards, count); // Get random court cards based on count

    randomCourtCards.forEach(card => {
        card.player = 'court';  // Assign each card to the Court player
    });

    localStorage.setItem('cardData', JSON.stringify(cardData));  // Save the updated card data to localStorage
    displayAllCards('court');  // Refresh the card display to show the assigned cards
}

// Assign random leader and lore cards to the "draft" player
function assignDraftCards(count, type) {
    const availableDraftCards = cardData.filter(card => card.type === type && card.player === 'none'); // Filter leader and lore cards
    const randomDraftCards = getRandomCards(availableDraftCards, count); // Get random cards for draft

    randomDraftCards.forEach(card => {
        card.player = 'draft';  // Assign each card to the draft pool
    });

    localStorage.setItem('cardData', JSON.stringify(cardData));  // Save the updated card data
    displayAllCards(type);  // Refresh the display for leader/lore cards
}

// Helper function to get random cards from an array
function getRandomCards(cards, count) {
    let shuffled = [...cards].sort(() => 0.5 - Math.random());  // Shuffle the available cards randomly
    return shuffled.slice(0, count);  // Return the desired number of random cards
}

// Event listener for the "New Court Card" button to draw a random court card
document.getElementById('new-court-card-btn').addEventListener('click', () => {
    const availableCourtCards = cardData.filter(card => card.type === 'court' && card.player === 'none'); // Filter available court cards
    if (availableCourtCards.length > 0) {
        const newCourtCard = getRandomCards(availableCourtCards, 1)[0];  // Get one random court card
        newCourtCard.player = 'court';  // Assign it to the court player
        localStorage.setItem('cardData', JSON.stringify(cardData));  // Save the updated card data
        displayAllCards('court');  // Refresh the display
    } else {
        alert("No available court cards.");  // Show alert if no cards are available
    }
});

// Event listener for the "Reset Court Deck" button to reset all discarded cards back to available
document.getElementById('reset-court-deck-btn').addEventListener('click', () => {
    cardData.forEach(card => {
        if (card.player === 'discarded') {
            card.player = 'none';  // Reset discarded cards back to available
        }
    });
    localStorage.setItem('cardData', JSON.stringify(cardData));  // Save the reset card data
    displayAllCards('court');  // Refresh the court card display
});