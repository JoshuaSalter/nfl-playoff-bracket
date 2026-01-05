// ===============================
// FULL STATE
// ===============================
const state = {
  afc: { wildCard: [], divisional: [], conference: [null, null] },
  nfc: { wildCard: [], divisional: [], conference: [null, null] }
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

// Map divisional games to conference slots
const divisionalToConfSlot = {
  'AFC-D1': 0,
  'AFC-D2': 1,
  'NFC-D1': 0,
  'NFC-D2': 1
};

// ===============================
// HELPER FUNCTIONS
// ===============================
function sortBySeed(a, b) { return a.seed - b.seed; }

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

  teamDiv.append(img, span);
  teamDiv.addEventListener('click', () => handleTeamClick(teamDiv));
  return teamDiv;
}

// Fill a team slot with a team or mark empty
function fillTeamSlot(slot, team) {
  slot.innerHTML = '';
  if (!team) {
    slot.classList.add('empty');
    return;
  }
  slot.classList.remove('empty');
  slot.appendChild(createTeamElement(team.name, team.seed, `logos/${team.name.toLowerCase()}.svg`));
}

// ===============================
// UPDATE DIVISIONAL MATCHUPS
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort(sortBySeed);

  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // Get top-seeded team from existing DOM (preserve actual team name/logo)
  const firstSeedTeam = divMatchups[0].children[0].dataset.team
    ? { 
        name: divMatchups[0].children[0].dataset.team, 
        seed: +divMatchups[0].children[0].dataset.seed,
        game: divMatchups[0].dataset.game
      } 
    : null;

  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t.name !== (lowest ? lowest.name : ''));

  // --- DIV 1 ---
  fillTeamSlot(divMatchups[0].children[0], firstSeedTeam);
  fillTeamSlot(divMatchups[0].children[1], lowest || null);

  // --- DIV 2 ---
  fillTeamSlot(divMatchups[1].children[0], remaining[0] || null);
  fillTeamSlot(divMatchups[1].children[1], remaining[1] || null);
}

// ===============================
// UPDATE CONFERENCE MATCHUPS
// ===============================
function updateConferenceSlot(conf) {
  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  divMatchups.forEach((div, idx) => {
    // Take winner from divisional state if exists, else null
    const winner = state[conf].divisional.find(t => t && t.game === div.dataset.game) || null;
    state[conf].conference[idx] = winner;
    fillTeamSlot(confMatchup.children[idx], winner);
  });

  updateSuperBowl();
}

// ===============================
// UPDATE SUPER BOWL
// ===============================
function updateSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  sb.innerHTML = '';

  const afcWinner = state.afc.conference.find(t => t);
  const nfcWinner = state.nfc.conference.find(t => t);

  fillTeamSlot(sb.children[0], afcWinner || null);
  fillTeamSlot(sb.children[1], nfcWinner || null);
}

// ===============================
// HANDLE TEAM CLICK
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.closest('.matchup');
  if (!matchup || !matchup.dataset.game) return;

  const gameId = matchup.dataset.game;
  const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';

  // Highlight selection
  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, game: gameId };
    state[conf].wildCard = state[conf].wildCard.filter(t => t && t.game !== gameId);
    state[conf].wildCard.push(winner);

    updateDivisional(conf);       // update divisional matchups
    updateConferenceSlot(conf);   // update conference matchups
    return;
  }

  // --- Divisional ---
  if (gameId.includes('D')) {
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, game: gameId };
    state[conf].divisional = state[conf].divisional.filter(t => t && t.game !== gameId);
    state[conf].divisional.push(winner);

    updateConferenceSlot(conf);
    return;
  }

  // --- Conference ---
  if (gameId.includes('Conf')) {
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, game: gameId };
    state[conf].conference = state[conf].conference.map((t, idx) => t && t.game === gameId ? winner : t);

    updateSuperBowl();
    return;
  }
}

// ===============================
// INITIALIZE TEAMS
// ===============================
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => handleTeamClick(team));
});

// ===============================
// SHARE BUTTON (INCLUDES LOGOS)
// ===============================
document.getElementById('share-btn').addEventListener('click', async () => {
  const bracketEl = document.getElementById('bracket');

  html2canvas(bracketEl, { 
    backgroundColor: '#fff',
    useCORS: true,      // load external SVGs
    imageTimeout: 3000
  }).then(canvas => {
    canvas.toBlob(async blob => {
      const file = new File([blob], 'NFL-Bracket-2026.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My 2026 NFL Bracket' });
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = 'NFL-Bracket-2026.png';
        link.click();
        URL.revokeObjectURL(link.href);
        alert('Bracket image downloaded! You can now share it.');
      }
    }, 'image/png');
  });
});
