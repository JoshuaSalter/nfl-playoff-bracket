// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [],             // array of wildcard winners (objects)
    divisional: [null, null], // slot 0 = D1 winner, slot 1 = D2 winner
    conference: [null, null]  // slot 0 = Conf winner from D1, slot 1 = Conf winner from D2
  },
  nfc: {
    wildCard: [],
    divisional: [null, null],
    conference: [null, null]
  }
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
  const winners = [...state[conf].wildCard];
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // Fill first seed in DIV1 top slot
  fillTeamSlot(divMatchups[0].children[0], firstSeed[conf]);

  // Sort wildcard winners by seed ascending
  winners.sort((a, b) => a.seed - b.seed);

  // Place lowest-seeded winner with first seed in DIV1
  fillTeamSlot(divMatchups[0].children[1], winners[winners.length - 1] || null);

  // Place remaining winners in DIV2
  fillTeamSlot(divMatchups[1].children[0], winners[0] || null);
  fillTeamSlot(divMatchups[1].children[1], winners[1] || null);
}

// ===============================
// UPDATE CONFERENCE MATCHUPS
// ===============================
function updateConferenceSlot(conf) {
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  divMatchups.forEach((div, idx) => {
    const winnerEl = Array.from(div.children).find(c => c.classList.contains('selected'));
    const winner = winnerEl
      ? { name: winnerEl.dataset.team, seed: +winnerEl.dataset.seed }
      : null;

    state[conf].conference[idx] = winner || null;
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

  // Deselect other teams in the matchup
  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, game: gameId };
    state[conf].wildCard = state[conf].wildCard.filter(t => t && t.game !== gameId);
    state[conf].wildCard.push(winner);
    updateDivisional(conf);
    return;
  }

  // --- Divisional ---
  if (gameId.includes('D')) {
    updateConferenceSlot(conf);
    return;
  }

  // --- Conference ---
  if (gameId.includes('Conf')) {
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
// SHARE BUTTON
// ===============================
document.getElementById('share-btn').addEventListener('click', async () => {
  const bracketEl = document.getElementById('bracket');

  html2canvas(bracketEl, { 
    backgroundColor: '#fff', 
    useCORS: true,      // ✅ load external images (logos)
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
