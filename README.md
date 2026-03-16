# Fira

Fira adalah extension Chrome dengan halaman new tab bertema asisten futuristik.
Fokus utamanya bukan sekadar mengganti tampilan tab baru, tapi membentuk workspace
yang terasa personal, cepat dipakai, dan tetap fungsional untuk aktivitas harian.

Halaman utamanya menampilkan sapaan dinamis berdasarkan waktu, panel status, jam realtime,
Google search langsung dari dashboard, serta task board ringan buat mencatat fokus kerja.

## Yang Ada di Dalam Fira

- Halaman `New Tab` custom dengan tampilan modern dan identitas visual khas Fira
- Onboarding awal untuk menyimpan nama user dan zona waktu (`WIB`, `WITA`, `WIT`)
- Sapaan otomatis yang menyesuaikan waktu lokal user
- Motivasi harian yang berubah berdasarkan tanggal
- Jam realtime di panel utama
- Google search langsung dari halaman utama tanpa perlu buka halaman Google dulu
- Task board sederhana dengan fitur tambah, edit, hapus, dan tandai selesai
- Akses cepat ke data browser seperti `Downloads`, `Bookmarks`, dan `History`

## Struktur Project

Project ini dibuat sesederhana mungkin supaya mudah dipasang dan dirawat.

```text
manifest.json
newtab.html
dashboard.css
dashboard.js
LICENSE
README.md
```

## Cara Pasang di Chrome

1. Clone atau download repository ini ke komputer.
2. Buka `chrome://extensions`.
3. Aktifkan `Developer mode`.
4. Klik `Load unpacked`.
5. Pilih folder project ini.
6. Buka tab baru untuk menjalankan Fira.

## Cara Pakai

Saat pertama kali dibuka, Fira akan meminta nama dan zona waktu user.
Setelah itu, halaman new tab akan langsung menampilkan workspace utama yang sudah personal.

Di halaman utama, user bisa:

- melakukan pencarian Google langsung dari panel utama;
- mencatat task harian di task board;
- membuka bookmarks, downloads, atau history dari panel navigasi;
- melihat jam realtime sesuai zona waktu yang dipilih saat onboarding.

## Penyimpanan Data

Fira menyimpan data lokal menggunakan `chrome.storage.local` untuk kebutuhan berikut:

- nama user;
- zona waktu user;
- daftar task pada task board.

Data tersebut digunakan hanya untuk pengalaman penggunaan di browser yang memasang extension ini.

## Izin Extension

Fira menggunakan beberapa permission Chrome untuk mendukung fitur yang tersedia:

- `storage` untuk menyimpan profil user dan task board
- `tabs` untuk navigasi yang membutuhkan interaksi tab
- `bookmarks` untuk menampilkan bookmark user
- `downloads` untuk menampilkan riwayat download
- `history` untuk menampilkan riwayat browsing

## Catatan Lisensi

Repository ini menggunakan lisensi proprietari. Artinya, repository ini dapat dilihat secara
publik, tetapi tidak otomatis memberi izin untuk menyalin, memodifikasi, mendistribusikan,
menjual, merebrand, atau mengklaim karya ini sebagai milik pihak lain.

Silakan baca file `LICENSE` untuk ketentuan lengkap.
