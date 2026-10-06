import { db } from './index';
import { employeeProfiles, wilayah } from './schema';
import { SERVICE_PRINCIPAL_ID } from '@kit/types';

// Seed data dummy untuk development/test — ATURAN (lihat .ai/database.md § Environment & Seed):
// dilarang berisi data pribadi asli atau secret. created_by/updated_by = service principal.
// Idempotent: baris dengan code/nip yang sama akan di-skip (onConflictDoNothing).

const WILAYAH_PROVINSI = [
  { code: '11', name: 'Aceh' },
  { code: '12', name: 'Sumatera Utara' },
  { code: '31', name: 'DKI Jakarta' },
  { code: '32', name: 'Jawa Barat' },
  { code: '33', name: 'Jawa Tengah' },
  { code: '34', name: 'DI Yogyakarta' },
  { code: '35', name: 'Jawa Timur' },
  { code: '61', name: 'Kalimantan Barat' },
  { code: '71', name: 'Sulawesi Utara' },
  { code: '91', name: 'Papua' },
];

// NIP dummy format 18-digit (bukan NIP asli siapa pun).
const PEGAWAI_DUMMY = [
  { nip: '198501012010011001', name: 'Budi Santoso', email: 'budi.santoso@example.go.id', status: 'ACTIVE' },
  { nip: '199003152015021002', name: 'Siti Aminah', email: 'siti.aminah@example.go.id', status: 'ACTIVE' },
  { nip: '199212202019031003', name: 'Ahmad Fauzi', email: 'ahmad.fauzi@example.go.id', status: 'ACTIVE' },
  { nip: '198807072014041004', name: 'Dewi Lestari', email: 'dewi.lestari@example.go.id', status: 'ACTIVE' },
  { nip: '199511112020051005', name: 'Rudi Hartono', email: 'rudi.hartono@example.go.id', status: 'INACTIVE' },
];

async function main() {
  console.log('Menjalankan seed data dummy (wilayah BPS + pegawai contoh)...');

  const wilayahRows = WILAYAH_PROVINSI.map((row) => ({
    ...row,
    source: 'BPS',
    sourceVersion: '2024.1',
    validFrom: '2024-01-01',
  }));

  await db.insert(wilayah).values(wilayahRows).onConflictDoNothing({ target: wilayah.code });

  await db
    .insert(employeeProfiles)
    .values(
      PEGAWAI_DUMMY.map((pegawai) => ({
        ...pegawai,
        createdBy: SERVICE_PRINCIPAL_ID,
        updatedBy: SERVICE_PRINCIPAL_ID,
      }))
    )
    .onConflictDoNothing({ target: employeeProfiles.nip });

  console.log(
    `Seed selesai: ${wilayahRows.length} wilayah + ${PEGAWAI_DUMMY.length} pegawai dummy (duplikat di-skip).`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Seed gagal:', err);
    process.exit(1);
  });