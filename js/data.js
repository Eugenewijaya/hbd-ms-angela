/* ==========================================================================
   DATA.JS - Data Source for Ms. Angela's Birthday Celebration
   ========================================================================== */

/**
 * 11 Staff Members of Star Champs + Messages
 */
const staffLetters = [
    {
        id: 1,
        author: "Miss Riska",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Hearts.png",
        fallbackEmoji: "🥰",
        badge: "Doa & Peluk Hangat 🌷",
        cardBg: "bg-[#FFFDF7]",
        borderColor: "border-amber-300",
        envelopeColor: "from-amber-200 to-rose-200",
        message: "Happy birthday ya Ms. Angela! 🎂 Jujur aku selalu kagum sama gimana sabarnya Ms. Angela kalau lagi hadapin anak-anak di sesi terapi, auranya tuh tenang banget sampai anak yang tadinya rewel bisa langsung nyaman. Makasih banyak ya Ms udah selalu sabar bimbing aku juga, nggak pernah pelit bagi ilmu, dan selalu pengertian sama tim. Semoga Ms. Angela sehat terus, panjang umur, dan bahagia selalu bareng keluarga maupun bareng kita di Star Champs!"
    },
    {
        id: 2,
        author: "Mr. Nathan",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Clapping%20Hands.png",
        fallbackEmoji: "👏",
        badge: "Respect Buat Kapten Kita 🙌",
        cardBg: "bg-[#F8FDFF]",
        borderColor: "border-sky-300",
        envelopeColor: "from-sky-200 to-blue-200",
        message: "Selamat ulang tahun, Ms. Angela! 🎉 Kalau ngomongin soal cara memimpin di Star Champs, Ms. Angela tuh beneran contoh leader yang asik dan mengayomi. Kalau ada kendala di lapangan atau kasus anak yang butuh diskusi ekstra, Ms. selalu buka pintu buat ngobrol santai tanpa bikin kita merasa tertekan. Doa terbaik dari saya, semoga Ms. Angela selalu diberkati kesehatan, kelancaran rezeki, dan makin sukses memimpin Star Champs ke depannya!"
    },
    {
        id: 3,
        author: "Miss Nabila",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png",
        fallbackEmoji: "✨",
        badge: "Semangat Positif Setiap Hari ✨",
        cardBg: "bg-[#FFF9FB]",
        borderColor: "border-rose-300",
        envelopeColor: "from-rose-200 to-pink-200",
        message: "Barakallah fii umrik / Happy birthday Ms. Angela sayang! 🥳 Makasih banyak ya Ms udah jadi sosok yang super hangat buat aku di Star Champs. Tiap kali jadwal lagi padat atau kita lagi capek abis pegang anak beruntun, sapaan dan senyum Ms. Angela tuh selalu berhasil bikin suasana adem lagi. Semoga di usia yang baru ini semua doa dan harapan baik Ms. Angela satu per satu dikabulkan Tuhan. Tetap jadi panutan kami ya Ms!"
    },
    {
        id: 4,
        author: "Mr. Regina",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Star.png",
        fallbackEmoji: "⭐",
        badge: "Doa Terbaik Untuk Ms. Angela 🌟",
        cardBg: "bg-[#F6FFF9]",
        borderColor: "border-emerald-300",
        envelopeColor: "from-emerald-200 to-teal-200",
        message: "Happy Birthday Ms. Angela! 🎈 Terima kasih banyak atas semua arahan, masukan yang bijak, dan kepercayaannya selama kita jalan bareng di Star Champs. Senang rasanya bisa kerja di lingkungan yang dipimpin sama orang yang bener-bener peduli sama perkembangan tiap anak sekaligus peduli sama kesejahteraan timnya. Semoga Ms. Angela selalu diberi kekuatan, kesehatan prima, dan kebahagiaan yang melimpah tahun ini!"
    },
    {
        id: 5,
        author: "Miss Stella",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals%20and%20nature/Blossom.png",
        fallbackEmoji: "🌸",
        badge: "Sabar & Penuh Kasih 🌸",
        cardBg: "bg-[#FCF9FF]",
        borderColor: "border-purple-300",
        envelopeColor: "from-purple-200 to-indigo-200",
        message: "Selamat ulang tahun Ms. Angelaaa! 💖 Aku belajar banyak banget dari Ms. Angela, bukan cuma soal teknis terapi dan cara komunikasi sama anak-anak, tapi juga soal gimana caranya punya hati yang sabar dan tulus pas ngadepin orang tua murid. Makasih udah selalu jadi tempat bertanya yang nyaman buat aku ya Ms. Semoga Tuhan selalu melimpahkan berkat, sukacita, dan kesehatan buat Ms. Angela setiap hari!"
    },
    {
        id: 6,
        author: "Miss Tata",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Balloon.png",
        fallbackEmoji: "🎈",
        badge: "Partner Cerita & Senyum 🎈",
        cardBg: "bg-[#FFFDF7]",
        borderColor: "border-amber-300",
        envelopeColor: "from-amber-200 to-orange-200",
        message: "Met ultah ya Ms. Angela! 🎂🥳 Semoga di umur yang baru ini Ms. Angela makin bahagia, makin awet muda karena tiap hari ketemu dunia anak-anak terus hahaha, dan dijauhkan dari segala rasa lelah yang berlebihan! Makasih ya Ms udah selalu dengerin cerita-cerita kita dan selalu kasih solusi yang bikin hati tenang. Pokoknya kami semua sayang banget sama Ms. Angela, terus pimpin kita di Star Champs ya Ms!"
    },
    {
        id: 7,
        author: "Aa Daus",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Folded%20Hands.png",
        fallbackEmoji: "🙏",
        badge: "Doa Sehat & Berkah Selalu 🙏",
        cardBg: "bg-[#F8FDFF]",
        borderColor: "border-sky-300",
        envelopeColor: "from-sky-200 to-cyan-200",
        message: "Selamat ulang tahun Ms. Angela! 🎉 Doa dari Aa Daus semoga Ms. Angela selalu diberikan kesehatan lahir batin, dipanjangkan umurnya dalam keberkahan, dan dimudahkan segala urusannya. Terima kasih banyak ya Ms karena selama ini selalu ramah, baik banget, dan menghargai kami semua tanpa pandang bulu di Star Champs. Semoga kebaikan Ms. Angela dibalas berlipat ganda oleh Tuhan Yang Maha Esa. Amin!"
    },
    {
        id: 8,
        author: "Teyana",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Wrapped%20Gift.png",
        fallbackEmoji: "🎁",
        badge: "Kejutan Manis Buat Ms. Angela 🎁",
        cardBg: "bg-[#FFF9FB]",
        borderColor: "border-rose-300",
        envelopeColor: "from-pink-200 to-rose-200",
        message: "Happy level up day Ms. Angela! 🌷✨ Makasih banyak ya Ms karena udah bikin Star Champs terasa kayak rumah kedua buat kita semua. Ms. Angela tuh selalu punya cara lembut buat ngingetin dan nyemangatin kita kalau lagi ada hal yang kurang pas, jadi kita semua semangat buat terus belajar jadi lebih baik. Semoga tahun ini membawa banyak kejutan manis, rezeki yang lancar, dan hati yang selalu gembira buat Ms. Angela!"
    },
    {
        id: 9,
        author: "Teh Nabila",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Growing%20Heart.png",
        fallbackEmoji: "💗",
        badge: "Penuh Syukur & Doa Baik 💗",
        cardBg: "bg-[#F6FFF9]",
        borderColor: "border-emerald-300",
        envelopeColor: "from-emerald-200 to-green-200",
        message: "Selamat ulang tahun ya Ms. Angela! 🎂 Doa Teh Nabila buat Ms. Angela semoga sehat selalu, makin sukses, dan selalu dalam lindungan-Nya. Senang banget bisa kenal dan kerja bareng sosok sebaik dan sesabar Ms. Angela. Terima kasih sudah selalu perhatian sama hal-hal kecil di sekitar kita. Semoga Star Champs makin maju dan berkah terus di bawah kepemimpinan Ms. Angela!"
    },
    {
        id: 10,
        author: "Mr. Kevin",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png",
        fallbackEmoji: "🚀",
        badge: "Maju Terus Star Champs! 🚀",
        cardBg: "bg-[#FCF9FF]",
        borderColor: "border-purple-300",
        envelopeColor: "from-purple-200 to-violet-200",
        message: "Happy Birthday, Ms. Angela! 🙌 Respect banget buat dedikasi dan konsistensi Ms. Angela dalam menjaga kualitas pelayanan terapi sekaligus menjaga kekompakan tim di Star Champs. Nggak gampang jadi pemimpin yang bisa tegas sekaligus punya empati tinggi, tapi Ms. Angela berhasil nunjukin itu ke kita semua. Semoga di tahun yang baru ini semua rencana besar Ms. Angela dan Star Champs berjalan mulus!"
    },
    {
        id: 11,
        author: "Miss Lena",
        role: "Star Champs Team",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hugging%20Face.png",
        fallbackEmoji: "🤗",
        badge: "Role Model Kesayangan Kami 🤗",
        cardBg: "bg-[#FFFDF7]",
        borderColor: "border-amber-300",
        envelopeColor: "from-amber-200 to-yellow-200",
        message: "Happy birthday Ms. Angela tersayang! 🎂💛 Terima kasih sudah jadi role model dan mentor yang luar biasa buat aku dan teman-teman semua di Star Champs. Setiap kali lihat cara Ms. Angela berinteraksi sama anak-anak dan orang tua, aku selalu terinspirasi buat jadi pribadi yang lebih sabar dan bijak. Semoga Ms. Angela selalu dilimpahi kebahagiaan, kesehatan, dan cinta setiap harinya. We love you, Ms. Angela!"
    }
];

/**
 * AAC Communication Board Symbols
 */
const aacSymbols = [
    {
        id: "ms-angela",
        label: "Ms. Angela",
        categoryColor: "bg-amber-50 border-amber-400 text-amber-900",
        badgeText: "Subjek",
        imgUrl: "https://static.arasaac.org/pictograms/6537/6537_500.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Halo.png",
        voicePhrase: "Ms. Angela yang baik hati dan sabar!",
        freq: 523.25
    },
    {
        id: "sayang",
        label: "Sayang Banget",
        categoryColor: "bg-rose-50 border-rose-400 text-rose-900",
        badgeText: "Perasaan",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Hearts.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Red%20Heart.png",
        voicePhrase: "Kami semua sayang banget sama Ms. Angela! 💛",
        freq: 587.33
    },
    {
        id: "terima-kasih",
        label: "Terima Kasih",
        categoryColor: "bg-emerald-50 border-emerald-400 text-emerald-900",
        badgeText: "Tindakan",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Folded%20Hands.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Clapping%20Hands.png",
        voicePhrase: "Terima kasih sudah sabar mendampingi anak-anak belajar berkomunikasi!",
        freq: 659.25
    },
    {
        id: "kue-ultah",
        label: "Selamat Ulang Tahun",
        categoryColor: "bg-orange-50 border-orange-400 text-orange-900",
        badgeText: "Perayaan",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Birthday%20Cake.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Party%20Popper.png",
        voicePhrase: "Selamat ulang tahun Ms. Angela! Semoga panjang umur dan sehat selalu! 🎂",
        freq: 698.46
    },
    {
        id: "peluk",
        label: "Peluk Hangat",
        categoryColor: "bg-emerald-50 border-emerald-400 text-emerald-900",
        badgeText: "Tindakan",
        imgUrl: "https://static.arasaac.org/pictograms/4550/4550_500.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hugging%20Face.png",
        voicePhrase: "Peluk hangat dari anak-anak dan tim Star Champs! 🤗",
        freq: 783.99
    },
    {
        id: "main-belajar",
        label: "Belajar & Bicara",
        categoryColor: "bg-sky-50 border-sky-400 text-sky-900",
        badgeText: "Terapi AAC",
        imgUrl: "https://static.arasaac.org/pictograms/15018/15018_500.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Puzzle%20Piece.png",
        voicePhrase: "Belajar berkomunikasi lewat gambar AAC dan suara bersama Ms. Angela!",
        freq: 880.00
    },
    {
        id: "hebat",
        label: "Leader Hebat",
        categoryColor: "bg-purple-50 border-purple-400 text-purple-900",
        badgeText: "Sifat",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Trophy.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Glowing%20Star.png",
        voicePhrase: "Ms. Angela role model dan pemimpin paling bijak di Star Champs! 🏆",
        freq: 987.77
    },
    {
        id: "bahagia",
        label: "Senyum Bahagia",
        categoryColor: "bg-rose-50 border-rose-400 text-rose-900",
        badgeText: "Perasaan",
        imgUrl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png",
        fallbackImg: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Balloon.png",
        voicePhrase: "Semoga Ms. Angela selalu tersenyum bahagia setiap hari! 🌈",
        freq: 1046.50
    }
];

/**
 * Photobooth 9:16 Stickers Tray
 */
const photoboothStickers = [
    { id: "hat", emoji: "🥳", label: "Party Hat" },
    { id: "crown", emoji: "👑", label: "Crown" },
    { id: "star", emoji: "⭐", label: "Star" },
    { id: "sparkle", emoji: "✨", label: "Sparkle" },
    { id: "heart", emoji: "💖", label: "Heart" },
    { id: "cake", emoji: "🎂", label: "Cake" },
    { id: "balloon", emoji: "🎈", label: "Balloon" },
    { id: "glasses", emoji: "🕶️", label: "Cool Glasses" },
    { id: "flower", emoji: "🌸", label: "Blossom" },
    { id: "trophy", emoji: "🏆", label: "Trophy" }
];
