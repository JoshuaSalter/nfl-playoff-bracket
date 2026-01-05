// State to track winners
const state = {
  afc: { wildCard: [], divisional: [], conference: [] },
  nfc: { wildCard: [], divisional: [], conference: [] }
};

// Helper: propagate winners to Divisional, Conference, Super Bowl
function propagate(matchup, selectedTeam) {
  const gameId = matchup.dataset.game;
  const conf = selectedTeam.dataset.team.startsWith('AFC') ? 'afc' : 'nfc';
  const seed = parseInt(selectedTeam.dataset.seed);
  const name = selectedTeam.textContent;

  // Wild Card
  if (gameId.includes('WC')) {
    state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
    state[conf].wildCard.push({ name, seed, game: gameId });

    if (state[conf].wildCard.length === 3) populateDivisional(conf);
    return;
  }

  // Divisional
  if (gameId.includes('D')) {
    state[conf].divisional = state[conf].divisional.filter(t => t.game !== gameId);
    state[conf].divisional.push({ name, seed, game: gameId });

    const divMatchups = Array.from(document.querySelectorAll(`[data-game^="${conf.toUpperCase()}-D"]`));
    const selectedTeams = divMatchups.map(m => m.querySelector('.team.selected')).filter(t=>t);
    if (selectedTeams.length === 2) populateConference(conf, selectedTeams);
    return;
  }

  // Conference -> Super Bowl
  if (gameId.includes('Conf')) {
    const sb = document.querySelector('[data-game="SB"]');
    if(sb.children[0].textContent==="") sb.children[0].textContent = name;
    else sb.children[1].textContent = name;
  }
}

// Populate Divisional with reseeding (#1 plays lowest seed)
function populateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort((a,b) => a.seed - b.seed);
  const byeSeed = conf === 'afc' ? { name: 'AFC 1', seed: 1 } : { name: 'NFC 1', seed: 1 };

  const lowest = winners.pop(); // lowest seed vs #1
  const nextMatchup1 = document.querySelector(`[data-game="${conf.toUpperCase()}-D1"]`);
  nextMatchup1.children[0].textContent = byeSeed.name;
  nextMatchup1.children[0].dataset.team = byeSeed.name.replace(' ','');
  nextMatchup1.children[0].dataset.seed = byeSeed.seed;
  nextMatchup1.children[1].textContent = lowest.name;
  nextMatchup1.children[1].dataset.team = lowest.name.replace(' ','');
  nextMatchup1.children[1].dataset.seed = lowest.seed;

  const nextMatchup2 = document.querySelector(`[data-game="${conf.toUpperCase()}-D2"]`);
  nextMatchup2.children[0].textContent = winners[0].name;
  nextMatchup2.children[0].dataset.team = winners[0].name.replace(' ','');
  nextMatchup2.children[0].dataset.seed = winners[0].seed;
  nextMatchup2.children[1].textContent = winners[1].name;
  nextMatchup2.children[1].dataset.team = winners[1].name.replace(' ','');
  nextMatchup2.children[1].dataset.seed = winners[1].seed;
}

// Populate Conference round
function populateConference(conf, selectedTeams) {
  const sorted = selectedTeams.sort((a,b)=>parseInt(a.dataset.seed)-parseInt(b.dataset.seed));
  const confMatchup = document.querySelector(`[data-game="${conf.toUpperCase()}-Conf"]`);
  confMatchup.children[0].textContent = sorted[0].textContent;
  confMatchup.children[0].dataset.team = sorted[0].dataset.team;
  confMatchup.children[0].dataset.seed = sorted[0].dataset.seed;
  confMatchup.children[1].textContent = sorted[1].textContent;
  confMatchup.children[1].dataset.team = sorted[1].dataset.team;
  confMatchup.children[1].dataset.seed = sorted[1].dataset.seed;
}

// Add click events to all teams
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => {
    const matchup = team.parentElement;
    matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    team.classList.add('selected');
    propagate(matchup, team);
  });
});
