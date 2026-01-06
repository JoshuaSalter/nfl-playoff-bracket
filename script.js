// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [],        // Wild Card winners
    divisional: [],      // Divisional matchups (including first seed)
    conference: null     // Conference winner
  },
  nfc: {
    wildCard: [],
    divisional: [],
    conference: null
  }
};

// ===============================
// FIRST SEED TEAMS
// ===============================
const firstSeed = {
  afc: { name: 'Broncos', seed: 1, logo: 'logos/broncos.svg' },
  nfc: { name: 'Seahawks', seed: 1, logo: 'logos/seahawks.svg' }
};

// ===============================
// HELPER FUNCTIONS
// ===============================
function createTeamElement(team) {
  const teamDiv = document.createElement('div');
  teamDiv.classList.add('team');
  if (!team) {
    teamDiv.classList.add('empty');
    return teamDiv;
  }

  teamDiv.dataset.team = team.name;
  teamDiv.dataset.seed = team.seed;

  const img = document.createElement('img');
  img.src = team.logo;
  img.alt = team.name;
  img.classList.add('logo');

  const span = document.createElement('span');
  span.textContent = `#${team.seed} ${team.name}`;

  teamDiv.append(img, span);
  teamDiv.addEventListener('click', () => handleTeamClick(teamDiv));
  return teamDiv;
}

// Fill a matchup slot with a team object
function fillTeamSlot(slot, team) {
  slot.innerHTML = '';
  slot.replaceWith(createTeamElement(team));
}

// ===============================
// WILD CARD → DIVISIONAL
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort((a, b) => a.seed - b.seed);

  const div1 = document.querySelector(`[data-game="${conf.toUpperCase()}-D1"]`);
  const div2 = document.querySelector(`[data-game="${conf.toUpperCase()}-D2"]`);

  // Automatically add first seed to DIV1 slot 0
  state[conf].divisional[0] = firstSeed[conf];
  state[conf].divisional[1] = winners[winners.length - 1] || null; // lowest seed plays first seed

  fillTeamSlot(div1.children[0], state[conf].divisional[0]);
  fillTeamSlot(div1.children[1], state[conf].divisional[1]);

  // Remaining two winners in DIV2
  const remaining = winners.filter(t => t !== state[conf].divisional[1]);
  state[conf].divisional[2] = remaining[0] || null;
  state[conf].divisional[3] = remaining[1] || null;

  fillTeamSlot(div2.children[0], remaining[0] || null);
  fillTeamSlot(div2.children[1], remaining[1] || null);
}

// ===============================
// DIVISIONAL → CONFERENCE
// ===============================
function updateConference(conf) {
  const div1 = document.querySelector(`[data-game="${conf.toUpperCase()}-D1"]`);
  const div2 = document.querySelector(`[data-game="${conf.toUpperCase()}-D2"]`);
  const confMatchup = document.querySelector(`[data-game="${conf.toUpperCase()}-Conf"]`);

  // Only propagate selected winners
  const winner1 = div1.querySelector('.team.selected');
  const winner2 = div2.querySelector('.team.selected');

  const teams = [
    winner1 ? { 
      name: winner1.dataset.team, 
      seed: +winner1.dataset.seed, 
      logo: winner1.querySelector('img')?.src 
    } : null,
    winner2 ? { 
      name: winner2.dataset.team, 
      seed: +winner2.dataset.seed, 
      logo: winner2.querySelector('img')?.src 
    } : null
  ];

  fillTeamSlot(confMatchup.children[0], teams[0]);
  fillTeamSlot(confMatchup.children[1], teams[1]);
}

// ===============================
// CONFERENCE → SUPER BOWL
// ===============================
function updateSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  const afcWinner = document.querySelector('[data-game="AFC-Conf"] .team.selected');
  const nfcWinner = document.querySelector('[data-game="NFC-Conf"] .team.selected');

  const teams = [
    afcWinner ? { 
      name: afcWinner.dataset.team, 
      seed: +afcWinner.dataset.seed, 
      logo: afcWinner.querySelector('img')?.src 
    } : null,
    nfcWinner ? { 
      name: nfcWinner.dataset.team, 
      seed: +nfcWinner.dataset.seed, 
      logo: nfcWinner.querySelector('img')?.src 
    } : null
  ];

  fillTeamSlot(sb.children[0], teams[0]);
  fillTeamSlot(sb.children[1], teams[1]);
}

// ===============================
// HANDLE TEAM CLICK
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.closest('.matchup');
  if (!matchup) return;

  // Deselect if already selected
  if (teamDiv.classList.contains('selected')) {
    teamDiv.classList.remove('selected');
  } else {
    matchup.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    teamDiv.classList.add('selected');
  }

  const gameId = matchup.dataset.game;

  // Wild Card winners
  if (gameId.includes('WC')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
    const winner = { 
      name: teamDiv.dataset.team, 
      seed: +teamDiv.dataset.seed, 
      logo: teamDiv.querySelector('img')?.src 
    };
    state[conf].wildCard = state[conf].wildCard.filter(t => t && t.name !== winner.name);
    state[conf].wildCard.push(winner);
    updateDivisional(conf);
  }

  // Divisional → Conference
  if (gameId.includes('-D')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';
    updateConference(conf);
  }

  // Conference → Super Bowl
  if (gameId.includes('Conf')) {
    updateSuperBowl();
  }
}

// ===============================
// INITIALIZE ALL EXISTING TEAMS
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
        catch(err){ console.error('Error sharing:', err); }
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
