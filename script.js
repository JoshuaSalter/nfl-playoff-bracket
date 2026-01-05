// Keep track of winners
const state = {
  afc: {
    wildCard: [],
    divisional: []
  },
  nfc: {
    wildCard: [],
    divisional: []
  }
};

// Map wildcard games to conferences
const confMap = {
  'AFC-WC1': 'afc',
  'AFC-WC2': 'afc',
  'AFC-WC3': 'afc',
  'NFC-WC1': 'nfc',
  'NFC-WC2': 'nfc',
  'NFC-WC3': 'nfc'
};

// 1st seeds for each conference
const firstSeed = {
  afc: { name: 'AFC1', seed: 1 },
  nfc: { name: 'NFC1', seed: 1 }
};

// Function to advance a team to Divisional round with reseeding
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort((a, b) => a.seed - b.seed); // lowest seed = highest number
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // First seed always plays lowest remaining seed
  if (winners.length === 0) {
    // Clear if no winners yet
    divMatchups.forEach(m => {
      m.children[1].textContent = '';
      m.children[1].dataset.team = '';
      m.children[1].dataset.seed = '';
    });
    return;
  }

  const first = firstSeed[conf]; // 1st seed
  const lowest = winners[winners.length - 1]; // highest seed number = lowest rank
  divMatchups[0].children[0].textContent = first.name;
  divMatchups[0].children[0].dataset.team = first.name;
  divMatchups[0].children[0].dataset.seed = first.seed;
  divMatchups[0].children[1].textContent = lowest.name;
  divMatchups[0].children[1].dataset.team = lowest.name;
  divMatchups[0].children[1].dataset.seed = lowest.seed;

  // Other matchup (remaining two teams if exist)
  const remaining = winners.filter(t => t.name !== lowest.name);
  if (remaining.length > 0) {
    divMatchups[1].children[0].textContent = remaining[0].name;
    divMatchups[1].children[0].dataset.team = remaining[0].name;
    divMatchups[1].children[0].dataset.seed = remaining[0].seed;
  }
  if (remaining.length > 1) {
    divMatchups[1].children[1].textContent = remaining[1].name;
    divMatchups[1].children[1].dataset.team = remaining[1].name;
    divMatchups[1].children[1].dataset.seed = remaining[1].seed;
  }
}

// Propagate winners to Conference round and Super Bowl
function propagateNextRound(matchup) {
  const gameId = matchup.dataset.game;
  let nextMatchup, slotIndex;

  // Determine next matchup and slot
  if (gameId.startsWith('AFC')) {
    if (gameId.includes('D1') || gameId.includes('D2')) nextMatchup = document.querySelector('[data-game="AFC-Conf"]');
  }
  if (gameId.startsWith('NFC')) {
    if (gameId.includes('D1') || gameId.includes('D2')) nextMatchup = document.querySelector('[data-game="NFC-Conf"]');
  }
  if (gameId.includes('Conf')) nextMatchup = document.querySelector('[data-game="SB"]');

  if (!nextMatchup) return;

  const teamElements = Array.from(matchup.children).filter(t => t.dataset.team);
  teamElements.forEach(teamEl => {
    // Find the slot to fill in the next matchup
    if (!nextMatchup.children[0].textContent) slotIndex = 0;
    else if (!nextMatchup.children[1].textContent) slotIndex = 1;
    else return;

    const slot = nextMatchup.children[slotIndex];
    slot.textContent = teamEl.textContent;
    slot.dataset.team = teamEl.dataset.team;
    slot.dataset.seed = teamEl.dataset.seed;
  });
}

// Add click events
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => {
    const matchup = team.parentElement;
    matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    team.classList.add('selected');

    // Record winner for reseeding
    const conf = confMap[matchup.dataset.game];
    if (conf) {
      const seed = parseInt(team.dataset.seed);
      const name = team.textContent;

      // Remove previous selection from same matchup
      state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== matchup.dataset.game);

      state[conf].wildCard.push({ name, seed, game: matchup.dataset.game });
      updateDivisional(conf); // reseed Divisional live
    }

    // Propagate to next round if applicable
    propagateNextRound(matchup);
  });
});
