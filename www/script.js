// Functional Hamburger Menu

function goTo(screenId) {
    const target = document.getElementById(screenId);
    if (!target) return;

    document.querySelectorAll('.screen').forEach((screen) => {
        screen.classList.remove('active');
    });

    // Build the Step 4 checklist from whatever was picked in Step 1
    if (screenId === 'screen-setup-materials') {
        rememberCheckedCarryItems();
        renderCarryItems();
    }

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

// Close the Hamburger Menu Automatically when Clicking on a Section

document.getElementById('nav-links').addEventListener('click', (event) => {
    const link = event.target.closest('a');

    if (link) {
        toggleMenu(false);
    }
});

// Location Permission Request for Step 2

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log("Location captured silently:", latitude, longitude);
}

function showError(error) {
    console.log("User denied or error occurred.");
}

// Step 1 → Step 2: Require at least one condition

function getSelectedConditions() {
    return Array.from(document.querySelectorAll('#conditions-list input[type="checkbox"]:checked'))
        .map((input) => input.dataset.value);
}

function nextFromConditions() {
    const error = document.getElementById('conditions-error');

    if (getSelectedConditions().length === 0) {
        error.textContent = 'Please pick at least one condition to continue.';
        return;
    }

    error.textContent = '';
    goTo('screen-setup-location');
}

document.getElementById('conditions-list').addEventListener('change', () => {
    document.getElementById('conditions-error').textContent = '';
});

// Step 4: "What do you usually carry?"

// When each reminder fires (also fills the "Remind me…" dropdown)
const REMINDER_TRIGGERS = {
    'air-quality': 'when air quality is poor',
    'pressure': 'when pressure is shifting',
    'uv': 'when UV is high',
    'heat': 'when it\'s hot out',
    'cold': 'when it\'s cold out',
    'particulates': 'when particulates are high',
    'dry-air': 'when the air is dry',
    'pollen': 'when pollen is high'
};

// Every item the app knows about. `trigger` is a key from REMINDER_TRIGGERS.
const CARRY_ITEMS = {
    'rescue-inhaler':     { name: 'Rescue inhaler',       detail: 'Remind me when air quality is poor', trigger: 'air-quality' },
    'spacer':             { name: 'Spacer',               detail: 'Remind me when air quality is poor', trigger: 'air-quality' },
    'scarf':              { name: 'Scarf or face cover',  detail: 'Remind me when it\'s cold and dry',  trigger: 'cold' },
    'migraine-meds':      { name: 'Migraine medication',  detail: 'Remind me when pressure is shifting', trigger: 'pressure' },
    'sunglasses':         { name: 'Sunglasses',           detail: 'Remind me when UV is high',          trigger: 'uv' },
    'moisturizer':        { name: 'Moisturizer',          detail: 'Remind me when the air is dry',      trigger: 'dry-air' },
    'anti-itch-cream':    { name: 'Anti-itch cream',      detail: 'Remind me when pollen is high',      trigger: 'pollen' },
    'heart-meds':         { name: 'Heart medication',     detail: 'Remind me when temperatures are extreme', trigger: 'heat' },
    'cooling-towel':      { name: 'Cooling towel',        detail: 'Remind me when it\'s hot out',       trigger: 'heat' },
    'prescribed-meds':    { name: 'Prescribed medication', detail: 'Remind me when conditions are extreme', trigger: 'heat' },
    'warm-layer':         { name: 'Warm layer',           detail: 'Remind me when it\'s cold out',      trigger: 'cold' },
    'water-bottle':       { name: 'Water bottle',         detail: 'When it\'s hot out',                 trigger: 'heat' },
    'n95-mask':           { name: 'N95 mask',             detail: 'When particulates are high',         trigger: 'particulates' },
    'sunscreen':          { name: 'Sunscreen',            detail: 'When UV is 3 or above',              trigger: 'uv' },
    'allergy-meds':       { name: 'Allergy medication',   detail: 'When pollen is high',                trigger: 'pollen' },
    'hat':                { name: 'Hat',                  detail: 'When UV is high',                    trigger: 'uv' }
};

// Which items show up for each Step 1 condition (keys match the Step 1 data-value)
const CONDITION_ITEMS = {
    'asthma':                  { label: 'ASTHMA',         items: ['rescue-inhaler', 'spacer', 'scarf'] },
    'migraine':                { label: 'MIGRAINE',       items: ['migraine-meds', 'sunglasses'] },
    'eczema':                  { label: 'ECZEMA',         items: ['moisturizer', 'anti-itch-cream'] },
    'heart-related-condition': { label: 'A HEART CONDITION', items: ['heart-meds', 'cooling-towel'] },
    'other':                   { label: 'ANOTHER CONDITION', items: ['prescribed-meds', 'warm-layer'] }
};

// Shown to everyone, minus anything already listed under a condition
const COMMON_ITEMS = ['water-bottle', 'n95-mask', 'sunscreen', 'moisturizer', 'allergy-meds', 'hat'];

// Items the user typed in themselves
const customItems = [];

// Remembers what's ticked so going Back → Next doesn't wipe it
let checkedCarryItems = null;
let lastConditionsKey = '';

function buildCarryRow(id, item, checked) {
    const label = document.createElement('label');
    label.className = 'check-row carry-row';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.value = id;
    input.checked = checked;

    const box = document.createElement('span');
    box.className = 'box';

    const copy = document.createElement('span');
    copy.className = 'check-copy';

    const heading = document.createElement('span');
    heading.className = 'check-heading';
    heading.textContent = item.name;

    const sub = document.createElement('span');
    sub.className = 'check-subheading';
    sub.textContent = item.detail;

    copy.append(heading, sub);
    label.append(input, box, copy);
    return label;
}

function buildCarryGroup(title, ids, isChecked) {
    const fragment = document.createDocumentFragment();

    const heading = document.createElement('p');
    heading.className = 'carry-group-label';
    heading.textContent = title;

    const list = document.createElement('div');
    list.className = 'carry-list';
    ids.forEach((id, index) => {
        const item = CARRY_ITEMS[id] || customItems.find((c) => c.id === id);
        list.appendChild(buildCarryRow(id, item, isChecked(id, index)));
    });

    fragment.append(heading, list);
    return fragment;
}

function rememberCheckedCarryItems() {
    const inputs = document.querySelectorAll('#carry-groups input[type="checkbox"]');
    if (inputs.length === 0) return;

    checkedCarryItems = new Set(
        Array.from(inputs).filter((input) => input.checked).map((input) => input.dataset.value)
    );
}

function renderCarryItems() {
    const container = document.getElementById('carry-groups');
    const conditions = getSelectedConditions();
    const conditionsKey = conditions.join(',');

    // Keep the user's ticks if the conditions haven't changed; otherwise start fresh
    if (conditionsKey !== lastConditionsKey) {
        checkedCarryItems = null;
        lastConditionsKey = conditionsKey;
    }

    container.innerHTML = '';
    const shown = new Set();

    // By default, tick the first (most essential) item for each condition
    const defaultCheck = (id, index) => (checkedCarryItems ? checkedCarryItems.has(id) : index === 0);

    conditions.forEach((condition) => {
        const group = CONDITION_ITEMS[condition];
        if (!group) return;

        const ids = group.items.filter((id) => !shown.has(id));
        if (ids.length === 0) return;
        ids.forEach((id) => shown.add(id));

        container.appendChild(buildCarryGroup('BECAUSE YOU CHOSE ' + group.label, ids, defaultCheck));
    });

    const commonIds = COMMON_ITEMS.filter((id) => !shown.has(id));
    if (commonIds.length > 0) {
        container.appendChild(buildCarryGroup('COMMON — TAP TO ADD', commonIds,
            (id) => (checkedCarryItems ? checkedCarryItems.has(id) : false)));
    }

    if (customItems.length > 0) {
        container.appendChild(buildCarryGroup('YOUR ITEMS', customItems.map((c) => c.id),
            (id) => (checkedCarryItems ? checkedCarryItems.has(id) : true)));
    }

    populateTriggerSelect();
}

function populateTriggerSelect() {
    const select = document.getElementById('custom-item-trigger');
    if (select.options.length > 0) return;

    Object.entries(REMINDER_TRIGGERS).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
    });
}

function addCustomItem() {
    const nameInput = document.getElementById('custom-item-name');
    const trigger = document.getElementById('custom-item-trigger').value;
    const error = document.getElementById('custom-item-error');
    const name = nameInput.value.trim();

    if (!name) {
        error.textContent = 'Type an item name first.';
        nameInput.focus();
        return;
    }

    const allNames = Object.values(CARRY_ITEMS).concat(customItems).map((item) => item.name.toLowerCase());
    if (allNames.includes(name.toLowerCase())) {
        error.textContent = 'That item is already on the list.';
        return;
    }

    const id = 'custom-' + Date.now();
    customItems.push({
        id,
        name,
        detail: 'Remind me ' + REMINDER_TRIGGERS[trigger],
        trigger
    });

    // Keep current ticks and tick the new item
    rememberCheckedCarryItems();
    if (checkedCarryItems) checkedCarryItems.add(id);
    lastConditionsKey = getSelectedConditions().join(',');

    error.textContent = '';
    nameInput.value = '';
    renderCarryItems();
}

document.getElementById('custom-item-name').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        addCustomItem();
    }
});

// Collected Step 4 answers: [{ id, name, trigger }]
let userCarryItems = [];

function saveCarryItems() {
    userCarryItems = Array.from(document.querySelectorAll('#carry-groups input[type="checkbox"]:checked'))
        .map((input) => {
            const id = input.dataset.value;
            const item = CARRY_ITEMS[id] || customItems.find((c) => c.id === id);
            return { id, name: item.name, trigger: item.trigger };
        });

    console.log('Carry items saved:', userCarryItems);

    // Step 5 (Reminders) isn't built yet — this will start working once that section exists
    goTo('screen-setup-reminders');
}
