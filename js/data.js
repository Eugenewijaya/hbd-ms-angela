/* ==========================================================================
   data.js — konten: catatan pembuka, 11 surat staf, dan harapan bersama
   ========================================================================== */
(function () {
    const SC = (window.SC = window.SC || {});

    SC.opening = [
        "Selamat ulang tahun ya, Ms. Angela!",
        "Di hari yang spesial ini, kami semua ingin kirim doa paling tulus buat Ms. Angela. Semoga Tuhan selalu jaga kesehatan Ms. Angela, kasih umur yang panjang dan penuh berkah, hati yang selalu tenang, dan kebahagiaan yang nggak putus-putus di setiap langkah.",
        "Terima kasih banyak karena lewat ketulusan, kesabaran, dan ilmu terapi wicara yang Ms. bagi setiap hari, ada begitu banyak anak yang pelan-pelan berani bersuara, belajar berkomunikasi, dan bikin orang tua mereka tersenyum haru.",
        "Semoga semua rasa lelah dan kebaikan yang Ms. Angela tanam di Star Champs selalu berbuah manis dan berbalik jadi berkah berlipat ganda. Tetap jadi sosok yang hangat buat anak-anak dan buat kami semua ya, Ms!"
    ].join("\n\n");

    SC.wishes = [
        "Untuk Ms. Angela,",
        "Di balik ramainya suara anak-anak belajar bicara di ruang terapi, tawa kecil mereka saat berhasil menyelesaikan sesi, dan rutinitas kita sehari-hari dari pagi sampai sore, kami cuma mau bilang satu hal dari hati yang paling dalam: terima kasih banyak sudah hadir dan memimpin kami semua di sini.",
        "Harapan terbesar kami di pertambahan usia Ms. Angela kali ini adalah semoga Ms. selalu dikaruniai kesehatan, kesabaran yang luas, dan semangat yang terus menyala untuk memimpin Star Champs melangkah semakin maju.",
        "Kami semua mendoakan agar Ms. Angela terus bertumbuh menjadi pribadi yang bijak dalam mengambil setiap langkah, serta senantiasa menjadi role model dan teladan yang baik bagi seluruh staf maupun manajemen — sosok yang mengayomi dengan hati, mau mendengar, dan merangkul kami semua seperti keluarga sendiri.",
        "Kami akan terus menantikan tahun-tahun selanjutnya bersama Ms. Angela — bertumbuh bareng, melewati suka duka bareng, dan melihat lebih banyak lagi senyum anak-anak hebat di Star Champs."
    ];

    SC.staff = [
        {
            author: "Miss Riska",
            message: "Happy birthday ya Ms. Angela! 🎂 Jujur aku selalu kagum sama gimana sabarnya Ms. Angela kalau lagi hadapin anak-anak di sesi terapi, auranya tuh tenang banget sampai anak yang tadinya rewel bisa langsung nyaman. Makasih banyak ya Ms udah selalu sabar bimbing aku juga, nggak pernah pelit bagi ilmu, dan selalu pengertian sama tim. Semoga Ms. Angela sehat terus, panjang umur, dan bahagia selalu bareng keluarga maupun bareng kita di Star Champs!"
        },
        {
            author: "Mr. Nathan",
            message: "Selamat ulang tahun, Ms. Angela! 🎉 Kalau ngomongin soal cara memimpin di Star Champs, Ms. Angela tuh beneran contoh leader yang asik dan mengayomi. Kalau ada kendala di lapangan atau kasus anak yang butuh diskusi ekstra, Ms. selalu buka pintu buat ngobrol santai tanpa bikin kita merasa tertekan. Doa terbaik dari saya, semoga Ms. Angela selalu diberkati kesehatan, kelancaran rezeki, dan makin sukses memimpin Star Champs ke depannya!"
        },
        {
            author: "Miss Nabila",
            message: "Barakallah fii umrik / Happy birthday Ms. Angela! 🥳 Makasih banyak ya Ms udah jadi sosok yang super hangat buat aku di Star Champs. Tiap kali jadwal lagi padat atau kita lagi capek abis pegang anak beruntun, sapaan dan senyum Ms. Angela tuh selalu berhasil bikin suasana adem lagi. Semoga di usia yang baru ini semua doa dan harapan baik Ms. Angela satu per satu dikabulkan Tuhan. Tetap jadi panutan kami ya Ms!"
        },
        {
            author: "Mr. Regina",
            message: "Happy Birthday Ms. Angela! 🎈 Terima kasih banyak atas semua arahan, masukan yang bijak, dan kepercayaannya selama kita jalan bareng di Star Champs. Senang rasanya bisa kerja di lingkungan yang dipimpin sama orang yang bener-bener peduli sama perkembangan tiap anak sekaligus peduli sama kesejahteraan timnya. Semoga Ms. Angela selalu diberi kekuatan, kesehatan prima, dan kebahagiaan yang melimpah tahun ini!"
        },
        {
            author: "Miss Stella",
            message: "Selamat ulang tahun Ms. Angelaaa! 💖 Aku belajar banyak banget dari Ms. Angela, bukan cuma soal teknis terapi dan cara komunikasi sama anak-anak, tapi juga soal gimana caranya punya hati yang sabar dan tulus pas ngadepin orang tua murid. Makasih udah selalu jadi tempat bertanya yang nyaman buat aku ya Ms. Semoga Tuhan selalu melimpahkan berkat, sukacita, dan kesehatan buat Ms. Angela setiap hari!"
        },
        {
            author: "Miss Tata",
            message: "Met ultah ya Ms. Angela! 🎂🥳 Semoga di umur yang baru ini Ms. Angela makin bahagia, makin awet muda karena tiap hari ketemu dunia anak-anak terus hahaha, dan dijauhkan dari segala rasa lelah yang berlebihan! Makasih ya Ms udah selalu dengerin cerita-cerita kita dan selalu kasih solusi yang bikin hati tenang. Pokoknya kami semua bersyukur banget punya Ms. Angela, terus pimpin kita di Star Champs ya Ms!"
        },
        {
            author: "Aa Daus",
            message: "Selamat ulang tahun Ms. Angela! 🎉 Doa dari Aa Daus semoga Ms. Angela selalu diberikan kesehatan lahir batin, dipanjangkan umurnya dalam keberkahan, dan dimudahkan segala urusannya. Terima kasih banyak ya Ms karena selama ini selalu ramah, baik banget, dan menghargai kami semua tanpa pandang bulu di Star Champs. Semoga kebaikan Ms. Angela dibalas berlipat ganda oleh Tuhan Yang Maha Esa. Amin!"
        },
        {
            author: "Teh Yana",
            message: "Happy level up day Ms. Angela! 🌷✨ Makasih banyak ya Ms karena udah bikin Star Champs terasa kayak rumah kedua buat kita semua. Ms. Angela tuh selalu punya cara lembut buat ngingetin dan nyemangatin kita kalau lagi ada hal yang kurang pas, jadi kita semua semangat buat terus belajar jadi lebih baik. Semoga tahun ini membawa banyak kejutan manis, rezeki yang lancar, dan hati yang selalu gembira buat Ms. Angela!"
        },
        {
            author: "Teh Nabila",
            message: "Selamat ulang tahun ya Ms. Angela! 🎂 Doa Teh Nabila buat Ms. Angela semoga sehat selalu, makin sukses, dan selalu dalam lindungan-Nya. Senang banget bisa kenal dan kerja bareng sosok sebaik dan sesabar Ms. Angela. Terima kasih sudah selalu perhatian sama hal-hal kecil di sekitar kita. Semoga Star Champs makin maju dan berkah terus di bawah kepemimpinan Ms. Angela!"
        },
        {
            author: "Evit",
            message: "Happy Birthday, Ms. Angela! 🙌 Respect banget buat dedikasi dan konsistensi Ms. Angela dalam menjaga kualitas pelayanan terapi sekaligus menjaga kekompakan tim di Star Champs. Nggak gampang jadi pemimpin yang bisa tegas sekaligus punya empati tinggi, tapi Ms. Angela berhasil nunjukin itu ke kita semua. Semoga di tahun yang baru ini semua rencana besar Ms. Angela dan Star Champs berjalan mulus!"
        },
        {
            author: "Miss Lena",
            message: "Happy birthday Ms. Angela! 🎂💛 Terima kasih sudah jadi role model dan mentor yang luar biasa buat aku dan teman-teman semua di Star Champs. Setiap kali lihat cara Ms. Angela berinteraksi sama anak-anak dan orang tua, aku selalu terinspirasi buat jadi pribadi yang lebih sabar dan bijak. Semoga Ms. Angela selalu dilimpahi kebahagiaan, kesehatan, dan keberkahan setiap harinya. Bangga banget bisa belajar bareng Ms. Angela!"
        }
    ];
})();
