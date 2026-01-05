// Track winners for reseeding
const state = {
  afc: { wildCard: [], divisional: [] },
  nfc: { wildCard: [], divisional: [] }
};

// Map wildcard games to conference
const confMap = {
  'AFC-WC1': 'afc',
  'AFC-WC2': 'afc',
  'AFC-WC3': 'afc',
  'NFC-WC1': 'nfc',
  'NFC-WC2': 'nfc',
  'NFC-WC3': 'nfc'
};

// 1st seeds for each conference (automatically in Divisional round)
const firstSeed = {
  afc: { name: 'AFC1', seed: 1 },
  nfc: { name: 'NFC1', seed: 1 }
};

// Update Divisional round with reseeding
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort((a, b) => a.seed - b.seed);
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // Clear slots first
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
  const lowest = winners[winners.length - 1]; // highest seed number = lowest rank

  // First seed always plays lowest-seeded winner
  divMatchups[0].children[0].textContent = first.name;
  divMatchups[0].children[0].dataset.team = first.name;
  divMatchups[0].children[0].dataset.seed = first.seed;
  divMatchups[0].children[0].dataset.firstSeed = true; // mark as first seed

  divMatchups[0].children[1].textContent = lowest.name;
  divMatchups[0].children[1].dataset.team = lowest.name;
  divMatchups[0].children[1].dataset.seed = lowest.seed;

  // Remaining two teams (if any) go to second Divisional matchup
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

// Propagate winner to next round (Divisional → Conference → Super Bowl)
function propagateNextRound(matchup) {
  const gameId = matchup.dataset.game;
  let nextMatchup, slotIndex;

  if (gameId.startsWith('AFC')) {
    if (gameId.includes('D1') || gameId.includes('D2')) nextMatchup = document.querySelector('[data-game="AFC-Conf"]');
  }
  if (gameId.startsWith('NFC')) {
    if (gameId.includes('D1') || gameId.includes('D2')) nextMatchup = document.querySelector('[data-game="NFC-Conf"]');
  }
  if (gameId.includes('Conf')) nextMatchup = document.querySelector('[data-game="SB"]');

  if (!nextMatchup) return;

  const selectedTeam = matchup.querySelector('.team.selected');
  if (!selectedTeam) return;

  // Determine which slot to fill
  if (!nextMatchup.children[0].textContent) slotIndex = 0;
  else if (!nextMatchup.children[1].textContent) slotIndex = 1;
  else return;

  const slot = nextMatchup.children[slotIndex];
  slot.textContent = selectedTeam.textContent;
  slot.dataset.team = selectedTeam.dataset.team;
  slot.dataset.seed = selectedTeam.dataset.seed;
}

// Add click events to all teams
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => {
    const matchup = team.parentElement;

    // Highlight selected team
    matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    team.classList.add('selected');

    // Record winner for reseeding if Wild Card
    const conf = confMap[matchup.dataset.game];
    if (conf) {
      const seed = parseInt(team.dataset.seed);
      const name = team.textContent;

      // Remove previous selection from same matchup
      state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== matchup.dataset.game);
      state[conf].wildCard.push({ name, seed, game: matchup.dataset.game });

      updateDivisional(conf); // reseed Divisional live
    }

    // Propagate winner to next round
    propagateNextRound(matchup);
  });
});
