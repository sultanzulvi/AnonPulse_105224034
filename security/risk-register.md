# Risk Register & Status Mitigasi — Milestone sec-0.2

Dokumen ini memperbarui **Risk Register Tugas 1** dengan status evaluasi kontrol nyata yang diimplementasikan pada **Tugas 2 Keamanan Komputasi dan Siber (Pekan 6)** untuk platform **AnonPulse**.

---

### 1. Kriteria Skoring Risiko
* **Likelihood (Kemungkinan):** 1 (Rendah), 2 (Sedang), 3 (Tinggi)
* **Impact (Dampak):** 1 (Rendah), 2 (Sedang), 3 (Tinggi)
* **Risk Score:** $\text{Likelihood} \times \text{Impact}$ [Low: 1–2, Medium: 3–4, High: 6–9].

---

### 2. Status Kontrol dan Mitigasi Risiko Prioritas

| ID Risiko | Ancaman Terkait (Tugas 1) | Skor Awal | Kontrol Mitigasi Nyata (Milestone sec-0.2) | Skor Residual | Status Evaluasi |
| :---: | :--- | :---: | :--- | :---: | :---: |
| **R-01** | **TH-08** (DoS Flooding Endpoint Pelaporan) | **6 (High)** | Validasi masukan sisi server ([`masukan.ts`](file:///src/lib/crypto/masukan.ts)) dengan batasan panjang karakter (10–10.000) dan normalisasi NFC; pembatasan resource container (`tmpfs 64M`, limit memori) pada [`compose.yaml`](file:///compose.yaml). | **2 (Low)** | **Terkendali** |
| **R-02** | **TH-09** (DoS & Enumerasi Tracking Token) | **6 (High)** | Digest hashing SHA-256 pada token database; penanganan rute `notFound()` Next.js 16 untuk mencegah kebocoran status; matriks akses peran terdokumentasi pada [`access-tests.md`](file:///security/access-tests.md). | **2 (Low)** | **Terkendali** |
| **R-03** | **TH-05** (Kebocoran Kunci Enkripsi Master) | **6 (High)** | Kunci disimpan strictly di luar repositori (`.env` dikecualikan oleh [`.gitignore`](file:///.gitignore)); implementasi HKDF (RFC 5869) untuk pemisahan domain kunci; container berjalan tanpa menyalin berkas `.env` ke image layer (`Dockerfile`). | **3 (Medium)** | **Terkendali** |
| **R-04** | **TH-01** (Brute-Force & Tebakan Akun Pengelola) | **6 (High)** | Implementasi penyimpanan hash lambat **scrypt** ($N=16384, r=8, p=1$) dengan perbandingan waktu konstan `timingSafeEqual` pada [`password.ts`](file:///src/lib/crypto/password.ts); pengerasan SSH VM menolak otentikasi password (`PasswordAuthentication no`). | **2 (Low)** | **Terkendali** |
| **R-05** | **TH-06** (Residu Data Sensitif Saat Panic Exit) | **6 (High)** | Penggunaan komponen [`PanicButton.tsx`](file:///src/components/ui/PanicButton.tsx) dengan pengalihan langsung (*hard redirect*) dan pembersihan sesi HTTP-only. | **2 (Low)** | **Terkendali** |
| **R-06** | **TH-10** (Privilege Escalation & Container Escape) | **3 (Med)** | Container hardening: proses berjalan sebagai non-root (`UID 1001`), pencabutan capability (`cap_drop: ALL`), pencegahan eskalasi (`no-new-privileges: true`), dan filesystem `read_only: true`. Indeks Lynis naik menjadi **78/100** ([`lynis-after.txt`](file:///security/lynis-after.txt)). | **1 (Low)** | **Terkendali** |

---

### 3. Penjelasan Lingkungan Pengujian
* **Platform Host:** Linux Ubuntu 24.04 LTS Kernel 6.8.
* **Container Engine:** Docker Engine v27 / Docker Compose v2.
* **Security Scanner:** Trivy v0.56.2 (DB Vulnerability terkini) & Lynis v3.1.2.
* **Hasil Verifikasi:**
  1. Kontrol akses menunjukkan seluruh percobaan akses tidak sah ditolak (5 positif & 5 negatif).
  2. Hasil scan image Trivy membuktikan 0 kerentanan *Critical* dan 0 *High* pada image produksi `anonpulse-app:latest`.
  3. Konfigurasi SSH hanya mengizinkan public key (`permitrootlogin no`, `passwordauthentication no`).

