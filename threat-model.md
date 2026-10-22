### 3. `threat-model.md`

Simpan berkas ini di root repositori:

| ID        | STRIDE                     | Elemen DFD       | Aset Terdampak | Deskripsi Ancaman                                                                                                                     |
| :-------- | :------------------------- | :--------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **TH-01** | **S**poofing               | `E2`, `DF-06`    | AST-02, AST-06 | Aktor jahat melakukan brute-force atau menebak tracking token secara acak untuk memalsukan hak akses laporan orang lain.              |
| **TH-02** | **T**ampering              | `DF-04`, `DS2`   | AST-01, AST-05 | Penyerang memanipulasi _ciphertext_ atau _auth tag_ laporan di penyimpanan data untuk merusak catatan bukti insiden.                  |
| **TH-03** | **T**ampering              | `DF-01`, `DF-02` | AST-03         | Aktor memodifikasi berkas lampiran saat transmisi data sebelum digest SHA-256 dihasilkan oleh server.                                 |
| **TH-04** | **R**epudiation            | `P1`, `P2`       | AST-01, AST-06 | Pelapor menyangkal telah mengirimkan laporan tertentu karena sistem beroperasi secara murni Zero-PII tanpa autentikasi akun.          |
| **TH-05** | **I**nformation Disclosure | `DS1`, `DF-03`   | AST-04         | Kunci master AES (`APP_SECRET_KEY`) bocor akibat hardcode ke git, dump environment variable, atau path traversal.                     |
| **TH-06** | **I**nformation Disclosure | `TB1`, `E1`      | AST-01, AST-08 | Pengamat lokal (_shoulder surfing_) membaca draf aduan sebelum pelapor sempat menekan tombol darurat `QuickExitButton`.               |
| **TH-07** | **I**nformation Disclosure | `P2`, `DF-04`    | AST-01         | Penggunaan IV (_Initialization Vector_) yang sama berulang kali (_IV reuse_) pada kunci simetris yang membocorkan pola enkripsi.      |
| **TH-08** | **D**enial of Service      | `P1`, `TB2`      | AST-06, AST-07 | Penyerang membanjiri rute `/lapor` dengan request JSON raksasa atau file besar sehingga kapasitas memori server habis.                |
| **TH-09** | **D**enial of Service      | `P3`, `DF-06`    | AST-06, AST-07 | Eksploitasi query otomatis pada rute `/pantau` tanpa pembatasan frekuensi (_rate limit_) yang menguras sumber daya komputasi SHA-256. |
| **TH-10** | **E**levation of Privilege | `P1`, `P3`       | AST-06, AST-07 | Penyerang memanfaatkan celah injeksi parameter formulir atau prototype pollution pada Next.js untuk mendapatkan akses data server.    |
