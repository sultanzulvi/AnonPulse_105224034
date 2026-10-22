# Data Flow Diagram (DFD) Level-1 - AnonPulse

Diagram alir data berikut memetakan batasan kepercayaan (_trust boundary_), aliran data masuk/keluar, dan titik perlindungan kriptografi pada sistem AnonPulse.

### Visualisasi Diagram (Mermaid)

```mermaid
graph TD
    %% Trust Boundaries
    subgraph TB1 ["Trust Boundary 1: Untrusted Public Client Zone"]
        E1["E1: Pelapor / Korban (Browser)"]
        E2["E2: Pemantau Aduan (Browser)"]
    end

    subgraph TB2 ["Trust Boundary 2: Next.js Application Server Runtime"]
        P1["P1: Form Handler & Input Sanitizer (src/app/lapor)"]
        P2["P2: Crypto Engine (cipher.ts & hashing.ts)"]
        P3["P3: Status Tracker Controller (src/app/pantau)"]
    end

    subgraph TB3 ["Trust Boundary 3: Secure Data & Secret Storage Zone"]
        DS1[("DS1: Application Secret Store - env")]
        DS2[("DS2: Encrypted Report Records - mockReports.ts")]
    end

    %% Data Flows
    E1 -->|"DF-01: Raw Form Submission & Attachment"| P1
    P1 -->|"DF-02: Sanitized Payload & File Buffer"| P2
    DS1 -->|"DF-03: 256-bit Master Key APP_SECRET_KEY"| P2
    P2 -->|"DF-04: Ciphertext + Auth Tag + IV AES-256-GCM & Checksum SHA-256"| DS2
    P2 -->|"DF-05: Tracking Token Plaintext"| E1

    E2 -->|"DF-06: Raw Tracking Token Input"| P3
    P3 -->|"DF-07: Token String for Verification"| P2
    P2 -->|"DF-08: Computed Token Hash SHA-256"| P3
    P3 -->|"DF-09: Lookup Query by Token Hash"| DS2
    DS2 -->|"DF-10: Stored Ciphertext & Auth Tag"| P2
    P2 -->|"DF-11: Verified & Decrypted Report Status"| P3
    P3 -->|"DF-12: Display Sanitized Status Timeline"| E2
```

Struktur repositori AnonPulse Anda telah terverifikasi secara lengkap. File kode sumber inti (`cipher.ts`, `hashing.ts`, `mockReports.ts`, rute App Router, dan komponen UI) telah terpetakan dengan tepat sesuai arsitektur Next.js 16 dan Node native crypto.

Berikut adalah isi dokumen lengkap yang telah diselaraskan dengan struktur riil repositori Anda, siap disimpan dan di-commit untuk memenuhi seluruh butir penugasan.

---

### Keterangan Elemen DFD

1. **Entitas Eksternal (External Entities):**

- `E1`: Pelapor / Korban — Pengguna yang mengirimkan aduan via `/lapor`.
- `E2`: Pemantau Aduan — Pengguna yang meninjau tindak lanjut laporan via `/pantau`.

2. **Proses (Processes):**

- `P1`: Form Handler & Input Sanitizer — Memvalidasi isian form, memastikan tidak ada PII mentah, dan membatasi ukuran input.
- `P2`: Crypto Engine — Modul native crypto (`src/lib/crypto/cipher.ts` dan `hashing.ts`) yang mengeksekusi AES-256-GCM dan SHA-256 digest.
- `P3`: Status Tracker Controller — Menangani routing pelacakan status laporan berdasarkan token.

3. **Penyimpanan Data (Data Stores):**

- `DS1`: Application Secret Store — Penyimpanan environment variable server runtime untuk kunci enkripsi master.
- `DS2`: Encrypted Report Records — Media penyimpanan data aduan terlindungi enkripsi dan metadata hash.

4. **Batas Kepercayaan (Trust Boundaries):**

- **TB1 (Public/Untrusted Zone):** Lingkungan browser pengguna akhir yang rentan terhadap inspeksi fisik, cache lokal, dan serangan jaringan publik.
- **TB2 (Application Runtime Zone):** Proses internal Next.js server tempat logika bisnis dan operasi kriptografi dieksekusi.
- **TB3 (Storage/Secret Zone):** Zona isolasi data terenkripsi dan kunci rahasia internal.
