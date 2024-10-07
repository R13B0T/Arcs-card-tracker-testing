// Variables for theme toggle
var themeToggle = document.getElementById('theme-toggle');
var body = document.body;

// Load theme preference
var theme = localStorage.getItem('theme') || 'light';
if (theme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', function () {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

// Variables for navigation
var navButtons = document.querySelectorAll('.nav-button');
var filterButtons = document.querySelectorAll('.filter-button');
var currentType = 'court';
var currentFilter = null;

// Card data will be loaded from cards.json
let cardData = [];

// Load card data from JSON file
fetch('cards.json')
    .then(response => response.json())
    .then(data => {
        cardData = data.cards;
        initializeApp();
    })
    .catch(error => console.error('Error loading card data:', error));

// Initialize the application after data is loaded
function initializeApp() {
    // Event listeners for navigation buttons
    navButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            navButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            currentType = this.getAttribute('data-type');
            currentFilter = null;
            filterButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });
            displayAllCards(currentType);
        });
    });

    // Event listeners for filter buttons
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            currentFilter = this.getAttribute('data-color');
            displayAllCards(currentType);
        });
    });

    // Event listener for search input
    document.getElementById('search-input').addEventListener('input', function () {
        var query = this.value.toLowerCase();
        filterCardsBySearch(query);
    });

    // Initial display of cards
    displayAllCards(currentType);
}

// Function to display all cards of a certain type
function displayAllCards(type) {
    // Clear the search input
    document.getElementById('search-input').value = '';

    var cardList = document.getElementById('card-list');
    cardList.innerHTML = '';

    var filteredCards = cardData.filter(function (card) {
        return card.type === type;
    });

    if (currentFilter) {
        filteredCards = filteredCards.filter(function (card) {
            return card.player === currentFilter;
        });
    }

    displayFilteredCards(filteredCards);
}

// Function to display filtered cards
function displayFilteredCards(cards) {
    var cardList = document.getElementById('card-list');
    cardList.innerHTML = '';

    cards.forEach(function (card) {
        var cardElement = document.createElement("div");
        cardElement.classList.add("card");

        var title = document.createElement("h2");
        title.textContent = card.title;

        var description = document.createElement("div");
        description.classList.add("description");

        // Process the description text to add bold formatting
        var formattedDescriptionText = formatDescription(card.description);

        description.innerHTML = formattedDescriptionText;
        description.style.display = card.player !== "none" ? 'block' : 'none';

        var playerPicker = document.createElement("div");
        playerPicker.classList.add("player-picker");

        var select = document.createElement("select");
        select.value = card.player || 'none';

        // Update the options array to include 'court'
        var options = ['none', 'court', 'red', 'blue', 'gold', 'white'];
        options.forEach(function (optionValue) {
            var option = document.createElement("option");
            option.value = optionValue;
            option.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
            select.appendChild(option);
        });

        // Ensure the select's value matches card.player
        select.value = card.player || 'none';

        select.addEventListener('change', function () {
            var selectedValue = this.value;
            card.player = selectedValue;

            // Save updated card data to local storage (optional)
            // localStorage.setItem('cardData', JSON.stringify(cardData));

            // Re-render cards to reflect changes
            displayAllCards(currentType);
        });

        playerPicker.appendChild(select);

        cardElement.appendChild(title);
        cardElement.appendChild(description);
        cardElement.appendChild(playerPicker);

        cardList.appendChild(cardElement);
    });
}

// Function to filter cards based on search query
function filterCardsBySearch(query) {
    var filteredCards = cardData.filter(function (card) {
        return card.type === currentType &&
            (card.title.toLowerCase().includes(query) ||
                card.description.toLowerCase().includes(query));
    });

    if (currentFilter) {
        filteredCards = filteredCards.filter(function (card) {
            return card.player === currentFilter;
        });
    }

    displayFilteredCards(filteredCards);
}

// Function to format description text
function formatDescription(text) {
    var phrasesToBold = [
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

    var escapedPhrases = phrasesToBold.map(function (phrase) {
        return phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    });

    var pattern = '\\b(' + escapedPhrases.join('|') + ')';
    var regex = new RegExp(pattern, 'g');

    var formattedText = text.replace(regex, function (match) {
        return '<strong>' + match + '</strong>';
    });

    return formattedText;
}

// Function to reset selections
function resetSelections() {
    cardData.forEach(function (card) {
        card.player = 'none';
    });
    currentFilter = null;
    filterButtons.forEach(function (btn) {
        btn.classList.remove('active');
    });
    displayAllCards(currentType);
}