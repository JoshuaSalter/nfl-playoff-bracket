// ===============================
// FULL STATE
// ===============================
const state = {
  afc: { wildCard: [], divisional: [], conference: [] },
  nfc: { wildCard: [], divisional: [], conference: [] }
};

// First seeds
const firstSeed = {
  afc: { name: 'Broncos', seed: 1, logo: 'logos/broncos.svg' },
  nfc: { name: 'Seahawks', seed: 1, logo: 'logos/seahawks.svg' }
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

function createTeamElement(name, seed, logoPath) {
  const teamDiv = document.createElement('div');
  teamDiv.className = 'team';
  teamDiv.dataset.team = name;
  teamDiv.dataset.seed = seed;

  const img = document.createElement('img');
  img.src = logoPath;
  img.alt = name;

  const span = document.createElement('span');
  span.textContent = `#${seed} ${name}`;

  teamDiv.append(img, span);
  teamDiv.addEventListener('click', () => handleTeamClick(teamDiv));

  return teamDiv;
}

// ===============================
// UPDATE DIVISIONAL
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort(sortBySeed);
  if (winners.length === 0) return;

  const div1 = document.querySelector(`[data-game="${conf.toUpperCase()}-D1"]`);
  const div2 = document.querySelector(`[data-game="${conf.toUpperCase()}-D2"]`);

  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t !== lowest);

  // Clear slots except first seed
  div1.children[1].replaceWith(
    createTeamElement(lowest.name, lowest.seed, `logos/${lowest.name.toLowerCase()}.svg`)
  );

  div2.innerHTML = '';
  remaining.forEach(t =>
    div2.appendChild(
      createTeamElement(t.name, t.seed, `logos/${t.name.toLowerCase()}.svg`)
    )
  );
}

// ===============================
// UPDATE CONFERENCE
// ===============================
function updateConferenceSlot(conf, gameId, winner) {
  const matchup = document.querySelector(
    `[data-game="${conf.toUpperCase()}-Conf"]`
  );

  const index =
    (conf === 'afc' && gameId === 'AFC-D1') ||
    (conf === 'nfc' && gameId === 'NFC-D1')
      ? 0
      : 1;

  matchup.children[index].replaceWith(
    createTeamElement(
      winner.name,
      winner.seed,
      `logos/${winner.name.toLowerCase()}.svg`
    )
  );

  state[conf].conference = [{ ...winner }];
}

// ===============================
// UPDATE SUPER BOWL (SAFE)
// ===============================
function updateSuperBowl() {
  if (!state.afc.conference[0] || !state.nfc.conference[0]) return;

  const sb = document.querySelector('[data-game="SB"]');
  sb.innerHTML = '';

  ['afc', 'nfc'].forEach(conf => {
    const t = state[conf].conference[0];
    sb.appendChild(
      createTeamElement(t.name, t.seed, `logos/${t.name.toLowerCase()}.svg`)
    );
  });
}

// ===============================
// CLICK HANDLER
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.closest('.matchup');
  if (!matchup || !matchup.dataset.game) return;

  const gameId = matchup.dataset.game;

  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const conf = wildCardConfs[gameId];
    state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
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
document.querySelectorAll('.team').forEach(t =>
  t.addEventListener('click', () => handleTeamClick(t))
);
