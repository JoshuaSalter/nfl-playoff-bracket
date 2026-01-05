<script>
// Track winners for reseeding
const state = {
  afc: { wildCard: [], divisional: [], conference: [] },
  nfc: { wildCard: [], divisional: [], conference: [] }
};

// Function to propagate winner to next round and update state
function propagateWinner(matchup, selectedTeam) {
  const gameId = matchup.dataset.game;
  const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
  const seed = parseInt(selectedTeam.dataset.seed);

  // Update state for the current round
  if (!gameId.includes('D') && !gameId.includes('Conf') && gameId !== 'SB') {
    // Wild Card
    state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
    state[conf].wildCard.push({ name: selectedTeam.textContent, seed, game: gameId });
  } else if (gameId.includes('D')) {
    state[conf].divisional = state[conf].divisional.filter(t => t.game !== gameId);
    state[conf].divisional.push({ name: selectedTeam.textContent, seed, game: gameId });
  } else if (gameId.includes('Conf')) {
    state[conf].conference = state[conf].conference.filter(t => t.game !== gameId);
    state[conf].conference.push({ name: selectedTeam.textContent, seed, game: gameId });
  }

  // Determine next matchup
  let nextMatchup, slotIndex;
  if (conf === 'AFC') {
    if (['AFC1','AFC2'].includes(gameId)) nextMatchup = document.querySelector('[data-game="AFC-D1"]');
    else if (['AFC3','AFC4'].includes(gameId)) nextMatchup = document.querySelector('[data-game="AFC-D2"]');
    else if (['AFC-D1','AFC-D2'].includes(gameId)) nextMatchup = document.querySelector('[data-game="AFC-Conf"]');
  } else {
    if (['NFC1','NFC2'].includes(gameId)) nextMatchup = document.querySelector('[data-game="NFC-D1"]');
    else if (['NFC3','NFC4','NFC5','NFC6'].includes(gameId)) nextMatchup = document.querySelector('[data-game="NFC-D2"]');
    else if (['NFC-D1','NFC-D2'].includes(gameId)) nextMatchup = document.querySelector('[data-game="NFC-Conf"]');
  }

  if (gameId.includes('Conf')) nextMatchup = document.querySelector('[data-game="SB"]');
  if (!nextMatchup) return;

  // Fill the slot in the next matchup
  slotIndex = determineSlotIndex(gameId, nextMatchup, conf);
  const slot = nextMatchup.children[slotIndex];
  slot.textContent = selectedTeam.textContent;
  slot.dataset.team = selectedTeam.dataset.team;
  slot.dataset.seed = seed;

  // After filling both teams in Divisional or Conference, reseed
  if ((nextMatchup.dataset.game.includes('D') || nextMatchup.dataset.game.includes('Conf')) &&
      nextMatchup.children[0].textContent && nextMatchup.children[1].textContent) {
    reseedMatchup(nextMatchup);
  }

  // Update Super Bowl automatically when both Conference winners are selected
  if (nextMatchup.dataset.game === 'SB') {
    const sbSlot = nextMatchup;
    const afcWinner = document.querySelector('[data-game="AFC-Conf"] .team.selected');
    const nfcWinner = document.querySelector('[data-game="NFC-Conf"] .team.selected');
    if (afcWinner) sbSlot.children[0].textContent = afcWinner.textContent;
    if (nfcWinner) sbSlot.children[1].textContent = nfcWinner.textContent;
  }
}

// Determine which slot in the next matchup to fill
function determineSlotIndex(gameId, nextMatchup, conf) {
  const firstTeam = nextMatchup.children[0];
  return firstTeam.textContent ? 1 : 0;
}

// Reseed a matchup: lowest seed goes to top, highest seed goes to bottom
function reseedMatchup(matchupSlot) {
  const teams = Array.from(matchupSlot.children);
  const sorted = teams
    .map(t => ({ name: t.textContent, seed: parseInt(t.dataset.seed), el: t }))
    .sort((a, b) => a.seed - b.seed);

  teams[0].textContent = sorted[0].name;
  teams[0].dataset.seed = sorted[0].seed;
  teams[1].textContent = sorted[1].name;
  teams[1].dataset.seed = sorted[1].seed;

  // Highlight the top seed as default
  teams.forEach(t => t.classList.remove('selected'));
  teams[0].classList.add('selected');
}

// Add click events to all teams
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => {
    const matchup = team.parentElement;
    matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    team.classList.add('selected');
    propagateWinner(matchup, team);
  });
});
</script>
