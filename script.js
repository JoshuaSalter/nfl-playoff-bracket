// ===============================
// FULL STATE
// ===============================
const state = {
  afc: {
    wildCard: [],      // Wild Card winners
    divisional: [],    // Divisional winners
    conference: [],    // Conference winners
    firstSeed: {       // 1st seed team
      name: "Broncos",
      seed: 1,
      logo: "logos/broncos.svg"
    }
  },
  nfc: {
    wildCard: [],
    divisional: [],
    conference: [],
    firstSeed: {
      name: "Seahawks",
      seed: 1,
      logo: "logos/seahawks.svg"
    }
  }
};

// Map Wild Card games to conferences
const wildCardConfs = {
  "AFC-WC1": "afc",
  "AFC-WC2": "afc",
  "AFC-WC3": "afc",
  "NFC-WC1": "nfc",
  "NFC-WC2": "nfc",
  "NFC-WC3": "nfc"
};

// ===============================
// CREATE TEAM ELEMENT
// ===============================
function createTeamElement(team) {
  const div = document.createElement("div");
  div.classList.add("team");
  div.dataset.team = team.name;
  div.dataset.seed = team.seed;

  const img = document.createElement("img");
  img.src = team.logo;
  img.alt = team.name;
  img.classList.add("logo");

  const span = document.createElement("span");
  span.textContent = `#${team.seed} ${team.name}`;

  div.append(img, span);

  div.addEventListener("click", () => handleTeamClick(div));
  return div;
}

// ===============================
// FILL TEAM SLOT
// ===============================
function fillTeamSlot(slot, team) {
  slot.innerHTML = "";
  if (!team) {
    slot.classList.add("empty");
    return;
  }
  slot.classList.remove("empty");
  slot.appendChild(createTeamElement(team));
}

// ===============================
// HANDLE TEAM CLICK
// ===============================
function handleTeamClick(teamDiv) {
  if (teamDiv.classList.contains("empty")) return; // Ignore empty slots

  const matchup = teamDiv.closest(".matchup");
  const gameId = matchup.dataset.game;
  const conf = gameId.startsWith("AFC") ? "afc" : "nfc";

  // Deselect if already selected
  const isSelected = teamDiv.classList.contains("selected");
  matchup.querySelectorAll(".team").forEach(t => t.classList.remove("selected"));
  if (isSelected) {
    removeWinnerFromState(conf, gameId);
    updateRounds(conf);
    return;
  }

  // Select new winner
  teamDiv.classList.add("selected");
  setWinnerInState(conf, gameId, {
    name: teamDiv.dataset.team,
    seed: +teamDiv.dataset.seed,
    logo: teamDiv.querySelector("img").src
  });

  updateRounds(conf);
}

// ===============================
// STATE HELPERS
// ===============================
function removeWinnerFromState(conf, gameId) {
  if (wildCardConfs[gameId]) {
    state[conf].wildCard = state[conf].wildCard.filter(t => t.gameId !== gameId);
  } else if (gameId.includes("D")) {
    state[conf].divisional = state[conf].divisional.map(t => (t.gameId === gameId ? null : t));
  } else if (gameId.includes("Conf")) {
    state[conf].conference = state[conf].conference.map(t => (t.gameId === gameId ? null : t));
  }
}

function setWinnerInState(conf, gameId, team) {
  team.gameId = gameId; // Track which matchup it came from
  if (wildCardConfs[gameId]) {
    // Replace any previous winner from this matchup
    state[conf].wildCard = state[conf].wildCard.filter(t => t.gameId !== gameId);
    state[conf].wildCard.push(team);
  } else if (gameId.includes("D")) {
    state[conf].divisional = state[conf].divisional.filter(t => t && t.gameId !== gameId);
    state[conf].divisional.push(team);
  } else if (gameId.includes("Conf")) {
    state[conf].conference = state[conf].conference.filter(t => t && t.gameId !== gameId);
    state[conf].conference.push(team);
  }
}

// ===============================
// UPDATE ROUNDS
// ===============================
function updateRounds(conf) {
  updateDivisional(conf);
  updateConference(conf);
  updateSuperBowl();
}

// ---------------- Divisional ----------------
function updateDivisional(conf) {
  const winners = state[conf].wildCard.slice().sort((a, b) => a.seed - b.seed);
  const divMatchups = conf === "afc"
    ? [document.querySelector("[data-game='AFC-D1']"), document.querySelector("[data-game='AFC-D2']")]
    : [document.querySelector("[data-game='NFC-D1']"), document.querySelector("[data-game='NFC-D2']")];

  // DIV1 = first seed vs lowest seed Wild Card winner
  const lowest = winners[winners.length - 1] || null;
  fillTeamSlot(divMatchups[0].children[0], state[conf].firstSeed);
  fillTeamSlot(divMatchups[0].children[1], lowest);

  // DIV2 = remaining winners
  const remaining = winners.filter(t => t !== lowest);
  fillTeamSlot(divMatchups[1].children[0], remaining[0] || null);
  fillTeamSlot(divMatchups[1].children[1], remaining[1] || null);

  // Save divisional state for click tracking
  state[conf].divisional = [
    { ...state[conf].firstSeed, gameId: divMatchups[0].dataset.game },
    { ...lowest, gameId: divMatchups[0].dataset.game },
    { ...remaining[0], gameId: divMatchups[1].dataset.game },
    { ...remaining[1], gameId: divMatchups[1].dataset.game }
  ].filter(Boolean);
}

// ---------------- Conference ----------------
function updateConference(conf) {
  const divMatchups = conf === "afc"
    ? [document.querySelector("[data-game='AFC-D1']"), document.querySelector("[data-game='AFC-D2']")]
    : [document.querySelector("[data-game='NFC-D1']"), document.querySelector("[data-game='NFC-D2']")];

  const confMatchup = conf === "afc"
    ? document.querySelector("[data-game='AFC-Conf']")
    : document.querySelector("[data-game='NFC-Conf']");

  divMatchups.forEach((div, idx) => {
    const winnerEl = Array.from(div.children).find(t => t.classList.contains("selected"));
    const winner = winnerEl
      ? { name: winnerEl.dataset.team, seed: +winnerEl.dataset.seed, logo: winnerEl.querySelector("img").src }
      : null;
    fillTeamSlot(confMatchup.children[idx], winner);
    // Update conference state
    state[conf].conference[idx] = winner ? { ...winner, gameId: div.dataset.game } : null;
  });
}

// ---------------- Super Bowl ----------------
function updateSuperBowl() {
  const sb = document.querySelector("[data-game='SB']");
  sb.innerHTML = ""; // Clear old content

  const afcWinner = state.afc.conference[0] || null;
  const nfcWinner = state.nfc.conference[0] || null;

  fillTeamSlot(sb.children[0], afcWinner);
  fillTeamSlot(sb.children[1], nfcWinner);
}

// ===============================
// INITIALIZE CLICK HANDLERS
// ===============================
document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", () => handleTeamClick(team));
});

// ===============================
// SHARE BUTTON
// ===============================
document.getElementById("share-btn").addEventListener("click", async () => {
  const bracketEl = document.getElementById("bracket");
  html2canvas(bracketEl, { backgroundColor: "#fff", useCORS: true, imageTimeout: 3000 }).then(canvas => {
    canvas.toBlob(async blob => {
      const file = new File([blob], "NFL-Bracket-2026.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My 2026 NFL Bracket" });
        } catch (err) {
          console.error("Error sharing:", err);
        }
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = "NFL-Bracket-2026.png";
        link.click();
        URL.revokeObjectURL(link.href);
        alert("Bracket image downloaded! You can now share it.");
      }
    }, "image/png");
  });
});
