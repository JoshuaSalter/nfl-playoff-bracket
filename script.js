// Full state for AFC and NFC
const state = {
  afc: { wildCard: [], divisional: [], conference: [] },
  nfc: { wildCard: [], divisional: [], conference: [] }
};

// First seeds automatically in Divisional round
const firstSeed = {
  afc: { name: 'AFC1', seed: 1 },
  nfc: { name: 'NFC1', seed: 1 }
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

// Helper to sort teams by seed ascending
function sortBySeed(a, b) { return a.seed - b.seed; }

// Update Divisional matchups based on Wild Card winners
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort(sortBySeed);
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // Clear non-first-seed slots
  divMatchups.forEach(m => {
    Array.from(m.children).forEach(c => {
      if (!c.dataset.firstSeed) {
        c.textContent = '';
        c.dataset.team = '';
        c.dataset.seed = '';
      }
    });
  });

  if (winners.length === 0) return;

  const first = firstSeed[conf];
  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t.name !== lowest.name);

  // First seed vs lowest seed
  divMatchups[0].children[0].textContent = first.name;
  divMatchups[0].children[0].dataset.team = first.name;
  divMatchups[0].children[0].dataset.seed = first.seed;
  divMatchups[0].children[0].dataset.firstSeed = true;

  divMatchups[0].children[1].textContent = lowest.name;
  divMatchups[0].children[1].dataset.team = lowest.name;
  divMatchups[0].children[1].dataset.seed = lowest.seed;

  // Remaining two teams
  if (remaining[0]) {
    divMatchups[1].children[0].textContent = remaining[0].name;
    divMatchups[1].children[0].dataset.team = remaining[0].name;
    divMatchups[1].children[0].dataset.seed = remaining[0].seed;
  }
  if (remaining[1]) {
    divMatchups[1].children[1].textContent = remaining[1].name;
    divMatchups[1].children[1].dataset.team = remaining[1].name;
    divMatchups[1].children[1].dataset.seed = remaining[1].seed;
  }
}

// Update Conference slot for a clicked Divisional winner
function updateConferenceSlot(conf, divGameId, winner) {
  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  // Determine top or bottom slot in Conference matchup
  let slotIndex = 0;
  if (conf === 'afc') slotIndex = divGameId === 'AFC-D1' ? 0 : 1;
  else slotIndex = divGameId === 'NFC-D1' ? 0 : 1;

  const slot = confMatchup.children[slotIndex];
  slot.textContent = winner.name;
  slot.dataset.team = winner.name;
  slot.dataset.seed = winner.seed;
}

// Update Super Bowl matchup dynamically
function updateSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  const afcWinner = state.afc.conference[0];
  const nfcWinner = state.nfc.conference[0];

  sb.children[0].textContent = afcWinner ? afcWinner.name : '';
  sb.children[0].dataset.team = afcWinner ? afcWinner.name : '';
  sb.children[1].textContent = nfcWinner ? nfcWinner.name : '';
  sb.children[1].dataset.team = nfcWinner ? nfcWinner.name : '';
}

// Click handler for all teams
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => {
    const matchup = team.parentElement;
    const gameId = matchup.dataset.game;

    // Highlight selected team
    matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    team.classList.add('selected');

    // --- Wild Card click ---
    if (wildCardConfs[gameId]) {
      const conf = wildCardConfs[gameId];
      const winner = { name: team.textContent, seed: parseInt(team.dataset.seed), game: gameId };

      // Update Wild Card state
      state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
      state[conf].wildCard.push(winner);

      updateDivisional(conf); // immediately reseed Divisional
      return;
    }

    // --- Divisional click ---
    if (gameId.includes('D')) {
      const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
      const winner = { name: team.textContent, seed: parseInt(team.dataset.seed), game: gameId };

      state[conf].divisional = state[conf].divisional.filter(t => t.game !== gameId);
      state[conf].divisional.push(winner);

      updateConferenceSlot(conf, gameId, winner);
      updateSuperBowl(); // update SB if Conference winner picked
      return;
    }

    // --- Conference click ---
    if (gameId.includes('Conf')) {
      const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
      const winner = { name: team.textContent, seed: parseInt(team.dataset.seed), game: gameId };

      state[conf].conference = [winner]; // only one winner
      updateSuperBowl();
      return;
    }
  });
});
