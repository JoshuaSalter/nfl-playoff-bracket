document.querySelectorAll(".game").forEach(game => {
  const teams = game.querySelectorAll(".team");
  const nextId = game.dataset.next;

  teams.forEach(team => {
    team.addEventListener("click", () => {
      // Clear previous winner
      teams.forEach(t => t.classList.remove("winner"));

      // Mark winner
      team.classList.add("winner");

      // Advance winner
      const nextSlot = document.getElementById(nextId);
      if (nextSlot) {
        nextSlot.textContent = team.textContent;
      }

      // Advance to conference champ
      if (nextId.includes("div")) {
        const champId = nextId.startsWith("afc") ? "afc-champ" : "nfc-champ";
        nextSlot.dataset.next = champId;
      }

      // Advance to Super Bowl
      if (nextId.includes("champ")) {
        document.getElementById("superbowl").textContent = team.textContent;
      }
    });
  });
});

document.getElementById("download").addEventListener("click", () => {
  html2canvas(document.getElementById("bracket")).then(canvas => {
    const link = document.createElement("a");
    link.download = "nfl-playoff-bracket.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});
