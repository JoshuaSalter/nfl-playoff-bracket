const state = {
  afc: { wildCardWinners: [], divisionalWinners: [] },
  nfc: { wildCardWinners: [], divisionalWinners: [] }
};

// Wild Card click handler
document.querySelectorAll(".game").forEach(game => {
  const teams = game.querySelectorAll(".team");

  teams.forEach(team => {
    team.addEventListener("click", () => {
      // Highlight winner
      teams.forEach(t => t.classList.remove("winner"));
      team.classList.add("winner");

      const conf = team.dataset.conf;
      const seed = parseInt(team.dataset.seed);
      const name = team.textContent;

      // Remove previous selection from this game
      state[conf].wildCardWinners = state[conf].wildCardWinners.filter(t => t.game !== game);

      // Add new winner
      state[conf].wildCardWinners.push({ name, seed, game });

      // When all 3 Wild Card winners selected, populate Divisional round
      if (state[conf].wildCardWinners.length === 3) {
        runDivisional(conf);
      }
    });
  });
});

// Populate Divisional Round
function runDivisional(conf) {
  const winners = [...state[conf].wildCardWinners].sort((a, b) => a.seed - b.seed);
  const byeTeam = conf === "afc" ? { name: "Ravens", seed: 1 } : { name: "49ers", seed: 1 };
  
  const lowestSeed = winners[winners.length - 1];
  const remaining = winners.slice(0, 2);

  // #1 seed vs lowest winner
  setSlot(`${conf}-div-3`, byeTeam.name, byeTeam.seed);
  setSlot(`${conf}-div-1`, lowestSeed.name, lowestSeed.seed);

  // Other matchup
  setSlot(`${conf}-div-2`, remaining[0].name, remaining[0].seed);

  // Clear previous divisional winners
  state[conf].divisionalWinners = [];
}

// Populate a slot and attach click handler
function setSlot(id, name, seed) {
  const slot = document.getElementById(id);
  slot.textContent = `#${seed} ${name}`;
  slot.dataset.seed = seed;
  slot.dataset.conf = id.startsWith("afc") ? "afc" : "nfc";

  // Click handler to choose winner of this matchup
  slot.onclick = () => handleDivisionalWin(slot);
}

// Divisional round winner
function handleDivisionalWin(slot) {
  const conf = slot.dataset.conf;
  const seed = parseInt(slot.dataset.seed);
  const name = slot.textContent.replace(/^#\d+\s/, "");

  // Replace existing if same matchup clicked
  state[conf].divisionalWinners = state[conf].divisionalWinners.filter(t => t.seed !== seed);
  state[conf].divisionalWinners.push({ name, seed });

  // When 2 divisional winners selected, populate conference champ
  if (state[conf].divisionalWinners.length === 2) {
    runConference(conf);
  }
}

// Conference champ
function runConference(conf) {
  const winners = state[conf].divisionalWinners.sort((a, b) => a.seed - b.seed);
  const champSlot = document.getElementById(`${conf}-champ`);
  champSlot.textContent = `#${winners[0].seed} ${winners[0].name}`;
  champSlot.dataset.conf = conf;
  champSlot.dataset.seed = winners[0].seed;

  // Click to send to Super Bowl
  champSlot.onclick = () => {
    document.getElementById("superbowl-slot").textContent = champSlot.textContent;
  };
}
