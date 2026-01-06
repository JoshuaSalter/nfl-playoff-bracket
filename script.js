// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCardMatchups: [
      [
        { name: 'Patriots', seed: 2, logo: 'logos/patriots.svg' },
        { name: 'Chargers', seed: 7, logo: 'logos/chargers.svg' }
      ],
      [
        { name: 'Jaguars', seed: 3, logo: 'logos/jaguars.svg' },
        { name: 'Bills', seed: 6, logo: 'logos/bills.svg' }
      ],
      [
        { name: 'Steelers', seed: 4, logo: 'logos/steelers.svg' },
        { name: 'Texans', seed: 5, logo: 'logos/texans.svg' }
      ]
    ],
    wildCard: [],
    divisionalMatchups: [ [null, null], [null, null] ],
    divisional: [],
    conference: [null, null]
  },
  nfc: {
    wildCardMatchups: [
      [
        { name: 'Cowboys', seed: 2, logo: 'logos/cowboys.svg' },
        { name: 'Vikings', seed: 7, logo: 'logos/vikings.svg' }
      ],
      [
        { name: 'Buccaneers', seed: 3, logo: 'logos/buccaneers.svg' },
        { name: 'Rams', seed: 6, logo: 'logos/rams.svg' }
      ],
      [
        { name: 'Packers', seed: 4, logo: 'logos/packers.svg' },
        { name: '49ers', seed: 5, logo: 'logos/49ers.svg' }
      ]
    ],
    wildCard: [],
    divisionalMatchups: [ [null, null], [null, null] ],
    divisional: [],
    conference: [null, null]
  },
  superBowl: [null, null] // [AFC winner, NFC winner]
};

// Define your first seeds
const firstSeed = {
  afc: { name: 'Broncos', seed: 1, logo: 'logos/broncos.svg' },
  nfc: { name: 'Seahawks', seed: 1, logo: 'logos/seahawks.svg' }
};

// ===============================
// HELPER FUNCTIONS
// ===============================
function createTeamElement(team) {
  if (!team) return null;

  const div = document.createElement('div');
  div.classList.add('team');
  div.dataset.team = team.name;
  div.dataset.seed = team.seed;

  const img = document.createElement('img');
  img.src = team.logo;
  img.alt = team.name;
  img.classList.add('logo');

  const span = document.createElement('span');
  span.textContent = `#${team.seed} ${team.name}`;

  div.append(img, span);
  div.addEventListener('click', () => handleTeamClick(div));
  return div;
}

function fillTeamSlot(slot, team) {
  slot.innerHTML = '';
  if (!team) {
    slot.classList.add('empty');
    return;
  }
  slot.classList.remove('empty');
  slot.appendChild(createTeamElement(team));
}

// ===============================
// RENDER ROUNDS
// ===============================
function renderRound(conf) {
  // Wild Card → Divisional mapping
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // DIV1: First seed vs lowest winner
  const winners = state[conf].wildCard.filter(Boolean).sort((a, b) => a.seed - b.seed);
  const lowest = winners[winners.length - 1] || null;

  state[conf].divisionalMatchups[0][0] = firstSeed[conf];
  state[conf].divisionalMatchups[0][1] = lowest;

  fillTeamSlot(divMatchups[0].children[0], firstSeed[conf]);
  fillTeamSlot(divMatchups[0].children[1], lowest);

  // DIV2: remaining winners
  const remaining = winners.filter(t => t !== lowest);
  state[conf].divisionalMatchups[1][0] = remaining[0] || null;
  state[conf].divisionalMatchups[1][1] = remaining[1] || null;

  fillTeamSlot(divMatchups[1].children[0], remaining[0] || null);
  fillTeamSlot(divMatchups[1].children[1], remaining[1] || null);
}

function renderConference(conf) {
  const divMatchups = conf === 'afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  const confMatchup = conf === 'afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  divMatchups.forEach((div, idx) => {
    const selected = Array.from(div.children).find(c => c.classList.contains('selected'));
    const winner = selected ? {
      name: selected.dataset.team,
      seed: +selected.dataset.seed,
      logo: selected.querySelector('img').src
    } : null;

    state[conf].conference[idx] = winner;
    fillTeamSlot(confMatchup.children[idx], winner);

    // Update super bowl
    state.superBowl[conf === 'afc' ? 0 : 1] = winner;
  });
}

function renderSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  sb.innerHTML = '';
  fillTeamSlot(sb.children[0], state.superBowl[0]);
  fillTeamSlot(sb.children[1], state.superBowl[1]);
}

// ===============================
// CLICK HANDLER
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.closest('.matchup');
  if (!matchup || !matchup.dataset.game) return;

  // Remove previous selection
  matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  const team = {
    name: teamDiv.dataset.team,
    seed: +teamDiv.dataset.seed,
    logo: teamDiv.querySelector('img').src
  };

  const gameId = matchup.dataset.game;
  const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';

  // Wild Card
  if (gameId.includes('WC')) {
    const idx = parseInt(gameId.slice(-1)) - 1;
    state[conf].wildCard[idx] = team;
    renderRound(conf);
    renderConference(conf);
    renderSuperBowl();
    return;
  }

  // Divisional
  if (gameId.includes('D')) {
    const idx = parseInt(gameId.slice(-1)) - 1;
    state[conf].divisional[idx] = team;
    renderConference(conf);
    renderSuperBowl();
    return;
  }

  // Conference
  if (gameId.includes('Conf')) {
    const idx = parseInt(gameId.slice(-1)) - 1;
    state[conf].conference[idx] = team;
    state.superBowl[conf === 'afc' ? 0 : 1] = team;
    renderSuperBowl();
    return;
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
