// ===============================
// FULL STATE
// ===============================
const state = {
  afc: { wildCard: [], divisional: [], conference: [] },
  nfc: { wildCard: [], divisional: [], conference: [] }
};

// First seeds automatically in Divisional round
const firstSeed = {
  afc: { name: 'AFC1', seed: 1, logo: 'logos/afc1.svg' },
  nfc: { name: 'NFC1', seed: 1, logo: 'logos/nfc1.svg' }
};

// Map Wild Card games to conferences
const wildCardConfs = {
  'AFC-WC1': 'afc',
  'AFC-WC2': 'afc',
  'AFC-WC3': 'afc',
  'NFC-WC1': 'nfc',
  'NFC-WC2': 'nfc',
  'NFC-WC3': 'nfc'
};

// ===============================
// HELPER FUNCTIONS
// ===============================
function sortBySeed(a, b) { return a.seed - b.seed; }

// Create a team element with logo and text
function createTeamElement(name, seed, logoPath) {
  const teamDiv = document.createElement('div');
  teamDiv.classList.add('team');
  teamDiv.dataset.team = name;
  teamDiv.dataset.seed = seed;

  const img = document.createElement('img');
  img.src = logoPath;
  img.alt = name;
  img.classList.add('logo');

  const span = document.createElement('span');
  span.textContent = `#${seed} ${name}`;

  teamDiv.appendChild(img);
  teamDiv.appendChild(span);

  // Click handler for this new element
  teamDiv.addEventListener('click', () => handleTeamClick(teamDiv));

  return teamDiv;
}

// ===============================
// UPDATE DIVISIONAL MATCHUPS
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort(sortBySeed);

  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // Clear non-first-seed slots
  divMatchups.forEach(m => {
    while (m.firstChild) m.removeChild(m.firstChild);
  });

  if (winners.length === 0) return;

  const first = firstSeed[conf];
  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t.name !== lowest.name);

  // First seed vs lowest seed
  divMatchups[0].appendChild(createTeamElement(first.name, first.seed, first.logo));
  divMatchups[0].appendChild(createTeamElement(lowest.name, lowest.seed, `logos/${lowest.name.toLowerCase()}.svg`));

  // Remaining two teams
  if (remaining[0]) divMatchups[1].appendChild(createTeamElement(remaining[0].name, remaining[0].seed, `logos/${remaining[0].name.toLowerCase()}.svg`));
  if (remaining[1]) divMatchups[1].appendChild(createTeamElement(remaining[1].name, remaining[1].seed, `logos/${remaining[1].name.toLowerCase()}.svg`));
}

// ===============================
// UPDATE CONFERENCE SLOT
// ===============================
function updateConferenceSlot(conf, divGameId, winner) {
  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  let slotIndex = 0;
  if (conf === 'afc') slotIndex = divGameId === 'AFC-D1' ? 0 : 1;
  else slotIndex = divGameId === 'NFC-D1' ? 0 : 1;

  // Clear old slot
  const slot = confMatchup.children[slotIndex];
  slot.innerHTML = '';
  slot.appendChild(createTeamElement(winner.name, winner.seed, `logos/${winner.name.toLowerCase()}.svg`));

  state[conf].conference = state[conf].conference.filter(t => t.game !== 'conference');
  state[conf].conference.push({ ...winner, game: 'conference' });
}

// ===============================
// UPDATE SUPER BOWL
// ===============================
function updateSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  sb.innerHTML = ''; // clear old

  const afcWinner = state.afc.conference[0];
  const nfcWinner = state.nfc.conference[0];

  if (afcWinner) sb.appendChild(createTeamElement(afcWinner.name, afcWinner.seed, `logos/${afcWinner.name.toLowerCase()}.svg`));
  if (nfcWinner) sb.appendChild(createTeamElement(nfcWinner.name, nfcWinner.seed, `logos/${nfcWinner.name.toLowerCase()}.svg`));
}

// ===============================
// HANDLE TEAM CLICK
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.parentElement;
  const gameId = matchup.dataset.game;

  // Highlight selected team
  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const conf = wildCardConfs[gameId];
    const winner = {
      name: teamDiv.dataset.team,
      seed: parseInt(teamDiv.dataset.seed),
      game: gameId
    };
    state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
    state[conf].wildCard.push(winner);
    updateDivisional(conf);
    return;
  }

  // --- Divisional ---
  if (gameId.includes('D')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
    const winner = {
      name: teamDiv.dataset.team,
      seed: parseInt(teamDiv.dataset.seed),
      game: gameId
    };
    state[conf].divisional = state[conf].divisional.filter(t => t.game !== gameId);
    state[conf].divisional.push(winner);
    updateConferenceSlot(conf, gameId, winner);
    updateSuperBowl();
    return;
  }

  // --- Conference ---
  if (gameId.includes('Conf')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
    const winner = {
      name: teamDiv.dataset.team,
      seed: parseInt(teamDiv.dataset.seed),
      game: gameId
    };
    state[conf].conference = [winner];
    updateSuperBowl();
    return;
  }
}

// ===============================
// INITIALIZE EXISTING TEAMS
// ===============================
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => handleTeamClick(team));
});
