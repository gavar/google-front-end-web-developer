setTimeout(() => {
    const node = document.querySelector("#main-menu .game-title");
    html2canvas(node, {
        backgroundColor: "transparent",
        removeContainer: true,
        scale: 2,
        y: 400,
    }).then(canvas => {
        const img = document.createElement("img");
        img.src = canvas.toDataURL();
        document.body.appendChild(img);
    });
}, 1000);
