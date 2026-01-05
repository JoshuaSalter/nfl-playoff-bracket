document.getElementById("download").addEventListener("click", () => {
  html2canvas(document.getElementById("bracket")).then(canvas => {
    const link = document.createElement("a");
    link.download = "nfl-playoff-bracket.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});
