# Catatan Teknis Verifikasi Hardening Sistem & Container (Tugas 2 KKS)

Dokumen ini memuat bukti perintah dan hasil pengujian (*proof of verification*) untuk hardening sistem operasi VM dan container runtime aplikasi **AnonPulse**.

---

## 1. Verifikasi Hardening SSH & Host VM

Sesuai instruksi persiapan evaluasi:
> `sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin'` menunjukkan nilai `no`.

### Eksekusi & Bukti Terminal:
```bash
$ sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin'
passwordauthentication no
permitrootlogin no
```

### Analisis Pengamanan:
1. **`permitrootlogin no`**: Mencegah penyerang menargetkan langsung akun `root` dengan hak tertinggi pada server.
2. **`passwordauthentication no`**: Menutup celah serangan *credential stuffing* dan *dictionary brute-force* berbasis password. Akses hanya diizinkan melalui pasangan kunci kriptografis (*SSH Ed25519/RSA Public Key*).
3. **Peningkatan Indeks Lynis**: Skor kepatuhan Lynis meningkat dari **58/100** ([`lynis-before.txt`](file:///security/lynis-before.txt)) menjadi **78/100** ([`lynis-after.txt`](file:///security/lynis-after.txt)), melampaui batas ambang kelulusan $\ge 70$.

---

## 2. Verifikasi Hardening Container Runtime

Pengujian dilakukan pada container aplikasi yang dijalankan via `compose.yaml`:

### A. Pengguna Non-Root (Least Privilege)
Memastikan proses Node.js aplikasi tidak berjalan sebagai `root` (UID 0):

```bash
$ docker compose exec app id
uid=1001(nextjs) gid=1001(nodejs) groups=1001(nodejs)
```
*Hasil:* Terbukti berjalan sebagai pengguna non-root terisolasi (`nextjs:1001`).

---

### B. Pembatasan Linux Capabilities (`cap_drop: ALL`)
Memeriksa status capability efektif proses utama container:

```bash
$ docker compose exec app grep CapEff /proc/1/status
CapEff: 0000000000000000
```
*Hasil:* Nilai `0000000000000000` membuktikan seluruh Linux capabilities (seperti `CAP_SYS_ADMIN`, `CAP_NET_RAW`, `CAP_SETUID`) telah dicabut secara tuntas.

---

### C. Uji Negatif Penulisan Filesystem (`read_only: true`)
Menguji ketahanan container terhadap upaya penulisan malware/web-shell ke dalam direktori aplikasi:

```bash
$ docker compose exec app touch /app/uji
touch: /app/uji: Read-only file system
```
*Hasil:* Ditolak (*Read-only file system*). Penyerang tidak dapat memodifikasi berkas aplikasi maupun menanam backdoor persisten pada container.

---

### D. Isolasi Basis Data (Tanpa Port Expose ke Host)
Memastikan port PostgreSQL 5432 tidak terekspos ke interface jaringan host VM atau internet publik:

```bash
$ sudo ss -tlpn | grep 5432
# (Tidak ada keluaran / output kosong)
```
*Hasil:* Port 5432 tertutup dari luar dan hanya dapat diakses melalui jaringan internal bridge Docker Compose (`anonpulse-internal`), mengurangi *attack surface* dari pemindaian port luar.

---

## 3. Matriks Keterkaitan Kontrol Hardening dengan Ancaman Tugas 1

| Komponen Hardening | Konfigurasi Utama | Ancaman yang Dimitigasi (Tugas 1) | Justifikasi |
| :--- | :--- | :--- | :--- |
| **Non-Root Container** | `user: "1001:1001"` | **TH-10 (Privilege Escalation Server)** | Jika aplikasi memiliki celah RCE, penyerang hanya terperangkap sebagai user `nextjs` tanpa hak akses kernel. |
| **Read-Only Filesystem** | `read_only: true` | **TH-03 (Modifikasi Berkas Digital)** & Web-Shell | Mencegah penyerang mengubah kode sumber atau menaruh malware biner di filesystem. |
| **Pencabutan Capabilities** | `cap_drop: ALL` | **Container Escape (NIST SP 800-190)** | Tanpa capabilities, eksploitasi kernel host dari dalam container digagalkan. |
| **Isolasi Port DB** | Tanpa `ports: 5432` | **TH-05 & TH-08 (Akses Langsung Basis Data)** | Basis data terlindung dari akses luar; hanya container backend yang terotorisasi yang dapat berkomunikasi. |
| **SSH Key-Only** | `PasswordAuthentication no` | **TH-01 (Brute-Force Kredensial Admin)** | Akses SSH tidak dapat diserang dengan tebakan kata sandi. |

