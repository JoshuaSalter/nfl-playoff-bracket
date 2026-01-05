document.querySelectorAll(".team").forEach(team => {
  team.addEventListener("click", () => {
    const nextId = team.dataset.next;
    const nextSlot = document.getElementById(nextId);

    if (!nextSlot) return;

    // Advance team name
    nextSlot.textContent = team.textContent;

    // If advancing to conference champ
    if (nextId.includes("div")) {
      const champId = nextId.startsWith("afc") ? "afc-champ" : "nfc-champ";
      nextSlot.dataset.next = champId;
    }

    // If advancing to Super Bowl
    if (nextId.includes("champ")) {
      document.getElementById("superbowl").textContent = team.textContent;
    }
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
