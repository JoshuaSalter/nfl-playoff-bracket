const state = {
  afc: {
    wildCardWinners: [],
    divisionalWinners: []
  },
  nfc: {
    wildCardWinners: [],
    divisionalWinners: []
  }
};

document.querySelectorAll(".game").forEach(game => {
  const teams = game.querySelectorAll(".team");

  teams.forEach(team => {
    team.addEventListener("click", () => {
      teams.forEach(t => t.classList.remove("winner"));
      team.classList.add("winner");

      const conf = team.dataset.conf;
      const seed = parseInt(team.dataset.seed);
      const name = team.textContent;

      // Remove previous selection from this game
      state[conf].wildCardWinners =
        state[conf].wildCardWinners.filter(t => t.game !== game);

      state[conf].wildCardWinners.push({
        name,
        seed,
        game
      });

      if (state[conf].wildCardWinners.length === 3) {
        runDivisional(conf);
      }
    });
  });
});

function runDivisional(conf) {
  const winners = [...state[conf].wildCardWinners]
    .sort((a, b) => a.seed - b.seed); // lowest seed = highest priority

  const byeTeam = conf === "afc"
    ? { name: "Ravens", seed: 1 }
    : { name: "49ers", seed: 1 };

  const lowestSeed = winners[winners.length - 1];
  const remaining = winners.slice(0, 2);

  // #1 seed vs lowest
  setSlot(`${conf}-div-3`, byeTeam.name, byeTeam.seed);
  setSlot(`${conf}-div-1`, lowestSeed.name, lowestSeed.seed);

  // Other matchup
  setSlot(`${conf}-div-2`, remaining[0].name, remaining[0].seed);
}

function setSlot(id, name, seed) {
  const slot = document.getElementById(id);
  slot.textContent = `#${seed} ${name}`;
  slot.dataset.seed = seed;
  slot.dataset.conf = id.startsWith("afc") ? "afc" : "nfc";

  slot.onclick = () => handleDivisionalWin(slot);
}

function handleDivisionalWin(slot) {
  const conf = slot.dataset.conf;
  const seed = parseInt(slot.dataset.seed);
  const name = slot.textContent.replace(/^#\d+\s/, "");

  state[conf].divisionalWinners.push({ name, seed });

  if (state[conf].divisionalWinners.length === 2) {
    runConference(conf);
  }
}

function runConference(conf) {
  const winners = state[conf].divisionalWinners
    .sort((a, b) => a.seed - b.seed);

  const champSlot = document.getElementById(`${conf}-champ`);
  champSlot.textContent = `#${winners[0].seed} ${winners[0].name}`;
  champSlot.dataset.conf = conf;
  champSlot.dataset.seed = winners[0].seed;

  champSlot.onclick = () => {
    document.getElementById("superbowl-slot").textContent =
      champSlot.textContent;
  };
}
