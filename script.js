// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [],             // wildcard winners
    divisional: [null, null], // D1 and D2 winners
    conference: [null, null]  // Conf winners
  },
  nfc: {
    wildCard: [],
    divisional: [null, null],
    conference: [null, null]
  }
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
  const winners = [...state[conf].wildCard].sort((a,b)=>a.seed-b.seed);
  const divMatchups = conf==='afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  // Fill DIV1 top with lowest seed (better seed plays lower seed)
  fillTeamSlot(divMatchups[0].children[0], winners[0] || null);
  fillTeamSlot(divMatchups[0].children[1], winners[1] || null);

  // Fill DIV2
  fillTeamSlot(divMatchups[1].children[0], winners[2] || null);
  fillTeamSlot(divMatchups[1].children[1], winners[3] || null);
}

// ===============================
// UPDATE CONFERENCE MATCHUPS
// ===============================
function updateConference(conf) {
  const divMatchups = conf==='afc'
    ? [document.querySelector('[data-game="AFC-D1"]'), document.querySelector('[data-game="AFC-D2"]')]
    : [document.querySelector('[data-game="NFC-D1"]'), document.querySelector('[data-game="NFC-D2"]')];

  const confMatchup = conf==='afc'
    ? document.querySelector('[data-game="AFC-Conf"]')
    : document.querySelector('[data-game="NFC-Conf"]');

  divMatchups.forEach((div, idx)=>{
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

  // Deselect all in the matchup
  matchup.querySelectorAll('.team').forEach(t=>t.classList.remove('selected'));
  teamDiv.classList.add('selected');

  // Wild Card
  if (wildCardConfs[gameId]) {
    const winner = { name: teamDiv.dataset.team, seed: +teamDiv.dataset.seed };
    state[conf].wildCard = state[conf].wildCard.filter(t=>t && t.name !== winner.name);
    state[conf].wildCard.push(winner);
    updateDivisional(conf);
    return;
  }

  // Divisional
  if (gameId.includes('D')) {
    updateConference(conf);
    return;
  }

  // Conference
  if (gameId.includes('Conf')) {
    updateSuperBowl();
    return;
  }
}

// ===============================
// INITIALIZE TEAMS
// ===============================
document.querySelectorAll('.team').forEach(team=>{
  team.addEventListener('click', ()=>handleTeamClick(team));
});

// ===============================
// SHARE BUTTON
// ===============================
document.getElementById('share-btn').addEventListener('click', async ()=>{
  const bracketEl = document.getElementById('bracket');
  html2canvas(bracketEl, { backgroundColor:'#fff', useCORS:true, imageTimeout:3000 }).then(canvas=>{
    canvas.toBlob(async blob=>{
      const file = new File([blob],'NFL-Bracket-2026.png',{type:'image/png'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        try { await navigator.share({files:[file],title:'My 2026 NFL Bracket'}); } 
        catch(err){ console.error('Error sharing:',err); }
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download='NFL-Bracket-2026.png';
        link.click();
        URL.revokeObjectURL(link.href);
        alert('Bracket image downloaded! You can now share it.');
      }
    },'image/png');
  });
});
