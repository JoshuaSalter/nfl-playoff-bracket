// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [null, null, null],     // winners of WC1, WC2, WC3
    divisional: [null, null, null, null], // D1 & D2 teams
    conference: [null, null]          // conference winners
  },
  nfc: {
    wildCard: [null, null, null],
    divisional: [null, null, null, null],
    conference: [null, null]
  }
};

// First seed teams
const firstSeed = {
  afc: { name: 'Broncos', seed: 1, logo: 'logos/broncos.svg' },
  nfc: { name: 'Seahawks', seed: 1, logo: 'logos/seahawks.svg' }
};

// Map Wild Card games to conference + index
const wildCardConfs = {
  'AFC-WC1': { conf: 'afc', idx: 0 },
  'AFC-WC2': { conf: 'afc', idx: 1 },
  'AFC-WC3': { conf: 'afc', idx: 2 },
  'NFC-WC1': { conf: 'nfc', idx: 0 },
  'NFC-WC2': { conf: 'nfc', idx: 1 },
  'NFC-WC3': { conf: 'nfc', idx: 2 }
};

// ===============================
// HELPER FUNCTIONS
// ===============================
function createTeamElement(name, seed, logoPath) {
  const teamDiv = document.createElement('div');
  teamDiv.classList.add('team');
  if (!name) teamDiv.classList.add('empty');

  teamDiv.dataset.team = name || '';
  teamDiv.dataset.seed = seed || '';
  teamDiv.dataset.logo = logoPath || '';

  const img = document.createElement('img');
  img.classList.add('logo');
  img.src = logoPath || '';
  img.alt = name || '';

  const span = document.createElement('span');
  span.textContent = name ? `#${seed} ${name}` : '';

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
  slot.appendChild(createTeamElement(team.name, team.seed, team.logo));
}

// ===============================
// UPDATE DIVISIONAL MATCHUPS
// ===============================
function updateDivisional(conf) {
  const wc = state[conf].wildCard.filter(t => t); // remove nulls
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // Always include first seed in DIV1
  state[conf].divisional[0] = firstSeed[conf];

  if (wc.length === 0) {
    // Clear divisional slots if no winners
    state[conf].divisional[1] = null;
    state[conf].divisional[2] = null;
    state[conf].divisional[3] = null;
  } else {
    // DIV1: First seed vs lowest remaining seed
    const lowest = wc.reduce((prev, curr) => prev.seed > curr.seed ? prev : curr);
    state[conf].divisional[1] = lowest;

    // DIV2: other two remaining
    const remaining = wc.filter(t => t !== lowest);
    state[conf].divisional[2] = remaining[0] || null;
    state[conf].divisional[3] = remaining[1] || null;
  }

  // Render
  fillTeamSlot(divMatchups[0].children[0], state[conf].divisional[0]);
  fillTeamSlot(divMatchups[0].children[1], state[conf].divisional[1]);
  fillTeamSlot(divMatchups[1].children[0], state[conf].divisional[2]);
  fillTeamSlot(divMatchups[1].children[1], state[conf].divisional[3]);
}

// ===============================
// UPDATE CONFERENCE MATCHUPS
// ===============================
function updateConference(conf) {
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  divMatchups.forEach((div, idx) => {
    const winnerEl = Array.from(div.children).find(c => c.classList.contains('selected'));
    const winner = winnerEl && winnerEl.dataset.team
      ? { name: winnerEl.dataset.team, seed: +winnerEl.dataset.seed, logo: winnerEl.dataset.logo }
      : null;

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

  if (!sb.children[0] || !sb.children[1]) return;

  fillTeamSlot(sb.children[0], state.afc.conference[0]);
  fillTeamSlot(sb.children[1], state.nfc.conference[0]);
}

// ===============================
// HANDLE TEAM CLICK
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.closest('.matchup');
  if (!matchup || !matchup.dataset.game) return;

  const gameId = matchup.dataset.game;

  // Deselect if clicking the same team
  if (teamDiv.classList.contains('selected')) {
    teamDiv.classList.remove('selected');
    updateMatchState(gameId, null);
    return;
  }

  // Remove selection from other teams in this matchup
  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  updateMatchState(gameId, {
    name: teamDiv.dataset.team,
    seed: +teamDiv.dataset.seed,
    logo: teamDiv.dataset.logo
  });
}

// ===============================
// UPDATE STATE BASED ON MATCH ID
// ===============================
function updateMatchState(gameId, winner) {
  if (wildCardConfs[gameId]) {
    const { conf, idx } = wildCardConfs[gameId];
    state[conf].wildCard[idx] = winner;
    updateDivisional(conf);
  } else if (gameId.includes('-D')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
    updateConference(conf);
  } else if (gameId.includes('Conf')) {
    updateSuperBowl();
  }
}

// ===============================
// INITIALIZE EXISTING TEAMS
// ===============================
document.querySelectorAll('.team').forEach(team => {
  team.addEventListener('click', () => handleTeamClick(team));
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
        try { await navigator.share({ files: [file], title: 'My 2026 NFL Bracket' }); }
        catch (err) { console.error('Error sharing:', err); }
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
