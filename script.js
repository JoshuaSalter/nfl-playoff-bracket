// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [],          // 3 winners from WC
    divisional: [null, null, null, null], // 1st seed + 3 winners
    conference: [null, null],            // 2 divisional winners
  },
  nfc: {
    wildCard: [],
    divisional: [null, null, null, null],
    conference: [null, null],
  },
  superBowl: [null, null] // [AFC winner, NFC winner]
};

// First seed teams for automatic placement
const firstSeed = {
  afc: { name: 'Broncos', seed: 1, logo: 'logos/broncos.svg' },
  nfc: { name: 'Seahawks', seed: 1, logo: 'logos/seahawks.svg' }
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
// CREATE TEAM ELEMENT
// ===============================
function fillTeamSlot(slot, team) {
  slot.innerHTML = '';
  slot.classList.add('empty');

  if (!team) return;

  const teamDiv = document.createElement('div');
  teamDiv.classList.add('team');
  teamDiv.dataset.team = team.name;
  teamDiv.dataset.seed = team.seed;

  const img = document.createElement('img');
  img.src = team.logo || `logos/${team.name.toLowerCase()}.svg`;
  img.alt = team.name;
  img.classList.add('logo');

  const span = document.createElement('span');
  span.textContent = `#${team.seed} ${team.name}`;

  teamDiv.append(img, span);
  slot.appendChild(teamDiv);
  slot.classList.remove('empty');

  teamDiv.addEventListener('click', () => handleTeamClick(slot, team));
}

// ===============================
// HANDLE TEAM CLICK
// ===============================
function handleTeamClick(slot, team) {
  const matchup = slot.parentElement;
  const gameId = matchup.dataset.game;

  // Ignore clicks on empty slots
  if (!team) return;

  const conf = gameId.startsWith('AFC') ? 'afc' : gameId.startsWith('NFC') ? 'nfc' : null;
  if (!conf) return;

  if (gameId.includes('WC')) updateWinner(state[conf].wildCard, team, 3);
  else if (gameId.includes('D')) updateWinner(state[conf].divisional, team, 4);
  else if (gameId.includes('Conf')) updateWinner(state[conf].conference, team, 2);

  recalcBracket();
}

// ===============================
// UPDATE WINNER HELPER
// ===============================
function updateWinner(array, team, max) {
  const index = array.findIndex(t => t && t.name === team.name);

  // If already selected, deselect
  if (index !== -1) {
    array[index] = null;
    return;
  }

  // Add to first available slot
  for (let i = 0; i < max; i++) {
    if (!array[i]) {
      array[i] = team;
      break;
    }
  }
}

// ===============================
// RECALCULATE FULL BRACKET
// ===============================
function recalcBracket() {
  ['afc','nfc'].forEach(conf => {
    // First seed always in Div1 slot0
    state[conf].divisional[0] = firstSeed[conf];

    // ----------------------
    // Wild Card → Divisional
    // ----------------------
    const wcWinners = state[conf].wildCard;
    const divMatchups = conf==='afc'
      ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
      : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

    // DIV1 = first seed vs lowest remaining winner
    const lowest = wcWinners[wcWinners.length-1] || null;
    fillTeamSlot(divMatchups[0].children[0], firstSeed[conf]);
    fillTeamSlot(divMatchups[0].children[1], lowest);

    const remaining = wcWinners.filter(t => t && t !== lowest);
    fillTeamSlot(divMatchups[1].children[0], remaining[0] || null);
    fillTeamSlot(divMatchups[1].children[1], remaining[1] || null);

    // ----------------------
    // Divisional → Conference
    // ----------------------
    const confMatchup = conf==='afc'
      ? document.querySelector('[data-game="AFC-Conf"]')
      : document.querySelector('[data-game="NFC-Conf"]');

    state[conf].conference.forEach((winner, idx) => {
      fillTeamSlot(confMatchup.children[idx], winner);
    });

    // ----------------------
    // Conference → Super Bowl
    // ----------------------
    if (conf==='afc') state.superBowl[0] = state[conf].conference[0] || null;
    else state.superBowl[1] = state[conf].conference[0] || null;
  });

  const sb = document.querySelector('[data-game="SB"]');
  fillTeamSlot(sb.children[0], state.superBowl[0]);
  fillTeamSlot(sb.children[1], state.superBowl[1]);
}

// ===============================
// INITIALIZE EXISTING TEAMS
// ===============================
document.querySelectorAll('.team').forEach(team => {
  const name = team.dataset.team;
  const seed = parseInt(team.dataset.seed);
  const logo = team.dataset.logo;
  if (!name) return;
  fillTeamSlot(team, { name, seed, logo });
});

// ===============================
// SHARE BUTTON
// ===============================
document.getElementById('share-btn').addEventListener('click', async () => {
  const bracketEl = document.getElementById('bracket');
  html2canvas(bracketEl, { backgroundColor: '#fff', useCORS: true, imageTimeout: 3000 }).then(canvas => {
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
