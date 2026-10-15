// Functional Hamburger Menu

function goTo(screenId) {
    const target = document.getElementById(screenId);
    if (!target) return;

    document.querySelectorAll('.screen').forEach((screen) => {
        screen.classList.remove('active');
    });

    target.classList.add('active');
    document.getElementById('scroll-area').scrollTop = 0;
}

function toggleMenu(force) {
    const menu = document.getElementById('nav-links');
    const button = document.getElementById('hamburger-button');

    const isOpen = typeof force === 'boolean'
        ? force
        : !menu.classList.contains('open');

    menu.classList.toggle('open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        toggleMenu(false);
    }
});

// Close the Hamburger Menu when Clicking Outside of Its Viewport

document.addEventListener('click', (event) => {
    const menu = document.getElementById('nav-links');
    const button = document.getElementById('hamburger-button');

    if (!menu.contains(event.target) && !button.contains(event.target)) {
        toggleMenu(false);
    }
});

// Location Permission Request

async function getLocationFromInput() {
    const input = document.getElementById('manual-city');
    const display = document.getElementById('location-display');
    const button = document.getElementById('manual-city-button');
    const query = input.value.trim();

    if (!query) {
        display.textContent = 'Enter a city or ZIP code to search.';
        display.classList.add('location-error');
        input.focus();
        return;
    }

    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    display.textContent = 'Searching for your location...';
    display.classList.remove('location-error');
    button.disabled = true;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Location lookup failed with status ${response.status}.`);
        }

        const data = await response.json();
        const location = data.results?.[0];
        if (!location) {
            display.textContent = `No location found for "${query}". Check the spelling or try a nearby city.`;
            display.classList.add('location-error');
            return;
        }

        const locationName = [location.name, location.admin1, location.country]
            .filter((part, index, parts) => part && parts.indexOf(part) === index)
            .join(', ');
        display.textContent = `Found location: ${locationName}.`;
    } catch (error) {
        console.error('Unable to find the location:', error);
        display.textContent = 'Unable to find the location right now. Check your connection and try again.';
        display.classList.add('location-error');
    } finally {
        button.disabled = false;
    }
}

function getLocation() {
    const display = document.getElementById('location-display');
    const button = document.getElementById('location-button');

    if (!navigator.geolocation) {
        display.textContent = 'Sorry, location is not supported in this browser';
        display.classList.add('location-error');
        return;
    }

    display.textContent = 'Requesting your location...';
    display.classList.remove('location-error');
    button.disabled = true;

    navigator.geolocation.getCurrentPosition(showPosition, showError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
    });
}

function showPosition(position) {
    const display = document.getElementById('location-display');
    const button = document.getElementById('location-button');
    const { latitude, longitude } = position.coords;

    display.textContent = `Location found: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}.`;
    display.classList.remove('location-error');
    button.disabled = false;
}

function showError(error) {
    const display = document.getElementById('location-display');
    const button = document.getElementById('location-button');
    const messages = {
        1: 'Location permission was denied. Allow location access in your browser settings, then try again.',
        2: 'Your location could not be found. Try typing it manually',
        3: 'Your request timed out. Try again.'
    };

    display.textContent = messages[error.code] || 'An error occurred while getting your location. Try again.';
    display.classList.add('location-error');
    button.disabled = false;
}