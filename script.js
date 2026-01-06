// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [],       // Wild Card winners
    divisional: [],     // Divisional round teams
    conference: [null, null] // Conference winners
  },
  nfc: {
    wildCard: [],
    divisional: [],
    conference: [null, null]
  }
};

// Define first seeds
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

  const img = document.createElement('img');
  img.src = logoPath;
  img.alt = name;
  img.classList.add('logo');

  const span = document.createElement('span');
  span.textContent = `#${seed} ${name}`;

  teamDiv.append(img, span);

  // Click handler
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
  slot.appendChild(createTeamElement(team.name, team.seed, team.logo || `logos/${team.name.toLowerCase()}.svg`));
}

// ===============================
// UPDATE DIVISIONAL MATCHUPS
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort((a, b) => a.seed - b.seed);
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  if (winners.length === 0) return;

  // Divisional: First seed always in top slot
  state[conf].divisional[0] = firstSeed[conf];
  const lowest = winners[winners.length - 1] || null;
  state[conf].divisional[1] = lowest;

  fillTeamSlot(divMatchups[0].children[0], firstSeed[conf]);
  fillTeamSlot(divMatchups[0].children[1], lowest);

  // Remaining two winners go to DIV2
  const remaining = winners.filter(t => t !== lowest);
  state[conf].divisional[2] = remaining[0] || null;
  state[conf].divisional[3] = remaining[1] || null;

  fillTeamSlot(divMatchups[1].children[0], remaining[0] || null);
  fillTeamSlot(divMatchups[1].children[1], remaining[1] || null);
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
    const winner = winnerEl
      ? { name: winnerEl.dataset.team, seed: +winnerEl.dataset.seed, logo: winnerEl.querySelector('img').src }
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

  // Deselect other teams in matchup
  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed, logo: teamDiv.querySelector('img').src };
    state[conf].wildCard = state[conf].wildCard.filter(t => t && t.name !== winner.name);
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
