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

// Map divisional game to conference slot index
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
  if (winners.length === 0) return;

  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  const first = firstSeed[conf];
  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t.name !== lowest.name);

  // --- DIV 1 ---
  const div1 = divMatchups[0];
  if (!div1.children[0] || !div1.children[0].dataset.team) {
    div1.insertBefore(createTeamElement(first.name, first.seed, first.logo), div1.children[0] || null);
  }
  if (lowest) {
    if (div1.children[1]) {
      div1.replaceChild(createTeamElement(lowest.name, lowest.seed, `logos/${lowest.name.toLowerCase()}.svg`), div1.children[1]);
    } else div1.appendChild(createTeamElement(lowest.name, lowest.seed, `logos/${lowest.name.toLowerCase()}.svg`));
  }

  // --- DIV 2 ---
  const div2 = divMatchups[1];
  for (let i = 0; i < 2; i++) {
    const team = remaining[i];
    if (team) {
      if (div2.children[i]) {
        div2.replaceChild(createTeamElement(team.name, team.seed, `logos/${team.name.toLowerCase()}.svg`), div2.children[i]);
      } else div2.appendChild(createTeamElement(team.name, team.seed, `logos/${team.name.toLowerCase()}.svg`));
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

  const slotIndex = divisionalToConfSlot[divGameId];

  // Ensure state array has two slots
  if (!state[conf].conference[0]) state[conf].conference[0] = null;
  if (!state[conf].conference[1]) state[conf].conference[1] = null;

  // Update state and DOM slot
  state[conf].conference[slotIndex] = { ...winner, game: 'conference' };

  const slot = confMatchup.children[slotIndex] || document.createElement('div');
  slot.classList.add('team');
  confMatchup.appendChild(slot);
  fillTeamSlot(slot, winner);
}

// ===============================
// UPDATE SUPER BOWL
// ===============================
function updateSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  sb.innerHTML = '';

  const afcWinner = state.afc.conference[state.afc.conference.length - 1];
  const nfcWinner = state.nfc.conference[state.nfc.conference.length - 1];

  if (afcWinner) sb.appendChild(createTeamElement(afcWinner.name, afcWinner.seed, `logos/${afcWinner.name.toLowerCase()}.svg`));
  if (nfcWinner) sb.appendChild(createTeamElement(nfcWinner.name, nfcWinner.seed, `logos/${nfcWinner.name.toLowerCase()}.svg`));
}

// ===============================
// HANDLE TEAM CLICK
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
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, game: gameId };
    state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
    state[conf].wildCard.push(winner);
    updateDivisional(conf);
    return;
  }

  // --- Divisional ---
  if (gameId.includes('D')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, game: gameId };
    state[conf].divisional = state[conf].divisional.filter(t => t.game !== gameId);
    state[conf].divisional.push(winner);
    updateConferenceSlot(conf, gameId, winner);
    return;
  }

  // --- Conference ---
  if (gameId.includes('Conf')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, game: gameId };
    state[conf].conference = state[conf].conference.filter(t => t.game !== 'conference');
    state[conf].conference.push(winner);
    updateSuperBowl();
  }
}

// ===============================
// INITIALIZE TEAMS
// ===============================
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => handleTeamClick(team));
});

// ===============================
// SHARE BUTTON (IMAGE ONLY)
// ===============================
document.getElementById('share-btn').addEventListener('click', async () => {
  const bracketEl = document.getElementById('bracket');

  // Use html2canvas to render bracket as image
  html2canvas(bracketEl, { backgroundColor: '#fff' }).then(canvas => {
    canvas.toBlob(async blob => {
      const file = new File([blob], 'NFL-Bracket-2026.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My 2026 NFL Bracket'
          });
          console.log('Bracket shared successfully!');
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        // Fallback: download image
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
