const state = {
  afc: { wildCard: [], divisional: [], conference: [] },
  nfc: { wildCard: [], divisional: [], conference: [] }
};

// Helper to get next matchup based on round
const nextMatchupMap = {
  "AFC1": "AFC-D1",
  "AFC2": "AFC-D1",
  "AFC3": "AFC-D2",
  "AFC4": "AFC-D2",
  "AFC-D1": "AFC-Conf",
  "AFC-D2": "AFC-Conf",
  "AFC-Conf": "SB",
  "NFC1": "NFC-D1",
  "NFC2": "NFC-D1",
  "NFC3": "NFC-D2",
  "NFC4": "NFC-D2",
  "NFC5": "NFC-D2",
  "NFC6": "NFC-D2",
  "NFC7": "NFC-D1",
  "NFC8": "NFC-D1",
  "NFC-D1": "NFC-Conf",
  "NFC-D2": "NFC-Conf",
  "NFC-Conf": "SB"
};

// Add click events to all teams
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", () => {
    const matchup = team.parentElement;
    const gameId = matchup.dataset.game;
    const conf = gameId.startsWith("AFC") ? "afc" : "nfc";
    const seed = parseInt(team.dataset.seed);
    const name = team.textContent;

    // Deselect other team in this matchup
    matchup.querySelectorAll(".team").forEach(t => t.classList.remove("selected"));
    team.classList.add("selected");

    // Update state
    if (gameId.includes("D") || gameId.includes("Conf") || gameId === "SB") {
      // Divisional or Conference or SB
      state[conf].divisional = state[conf].divisional.filter(t => t.game !== gameId);
      state[conf].conference = state[conf].conference.filter(t => t.game !== gameId);
    } else {
      // Wild Card
      state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
      state[conf].wildCard.push({ name, seed, game: gameId });
    }

    advanceTeam(conf, gameId, { name, seed });
  });
});

// Function to advance a team to next round
function advanceTeam(conf, gameId, team) {
  const nextGame = nextMatchupMap[gameId];
  if (!nextGame) return;

  const slot = document.querySelector(`[data-game='${nextGame}']`);
  if (!slot) return;

  // Determine which slot to fill based on seed
  const children = slot.querySelectorAll(".team");
  if (!children[0].textContent) {
    children[0].textContent = team.name;
    children[0].dataset.seed = team.seed;
    children[0].dataset.conf = conf;
  } else {
    children[1].textContent = team.name;
    children[1].dataset.seed = team.seed;
    children[1].dataset.conf = conf;
  }

  // Save in state for Divisional / Conference rounds
  if (nextGame.includes("D")) {
    state[conf].divisional.push({ name: team.name, seed: team.seed, game: nextGame });
  } else if (nextGame.includes("Conf")) {
    state[conf].conference.push({ name: team.name, seed: team.seed, game: nextGame });
  }

  // If both teams are set in Divisional or Conference, reseed
  if (nextGame.includes("D") && state[conf].divisional.filter(t => t.game === nextGame).length === 2) {
    reseedMatchup(slot, conf);
  }
  if (nextGame.includes("Conf") && state[conf].conference.filter(t => t.game === nextGame).length === 2) {
    reseedMatchup(slot, conf);
  }

  // If Conference matchups are done, update Super Bowl automatically
  if (nextGame === "SB") {
    // Check both AFC and NFC sides
    const sbSlot = document.querySelector("[data-game='SB']");
    const afcWinner = document.querySelector("[data-game='AFC-Conf'] .team.selected");
    const nfcWinner = document.querySelector("[data-game='NFC-Conf'] .team.selected");

    if (afcWinner) sbSlot.children[0].textContent = afcWinner.textContent;
    if (nfcWinner) sbSlot.children[1].textContent = nfcWinner.textContent;
  }
}

// Reseeding function: lowest seed vs highest seed
function reseedMatchup(matchupSlot, conf) {
  const teams = Array.from(matchupSlot.querySelectorAll(".team"));
  const seeds = teams.map(t => ({ name: t.textContent, seed: parseInt(t.dataset.seed), el: t }));
  seeds.sort((a, b) => a.seed - b.seed);

  // Lower seed goes to first slot
  teams[0].textContent = seeds[0].name;
  teams[0].dataset.seed = seeds[0].seed;
  teams[1].textContent = seeds[1].name;
  teams[1].dataset.seed = seeds[1].seed;
}
