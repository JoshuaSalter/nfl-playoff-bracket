// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [],             // Wild Card winners
    divisional: [null, null, null, null], // Divisional slots: [DIV1-Team1, DIV1-Team2, DIV2-Team1, DIV2-Team2]
    conference: [null, null]  // Conference winners
  },
  nfc: {
    wildCard: [],
    divisional: [null, null, null, null],
    conference: [null, null]
  }
};

// Define first seed teams
const firstSeed = {
  afc: { name: 'Broncos', seed: 1, logo: 'logos/broncos.svg' },
  nfc: { name: 'Seahawks', seed: 1, logo: 'logos/seahawks.svg' }
};

// Map Wild Card games to conferences
const wildCardConfs = {
  'AFC-WC1': 'afc', 'AFC-WC2': 'afc', 'AFC-WC3': 'afc',
  'NFC-WC1': 'nfc', 'NFC-WC2': 'nfc', 'NFC-WC3': 'nfc'
};

// ===============================
// HELPER FUNCTIONS
// ===============================
function createTeamElement(name, seed, logoPath) {
  const teamDiv = document.createElement('div');
  teamDiv.classList.add('team');
  teamDiv.dataset.team = name;
  teamDiv.dataset.seed = seed;
  teamDiv.dataset.logo = logoPath;

  const img = document.createElement('img');
  img.src = logoPath;
  img.alt = name;
  img.classList.add('logo');

  const span = document.createElement('span');
  span.textContent = `#${seed} ${name}`;

  teamDiv.append(img, span);

  // Add click handling
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
// UPDATE DIVISIONAL
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort((a, b) => a.seed - b.seed);
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // --- DIV1: First seed vs lowest Wild Card winner ---
  const lowest = winners[winners.length - 1] || null;
  state[conf].divisional[0] = firstSeed[conf]; // first seed always in slot0
  state[conf].divisional[1] = lowest;

  fillTeamSlot(divMatchups[0].children[0], firstSeed[conf]);
  fillTeamSlot(divMatchups[0].children[1], lowest);

  // --- DIV2: remaining winners ---
  const remaining = winners.filter(t => t !== lowest);
  state[conf].divisional[2] = remaining[0] || null;
  state[conf].divisional[3] = remaining[1] || null;

  fillTeamSlot(divMatchups[1].children[0], remaining[0] || null);
  fillTeamSlot(divMatchups[1].children[1], remaining[1] || null);
}

// ===============================
// UPDATE CONFERENCE
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
    const winner = winnerEl
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
  sb.innerHTML = '';

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
  const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';

  // Toggle selection (deselect if already selected)
  if (teamDiv.classList.contains('selected')) {
    teamDiv.classList.remove('selected');
    // Remove from state if wild card
    if (wildCardConfs[gameId]) {
      state[conf].wildCard = state[conf].wildCard.filter(t => t.name !== teamDiv.dataset.team);
      updateDivisional(conf);
    } else if (gameId.includes('D')) {
      updateConference(conf);
    } else if (gameId.includes('Conf')) {
      state[conf].conference = state[conf].conference.map(t => t && t.name === teamDiv.dataset.team ? null : t);
      updateSuperBowl();
    }
    return;
  }

  // Select team
  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, logo: teamDiv.dataset.logo };
    state[conf].wildCard = state[conf].wildCard.filter(t => t.name !== winner.name);
    state[conf].wildCard.push(winner);
    updateDivisional(conf);
    return;
  }

  // --- Divisional ---
  if (gameId.includes('D')) {
    updateConference(conf);
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
