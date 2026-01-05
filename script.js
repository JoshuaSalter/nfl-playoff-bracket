// ===============================
// FULL STATE
// ===============================
const state = {
  afc: { wildCard: [], conference: [] },
  nfc: { wildCard: [], conference: [] }
};

// First seeds
const firstSeed = {
  afc: { name: 'Broncos', seed: 1 },
  nfc: { name: 'Seahawks', seed: 1 }
};

// Wild Card → Conference map
const wildCardConfs = {
  'AFC-WC1': 'afc',
  'AFC-WC2': 'afc',
  'AFC-WC3': 'afc',
  'NFC-WC1': 'nfc',
  'NFC-WC2': 'nfc',
  'NFC-WC3': 'nfc'
};

// ===============================
// HELPERS
// ===============================
const sortBySeed = (a, b) => a.seed - b.seed;

function createTeamElement(name, seed) {
  const team = document.createElement('div');
  team.classList.add('team');
  team.dataset.team = name;
  team.dataset.seed = seed;

  const img = document.createElement('img');
  img.src = `logos/${name.toLowerCase()}.svg`;
  img.alt = name;

  const span = document.createElement('span');
  span.textContent = `#${seed} ${name}`;

  team.append(img, span);
  team.addEventListener('click', () => handleTeamClick(team));

  return team;
}

function fillTeamSlot(slot, team) {
  slot.innerHTML = '';

  if (!team) {
    slot.classList.add('empty');
    return;
  }

  slot.classList.remove('empty');
  slot.appendChild(createTeamElement(team.name, team.seed));
}

// ===============================
// UPDATE DIVISIONAL (SAFE)
// ===============================
function updateDivisional(conf) {
  const winners = [...state[conf].wildCard].sort(sortBySeed);
  if (winners.length === 0) return;

  const div1 = document.querySelector(`[data-game="${conf.toUpperCase()}-D1"]`);
  const div2 = document.querySelector(`[data-game="${conf.toUpperCase()}-D2"]`);

  const div1Slots = div1.querySelectorAll('.team');
  const div2Slots = div2.querySelectorAll('.team');

  const lowest = winners[winners.length - 1];
  const remaining = winners.filter(t => t.name !== lowest.name);

  // Divisional Game 1: #1 seed vs lowest
  fillTeamSlot(div1Slots[0], firstSeed[conf]);
  fillTeamSlot(div1Slots[1], lowest);

  // Divisional Game 2: remaining two
  fillTeamSlot(div2Slots[0], remaining[0]);
  fillTeamSlot(div2Slots[1], remaining[1]);
}

// ===============================
// UPDATE CONFERENCE (SAFE)
// ===============================
function updateConferenceSlot(conf, divGameId, winner) {
  const confMatchup = document.querySelector(
    `[data-game="${conf.toUpperCase()}-Conf"]`
  );

  const slots = confMatchup.querySelectorAll('.team');

  const slotIndex =
    divGameId.endsWith('D1') ? 0 : 1;

  fillTeamSlot(slots[slotIndex], winner);

  state[conf].conference = [{ ...winner }];
}

// ===============================
// UPDATE SUPER BOWL (SAFE)
// ===============================
function updateSuperBowl() {
  const sb = document.querySelector('[data-game="SB"]');
  const slots = sb.querySelectorAll('.team');

  fillTeamSlot(slots[0], state.afc.conference[0]);
  fillTeamSlot(slots[1], state.nfc.conference[0]);
}

// ===============================
// CLICK HANDLER
// ===============================
function handleTeamClick(teamDiv) {
  const matchup = teamDiv.closest('.matchup');
  if (!matchup || !matchup.dataset.game) return;

  const gameId = matchup.dataset.game;

  matchup.querySelectorAll('.team').forEach(t =>
    t.classList.remove('selected')
  );
  teamDiv.classList.add('selected');

  // --- Wild Card ---
  if (wildCardConfs[gameId]) {
    const conf = wildCardConfs[gameId];

    state[conf].wildCard = state[conf].wildCard.filter(
      t => t.game !== gameId
    );

    state[conf].wildCard.push({
      name: teamDiv.dataset.team,
      seed: +teamDiv.dataset.seed,
      game: gameId
    });

    updateDivisional(conf);
    return;
  }

  // --- Divisional ---
  if (gameId.includes('-D')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';

    updateConferenceSlot(conf, gameId, {
      name: teamDiv.dataset.team,
      seed: +teamDiv.dataset.seed
    });
    return;
  }

  // --- Conference ---
  if (gameId.includes('Conf')) {
    const conf = gameId.startsWith('AFC') ? 'afc' : 'nfc';

    state[conf].conference = [{
      name: teamDiv.dataset.team,
      seed: +teamDiv.dataset.seed
    }];

    updateSuperBowl();
  }
}

// ===============================
// INIT
// ===============================
document.querySelectorAll('.team').forEach(team =>
  team.addEventListener('click', () => handleTeamClick(team))
);
