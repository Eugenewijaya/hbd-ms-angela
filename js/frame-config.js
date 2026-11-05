/* ==========================================================================
   frame-config.js — konfigurasi frame photobooth
   Dibuat oleh tools/build-frame.mjs dari PDF frame (jangan diubah manual,
   kecuali ingin menggeser slot). Koordinat dalam piksel pada gambar frame.
   ========================================================================== */
window.SC_FRAME = {
    src: "assets/frames/star-champs-air.png",
    width: 1080,
    height: 1620,
    shotsPerStrip: 3,
    border: "#b3d5fb",
    slots: [
        { x: 45, y: 284, w: 451, h: 369 },
        { x: 45, y: 698, w: 451, h: 369 },
        { x: 45, y: 1112, w: 451, h: 369 },
        { x: 582, y: 284, w: 451, h: 369 },
        { x: 582, y: 698, w: 451, h: 369 },
        { x: 582, y: 1112, w: 451, h: 369 }
    ]
};
