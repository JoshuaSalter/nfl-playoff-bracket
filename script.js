// ===============================
// FULL STATE
// ===============================
const state = {
  afc: { wildCard: [], conference: [] },
  nfc: { wildCard: [], conference: [] }
};

// First seeds
const firstSeed = {
  afc: { name: 'Broncos', seed: 1 },
  nfc: { name: 'Seahawks', seed: 1 }
};

// Wild Card → Conference map
const wildCardConfs = {
  'AFC-WC1': 'afc',
  'AFC-WC2': 'afc',
  'AFC-WC3': 'afc',
  'NFC-WC1': 'nfc',
  'NFC-WC2': 'nfc',
  'NFC-WC3': 'nfc'
};

// ===============================
// HELPERS
// ===============================
const sortBySeed = (a, b) => a.seed - b.seed;

function createTeamElement(name, seed) {
  const team = document.createElement('div');
  team.classList.add('team');
  team.dataset.team = name;
  team.dataset.seed = seed;

  const img = document.createElement('img');
  img.src = `logos/${name.toLowerCase()}.svg`;
  img.alt = name;

  const span = document.createElement('span');
  span.textContent = `#${seed} ${name}`;

  team.append(img, span);
  team.addEventListener('click', () => handleTeamClick(team));

  return team;
}

function fillTeamSlot(slot, team) {
  slot.innerHTML = '';

  if (!team) {
    slot.classList.add('empty');
    return;
  }

  slot.classList.remove('empty');
  slot.appendChild(createTeamElement(team.name, team.seed));
}

// ===============================
// UPDATE DIVISIONAL (SAFE)
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort(sortBySeed);
  if (winners.length === 0) return;

  const divMatchups = [
    document.querySelector(`[data-game="${conf.toUpperCase()}-D1"]`),
    document.querySelector(`[data-game="${conf.toUpperCase()}-D2"]`)
  ];

  const first = firstSeed[conf];

  // --- DIV 1: first seed vs lowest ---
  const lowest = winners[winners.length - 1]; // lowest seed
  const remaining = winners.filter(t => t !== lowest);

  // Clear div1 but preserve first seed
  divMatchups[0].innerHTML = '';
  divMatchups[0].appendChild(createTeamElement(first.name, first.seed, first.logo));
  if (lowest) {
    divMatchups[0].appendChild(
      createTeamElement(lowest.name, lowest.seed, `logos/${lowest.name.toLowerCase()}.svg`)
    );
  }

  // --- DIV 2: remaining teams ---
  divMatchups[1].innerHTML = '';
  remaining.forEach(t =>
    divMatchups[1].appendChild(
      createTeamElement(t.name, t.seed, `logos/${t.name.toLowerCase()}.svg`)
    )
  );
}


// ===============================
// UPDATE CONFERENCE (SAFE)
// ===============================
function updateConferenceSlot(conf, winner) {
  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  // Get existing team slots
  let slots = Array.from(confMatchup.querySelectorAll('.team'));

  // Ensure 2 slots exist
  while (slots.length < 2) {
    const emptySlot = document.createElement('div');
    emptySlot.classList.add('team', 'empty');
    confMatchup.appendChild(emptySlot);
    slots.push(emptySlot);
  }

  // Find first empty slot
  let slotIndex = slots.findIndex(s => s.classList.contains('empty'));
  if (slotIndex === -1) slotIndex = 0; // fallback to slot 0

  // Replace empty slot with winner
  slots[slotIndex].replaceWith(
    createTeamElement(
      winner.name,
      winner.seed,
      `logos/${winner.name.toLowerCase()}.svg`
    )
  );

  // Update state
  state[conf].conference[slotIndex] = { ...winner, game: 'conference' };
}



// ===============================
// UPDATE SUPER BOWL (SAFE)
// ===============================
function updateSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  const slots = sb.querySelectorAll('.team');

  fillTeamSlot(slots[0], state.afc.conference[0]);
  fillTeamSlot(slots[1], state.nfc.conference[0]);
}

// ===============================
// CLICK HANDLER
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.closest('.matchup');
  if (!matchup || !matchup.dataset.game) return;

  const gameId = matchup.dataset.game;

  matchup.querySelectorAll('.team').forEach(t =>
    t.classList.remove('selected')
  );
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const conf = wildCardConfs[gameId];

    state[conf].wildCard = state[conf].wildCard.filter(
      t => t.game !== gameId
    );

    state[conf].wildCard.push({
      name: teamDiv.dataset.team,
      seed: +teamDiv.dataset.seed,
      game: gameId
    });

    updateDivisional(conf);
    return;
  }

  // --- Divisional ---
  if (gameId.includes('-D')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';

    updateConferenceSlot(conf, gameId, {
      name: teamDiv.dataset.team,
      seed: +teamDiv.dataset.seed
    });
    return;
  }

  // --- Conference ---
  if (gameId.includes('Conf')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';

    state[conf].conference = [{
      name: teamDiv.dataset.team,
      seed: +teamDiv.dataset.seed
    }];

    updateSuperBowl();
  }
}

// ===============================
// INIT
// ===============================
document.querySelectorAll('.team').forEach(team =>
  team.addEventListener('click', () => handleTeamClick(team))
);

// ===============================
// PRINT BRACKET
// ===============================
document.getElementById('printBracket').addEventListener('click', () => {
  window.print();
});

