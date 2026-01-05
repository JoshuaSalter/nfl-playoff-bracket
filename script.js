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

  const first = firstSeed[conf];
  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t.name !== lowest.name);

  // --- DIV 1: first seed vs lowest ---
  const div1 = divMatchups[0];

  // FIRST SEED: preserve if already exists
  if (!div1.children[0] || !div1.children[0].dataset.team) {
    div1.insertBefore(
      createTeamElement(first.name, first.seed, first.logo),
      div1.children[0] || null
    );
  }

  // LOWEST SEED: update or insert
  if (lowest) {
    if (div1.children[1]) {
      div1.replaceChild(
        createTeamElement(lowest.name, lowest.seed, `logos/${lowest.name.toLowerCase()}.svg`),
        div1.children[1]
      );
    } else {
      div1.appendChild(
        createTeamElement(lowest.name, lowest.seed, `logos/${lowest.name.toLowerCase()}.svg`)
      );
    }
  }

  // --- DIV 2: remaining two teams ---
  const div2 = divMatchups[1];

  // Only update children that exist, append new as needed
  for (let i = 0; i < 2; i++) {
    const team = remaining[i];
    if (team) {
      if (div2.children[i]) {
        div2.replaceChild(
          createTeamElement(team.name, team.seed, `logos/${team.name.toLowerCase()}.svg`),
          div2.children[i]
        );
      } else {
        div2.appendChild(
          createTeamElement(team.name, team.seed, `logos/${team.name.toLowerCase()}.svg`)
        );
      }
    }
  }
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
