// Variables for theme toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load theme preference from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

// Event listener for theme toggle
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

// Variables for navigation and filtering
const navButtons = document.querySelectorAll('.nav-button');
const filterButtons = document.querySelectorAll('.filter-button');
let currentType = 'court';
let currentFilter = null;

// Card data will be loaded from cards.json
let cardData = [];

// Load card data from JSON file
fetch('cards.json')
    .then(response => response.json())
    .then(data => {
        // Load from localStorage if available
        const savedData = localStorage.getItem('cardData');
        if (savedData) {
            cardData = JSON.parse(savedData);
        } else {
            cardData = data.cards;
        }
        initializeApp();
    })
    .catch(error => console.error('Error loading card data:', error));

// Initialize the application after data is loaded
function initializeApp() {
    // Event listeners for navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentType = button.getAttribute('data-type');
            currentFilter = null;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            displayAllCards(currentType);
        });
    });

    // Event listeners for filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-color');
            displayAllCards(currentType);
        });
    });

    // Event listener for search input
    document.getElementById('search-input').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        filterCardsBySearch(query);
    });

    // Initial display of cards
    displayAllCards(currentType);
}

// Function to display all cards of a certain type with current filters
function displayAllCards(type) {
    // Clear the search input
    document.getElementById('search-input').value = '';

    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';

    let filteredCards = cardData.filter(card => card.type === type);

    if (currentFilter) {
        filteredCards = filteredCards.filter(card => card.player === currentFilter);
    }

    displayFilteredCards(filteredCards);
}

// Function to display filtered cards
function displayFilteredCards(cards) {
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';

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
        description.style.display = card.player !== 'none' ? 'block' : 'none';
        cardElement.appendChild(description);

        // Player Picker (Assignment Buttons)
        const playerPicker = document.createElement('div');
        playerPicker.classList.add('player-picker');

        // Define the options array based on card type
        let options;
        if (card.type === 'court') {
            options = ['none', 'court', 'red', 'blue', 'gold', 'white'];
        } else {
            options = ['none', 'draft', 'red', 'blue', 'gold', 'white'];
        }

        // Create assignment buttons
        options.forEach(optionValue => {
            const button = document.createElement('button');
            button.classList.add('assign-button');
            button.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
            button.setAttribute('data-value', optionValue);
            button.setAttribute('aria-label', `Assign to ${optionValue.charAt(0).toUpperCase() + optionValue.slice(1)}`);

            // Highlight the button if it's the current assignment
            if (card.player === optionValue) {
                button.classList.add('active');
            }

            // Add event listener for assignment
            button.addEventListener('click', () => {
                // Update the card's player assignment
                card.player = optionValue;

                // Save updated card data to localStorage
                localStorage.setItem('cardData', JSON.stringify(cardData));

                // Re-render the cards to reflect changes
                displayAllCards(currentType);
            });

            playerPicker.appendChild(button);
        });

        cardElement.appendChild(playerPicker);
        cardList.appendChild(cardElement);
    });
}

// Function to filter cards based on search query
function filterCardsBySearch(query) {
    const filteredCards = cardData.filter(card => {
        return card.type === currentType &&
            (card.title.toLowerCase().includes(query) ||
                card.description.toLowerCase().includes(query));
    });

    if (currentFilter) {
        filteredCards = filteredCards.filter(card => card.player === currentFilter);
    }

    displayFilteredCards(filteredCards);
}

// Function to format description text with bold phrases
function formatDescription(text) {
    const phrasesToBold = [
        "When Secured:",
        "Abduct (Battle):",
        "Prelude:",
        "Pressgang (Build):",
        "Execute (Influence):",
        "Manufacture (Build):",
        "Synthesize (Build):",
        "Trade (Tax):",
        "Nurture (Build):",
        "Prune (Repair):",
        "Fire Rifles (Battle):",
        "Martyr (Move):",
        "Annex (Build):",
        "Guide (Move):",
        // Add any other phrases you want to bold
    ];

    const escapedPhrases = phrasesToBold.map(phrase => phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = '\\b(' + escapedPhrases.join('|') + ')';
    const regex = new RegExp(pattern, 'g');

    const formattedText = text.replace(regex, '<strong>$1</strong>');
    return formattedText;
}

// Function to reset all selections
function resetSelections() {
    cardData.forEach(card => {
        card.player = 'none';
    });
    localStorage.removeItem('cardData'); // Clear saved data
    currentFilter = null;
    filterButtons.forEach(btn => btn.classList.remove('active'));
    displayAllCards(currentType);
}