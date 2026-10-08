CREATE TABLE IF NOT EXISTS yumenari_students (
  clerk_user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 160),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 32),
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Laki-laki', 'Perempuan')),
  address TEXT NOT NULL CHECK (char_length(address) BETWEEN 5 AND 1000),
  education TEXT NOT NULL CHECK (education IN (
    'SMP/sederajat',
    'SMA/SMK/sederajat',
    'Diploma',
    'Sarjana',
    'Lainnya'
  )),
  program TEXT NOT NULL CHECK (program IN (
    'Bahasa Jepang dan kaiwa',
    'Persiapan kerja Jepang',
    'Persiapan JFT/JLPT',
    'Persiapan interview dan budaya kerja',
    'Program terkait SSW/Tokutei Ginou'
  )),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS yumenari_students_updated_at_idx
  ON yumenari_students (updated_at DESC);
