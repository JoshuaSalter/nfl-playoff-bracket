// ===============================
// FULL STATE
// ===============================
const state = {
  afc: { wildCard: [], divisional: [], conference: [null, null] },
  nfc: { wildCard: [], divisional: [], conference: [null, null] }
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
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  const first = firstSeed[conf];
  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t.name !== lowest.name);

  // --- DIV 1 ---
  const div1 = divMatchups[0];
  fillTeamSlot(div1.children[0], first);               // first seed always on top
  fillTeamSlot(div1.children[1], lowest || null);      // winner of first matchup
  // Ensure 2 children
  while (div1.children.length < 2) {
    const emptySlot = document.createElement('div');
    emptySlot.classList.add('team', 'empty');
    div1.appendChild(emptySlot);
  }

  // --- DIV 2 ---
  const div2 = divMatchups[1];
  fillTeamSlot(div2.children[0], remaining[0] || null);
  fillTeamSlot(div2.children[1], remaining[1] || null);
  while (div2.children.length < 2) {
    const emptySlot = document.createElement('div');
    emptySlot.classList.add('team', 'empty');
    div2.appendChild(emptySlot);
  }
}

// ===============================
// UPDATE CONFERENCE SLOT
// ===============================
function updateConferenceSlot(conf) {
  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  // Map divisional winners into conference slots
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  divMatchups.forEach((div, idx) => {
    const winnerEl = Array.from(div.children).find(c => c.classList.contains('selected'));
    const winner = winnerEl
      ? { name: winnerEl.dataset.team, seed: +winnerEl.dataset.seed, game: `D${idx + 1}` }
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
    backgroundColor: '#fff',  // keep white background
    useCORS: true,            // ✅ load external images (like SVGs)
    imageTimeout: 3000        // wait up to 3s for images to load
  }).then(canvas => {
    canvas.toBlob(async blob => {
      const file = new File([blob], 'NFL-Bracket-2026.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My 2026 NFL Bracket' });
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
