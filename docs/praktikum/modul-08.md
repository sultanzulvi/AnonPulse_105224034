# Dokumen Teknis Modul 8 — RESTful API dan OpenAPI 3.1

Nama : Sultan Zulvi Risda  
NIM : 105224034  
Produk : AnonPulse  
Repositori : https://github.com/sultanzulvi/AnonPulse_105224034  
Pull Request : `[Isi dengan tautan PR praktikum/modul-08 ke main]`

---

## 1. Daftar Endpoint RESTful API (`/api/v1`)

| No | Method | Path | Berkas Route Handler | Deskripsi Operasi | Status HTTP |
| :-: | :---: | :--- | :--- | :--- | :--- |
| **1** | `GET` | `/api/v1/laporan` | [`src/app/api/v1/laporan/route.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/api/v1/laporan/route.ts) | Mengambil daftar laporan dengan paginasi (`halaman`, `batas` maks 50), filter `kategori`, dan `meta.total` | `200`, `400` |
| **2** | `POST` | `/api/v1/laporan` | [`src/app/api/v1/laporan/route.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/api/v1/laporan/route.ts) | Membuat laporan baru, menerbitkan token unik, dan menyertakan header `Location` | `201`, `400`, `409`, `422` |
| **3** | `GET` | `/api/v1/laporan/{id}` | [`src/app/api/v1/laporan/[id]/route.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/api/v1/laporan/%5Bid%5D/route.ts) | Mengambil detail satu laporan berdasarkan ID bulat positif | `200`, `400`, `404` |
| **4** | `PATCH` | `/api/v1/laporan/{id}` | [`src/app/api/v1/laporan/[id]/route.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/api/v1/laporan/%5Bid%5D/route.ts) | Memperbarui sebagian atribut laporan (minimal 1 field) | `200`, `400`, `404`, `409`, `422` |
| **5** | `DELETE` | `/api/v1/laporan/{id}` | [`src/app/api/v1/laporan/[id]/route.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/api/v1/laporan/%5Bid%5D/route.ts) | Menghapus laporan yang belum memiliki riwayat tindak lanjut | `204`, `400`, `404`, `409` |
| **6** | `GET` | `/api/v1/laporan/{id}/tindak-lanjut` | [`src/app/api/v1/laporan/[id]/tindak-lanjut/route.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/app/api/v1/laporan/%5Bid%5D/tindak-lanjut/route.ts) | Mengambil daftar riwayat tindak lanjut milik satu laporan | `200`, `400`, `404` |

*(Catatan: Metode `PUT` tidak diimplementasikan pada `/api/v1/laporan/{id}`, sehingga Next.js otomatis mengembalikan `405 Method Not Allowed` beserta header `Allow: GET, HEAD, PATCH, DELETE`).*

---

## 2. Validasi Zod dan Problem Details (RFC 9457)

1. **Skema Validasi ([`src/lib/skema.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/lib/skema.ts)):**
   - `skemaKueriLaporan`: `halaman` ($\ge 1$, default `1`), `batas` ($1\text{–}50$, default `10`), dan `kategori` opsional sesuai enum `KategoriLaporan`.
   - `skemaPostLaporan`: `judul` (5–100 karakter), `kategori`, `deskripsi` (10–1000 karakter), `lokasiKejadian` (default `"Lingkungan Kampus"`), `tanggalKejadian`, `tersedia`, `lampiran`.
   - `skemaPatchLaporan`: Seluruh field bersifat `.optional()`, ditambah `.refine((obj) => Object.keys(obj).length > 0)` untuk menolak body kosong `{}` dengan status `422`.
2. **Helper Problem Details ([`src/lib/problem.ts`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/src/lib/problem.ts)):**
   - Seluruh respons galat menggunakan `Content-Type: application/problem+json` dengan struktur `{ type: "about:blank", title, status, detail, errors }`.
   - `bacaId(rawId)`: Memvalidasi path parameter `id` dengan regex `/^[1-9]\d*$/` (`400 Bad Request` bila `abc`, `0`, atau negatif).
   - `bacaJson(request)`: Menangkap sintaks JSON rusak dengan `400 Bad Request`.
   - `problemValidasi(error)`: Mengembalikan `422 Unprocessable Content` untuk pelanggaran aturan semantik Zod pada body JSON.

### Contoh Respons Error RFC 9457 (`422 Unprocessable Content`):
```json
{
  "type": "about:blank",
  "title": "Unprocessable Content",
  "status": 422,
  "detail": "Isi permintaan tidak memenuhi aturan validasi.",
  "errors": {
    "judul": ["Judul minimal 5 karakter"]
  }
}
```

---

## 3. Spesifikasi OpenAPI 3.1.0

- Berkas spesifikasi: [`docs/api/openapi.yaml`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/docs/api/openapi.yaml)
- Konfigurasi linter: [`redocly.yaml`](file:///c:/Kuliah/Sem5/Aplikasi/anonpulse/redocly.yaml)
- Perintah verifikasi & pembangkitan dokumentasi HTML:
  ```bash
  npx @redocly/cli lint docs/api/openapi.yaml
  npx @redocly/cli build-docs docs/api/openapi.yaml -o docs/api/index.html
  ```

---

## 4. Skenario Pengujian Manual (`curl` & Bruno / Thunder Client)

### Daftar Perintah `curl` Siap Uji:

```bash
# 1. GET koleksi dengan batas=2 (Target: 200)
curl -i "http://localhost:3000/api/v1/laporan?halaman=1&batas=2"

# 2. GET koleksi dengan batas=500 melebihi maksimum 50 (Target: 400)
curl -i "http://localhost:3000/api/v1/laporan?batas=500"

# 3. GET detail laporan ID=1 valid (Target: 200)
curl -i "http://localhost:3000/api/v1/laporan/1"

# 4. GET detail laporan ID=abc tidak valid (Target: 400)
curl -i "http://localhost:3000/api/v1/laporan/abc"

# 5. GET detail laporan ID=99999 tidak ada (Target: 404)
curl -i "http://localhost:3000/api/v1/laporan/99999"

# 6. POST buat laporan baru valid (Target: 201 + Header Location)
curl -i -X POST "http://localhost:3000/api/v1/laporan" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Insiden Uji REST API Modul 8","kategori":"fasilitas","deskripsi":"Lampu penerangan jalan menuju gedung laboratorium padam total.","lokasiKejadian":"Jalan Utama Lab"}'

# 7. POST dengan sintaks JSON rusak (Target: 400)
curl -i -X POST "http://localhost:3000/api/v1/laporan" \
  -H "Content-Type: application/json" \
  -d '{"judul": "JSON Rusak"'

# 8. POST dengan isi tidak valid / judul terlalu pendek (Target: 422)
curl -i -X POST "http://localhost:3000/api/v1/laporan" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Abc","kategori":"fasilitas","deskripsi":"Pendek"}'

# 9. PATCH ubah sebagian field laporan ID=1 (Target: 200)
curl -i -X PATCH "http://localhost:3000/api/v1/laporan/1" \
  -H "Content-Type: application/json" \
  -d '{"tersedia":false}'

# 10. PATCH dengan objek kosong {} (Target: 422)
curl -i -X PATCH "http://localhost:3000/api/v1/laporan/1" \
  -H "Content-Type: application/json" \
  -d '{}'

# 11. DELETE laporan baru tanpa relasi tindak lanjut (Ganti <ID_BARU> dengan ID hasil POST nomor 6, Target: 204)
curl -i -X DELETE "http://localhost:3000/api/v1/laporan/<ID_BARU>"

# 12. DELETE ulang ID yang sudah dihapus pada nomor 11 (Target: 404)
curl -i -X DELETE "http://localhost:3000/api/v1/laporan/<ID_BARU>"

# 13. DELETE laporan ID=1 yang masih memiliki riwayat tindak lanjut (Target: 409)
curl -i -X DELETE "http://localhost:3000/api/v1/laporan/1"

# 14. GET daftar tindak lanjut pada laporan ID=1 (Target: 200)
curl -i "http://localhost:3000/api/v1/laporan/1/tindak-lanjut"

# 15. PUT pada detail laporan ID=1 (Target: 405 Method Not Allowed)
curl -i -X PUT "http://localhost:3000/api/v1/laporan/1" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Ganti Semua"}'
```

### Tabel Hasil Pengujian (15 Skenario):

| No | Permintaan | Target (Expected) | Hasil Aktual (Actual) | Status (Pass/Fail) | Pengujian Bruno / Thunder Client |
| :-: | :--- | :---: | :---: | :---: | :--- |
| **1** | `GET /api/v1/laporan?batas=2` | `200` | | | Assertion `res.status == 200` |
| **2** | `GET /api/v1/laporan?batas=500` | `400` | | | Assertion `res.status == 400` |
| **3** | `GET /api/v1/laporan/1` | `200` | | | Assertion `res.status == 200` |
| **4** | `GET /api/v1/laporan/abc` | `400` | | | |
| **5** | `GET /api/v1/laporan/99999` | `404` | | | Assertion `res.status == 404` |
| **6** | `POST /api/v1/laporan` (valid) | `201` | | | Assertion `res.status == 201` & header `Location` |
| **7** | `POST /api/v1/laporan` (JSON rusak) | `400` | | | |
| **8** | `POST /api/v1/laporan` (isi invalid) | `422` | | | Assertion `res.status == 422` |
| **9** | `PATCH /api/v1/laporan/1` (valid) | `200` | | | |
| **10** | `PATCH /api/v1/laporan/1` (`{}`) | `422` | | | |
| **11** | `DELETE /api/v1/laporan/<ID_BARU>` (tanpa relasi) | `204` | | | |
| **12** | `DELETE /api/v1/laporan/<ID_BARU>` (ulang) | `404` | | | |
| **13** | `DELETE /api/v1/laporan/1` (dengan relasi) | `409` | | | Assertion `res.status == 409` |
| **14** | `GET /api/v1/laporan/1/tindak-lanjut` | `200` | | | |
| **15** | `PUT /api/v1/laporan/1` | `405` | | | |

---

## 5. Keputusan Teknis

1. **Pemisahan Status `400 Bad Request` vs `422 Unprocessable Content`:**
   - `400 Bad Request` digunakan ketika server tidak dapat memahami struktur permintaan pada tingkat sintaks atau parameter URL (misalnya JSON terpotong, parameter path `id=abc`, atau query `batas=500`).
   - `422 Unprocessable Content` digunakan ketika sintaks JSON valid, namun nilai atribut di dalam body melanggar aturan bisnis/skema domain (misalnya `judul` kurang dari 5 karakter atau objek `PATCH {}` kosong).
2. **Penanganan Konflik Relasi `409 Conflict` pada `DELETE /api/v1/laporan/{id}`:**
   - Skema Prisma menggunakan `onDelete: Restrict` pada foreign key `TindakLanjut.laporanId`. Pada endpoint REST `DELETE /api/v1/laporan/{id}`, server memeriksa `prisma.tindakLanjut.count({ where: { laporanId: id } })` terlebih dahulu dan mengembalikan `409 Conflict` bila laporan masih memiliki riwayat investigasi aktif, sehingga penghapusan lewat API tidak melenyapkan rekam jejak investigasi secara diam-diam.
3. **Penggunaan `PATCH` dibanding `PUT`:**
   - `PATCH` memungkinkan pembaruan sebagian field (misalnya hanya mengubah `tersedia: false` atau `deskripsi`), sedangkan `PUT` mewajibkan penggantian seluruh representasi resource.

---

## 6. Catatan Pemanfaatan AI

- **Alat:** Antigravity (Google DeepMind)
- **Perintah Utama:**
  1. Menginspeksi struktur repositori secara *read-only* (Prompt 0) untuk memetakan model `Laporan` dan `TindakLanjut`.
  2. Melengkapi helper Problem Details RFC 9457 (`src/lib/problem.ts`) dan skema validasi Zod (`src/lib/skema.ts`).
  3. Mengimplementasikan 6 operasi RESTful API pada `src/app/api/v1/laporan/route.ts`, `src/app/api/v1/laporan/[id]/route.ts`, dan `src/app/api/v1/laporan/[id]/tindak-lanjut/route.ts`.
  4. Menyusun spesifikasi OpenAPI 3.1.0 (`docs/api/openapi.yaml`), `redocly.yaml`, dan dokumen teknis `docs/praktikum/modul-08.md`.
- **Cara Verifikasi:**
  - `npx tsc --noEmit` (**0 error**)
  - `npm run lint` (`eslint src`) (**0 error**)
