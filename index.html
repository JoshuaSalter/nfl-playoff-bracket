// Track winners for each conference
const state = {
  afc: { wildCard: [], divisional: [], conference: [] },
  nfc: { wildCard: [], divisional: [], conference: [] }
};

// Map of which matchup goes to the next matchup
const nextMatchupMap = {
  // AFC Wild Card -> Divisional
  "AFC1": "AFC-D1",
  "AFC2": "AFC-D1",
  "AFC3": "AFC-D2",
  "AFC4": "AFC-D2",
  // AFC Divisional -> Conference
  "AFC-D1": "AFC-Conf",
  "AFC-D2": "AFC-Conf",
  "AFC-Conf": "SB",
  
  // NFC Wild Card -> Divisional
  "NFC1": "NFC-D1",
  "NFC2": "NFC-D1",
  "NFC3": "NFC-D2",
  "NFC4": "NFC-D2",
  "NFC5": "NFC-D2",
  "NFC6": "NFC-D2",
  "NFC7": "NFC-D1",
  "NFC8": "NFC-D1",
  // NFC Divisional -> Conference
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
    const name = team.textContent;
    const seed = parseInt(team.dataset.seed);

    // Deselect other team in this matchup
    matchup.querySelectorAll(".team").forEach(t => t.classList.remove("selected"));
    team.classList.add("selected");

    // Update state for Wild Card or Divisional/Conference
    if (gameId.includes("D")) {
      state[conf].divisional = state[conf].divisional.filter(t => t.game !== gameId);
      state[conf].divisional.push({ name, seed, game: gameId });
    } else if (gameId.includes("Conf")) {
      state[conf].conference = state[conf].conference.filter(t => t.game !== gameId);
      state[conf].conference.push({ name, seed, game: gameId });
    } else if (gameId === "SB") {
      // Super Bowl: do nothing, handled later
    } else {
      // Wild Card
      state[conf].wildCard = state[conf].wildCard.filter(t => t.game !== gameId);
      state[conf].wildCard.push({ name, seed, game: gameId });
    }

    // Advance team to next round
    advanceTeam(gameId, { name, seed, conf });
  });
});

// Advance a team to the next matchup
function advanceTeam(gameId, team) {
  const nextGame = nextMatchupMap[gameId];
  if (!nextGame) return;

  const slot = document.querySelector(`[data-game='${nextGame}']`);
  if (!slot) return;

  const children = slot.querySelectorAll(".team");

  // Fill the first empty slot
  if (!children[0].textContent) {
    children[0].textContent = team.name;
    children[0].dataset.seed = team.seed;
    children[0].dataset.conf = team.conf;
  } else if (!children[1].textContent) {
    children[1].textContent = team.name;
    children[1].dataset.seed = team.seed;
    children[1].dataset.conf = team.conf;
  }

  // Reseed the matchup if both teams are set
  if (children[0].textContent && children[1].textContent) {
    reseedMatchup(slot);
  }

  // Automatically update Super Bowl when both Conference winners are selected
  if (nextGame === "SB") {
    const sbSlot = document.querySelector("[data-game='SB']");
    const afcWinner = document.querySelector("[data-game='AFC-Conf'] .team.selected");
    const nfcWinner = document.querySelector("[data-game='NFC-Conf'] .team.selected");

    if (afcWinner) sbSlot.children[0].textContent = afcWinner.textContent;
    if (nfcWinner) sbSlot.children[1].textContent = nfcWinner.textContent;
  }
}

// Sort two teams by seed: lowest seed goes to first slot
function reseedMatchup(matchupSlot) {
  const teams = Array.from(matchupSlot.querySelectorAll(".team"));
  const sorted = teams
    .map(t => ({ name: t.textContent, seed: parseInt(t.dataset.seed), el: t }))
    .sort((a, b) => a.seed - b.seed);

  teams[0].textContent = sorted[0].name;
  teams[0].dataset.seed = sorted[0].seed;
  teams[1].textContent = sorted[1].name;
  teams[1].dataset.seed = sorted[1].seed;
}
