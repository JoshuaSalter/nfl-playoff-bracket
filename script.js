document.querySelectorAll(".game").forEach(game => {
  const teams = game.querySelectorAll(".team");
  const nextId = game.dataset.next;

  teams.forEach(team => {
    team.addEventListener("click", () => {
      teams.forEach(t => t.classList.remove("winner"));
      team.classList.add("winner");

      const next = document.getElementById(nextId);
      if (!next) return;

      next.textContent = team.textContent;

      if (nextId.includes("div")) {
        const champId = nextId.startsWith("afc") ? "afc-champ" : "nfc-champ";
        next.dataset.next = champId;
      }

      if (nextId.includes("champ")) {
        document.getElementById("superbowl-slot").textContent = team.textContent;
      }
    });
  });
});
