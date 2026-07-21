-- ============================================================================
-- TAHAP 59 - ROLE KURIR (akun khusus, cuma bisa akses Proses Pengiriman)
-- ============================================================================

-- Izinkan role baru 'kurir' di tabel profiles
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role = any (array['owner','admin_transaksi','admin_keuangan','sales','kurir']));

-- Izinkan kurir BACA order yang relevan buat pengiriman (menunggu_pengiriman,
-- proses_dikirim, dan yang sudah selesai buat riwayat singkat)
do $$ begin
  create policy "kurir_lihat_order_pengiriman" on orders for select
    using (my_role() = 'kurir');
exception when duplicate_object then null; end $$;

-- Izinkan kurir UPDATE status order (menandai sudah dikirim / selesai)
do $$ begin
  create policy "kurir_update_status_order" on orders for update
    using (my_role() = 'kurir')
    with check (my_role() = 'kurir');
exception when duplicate_object then null; end $$;

-- Kurir juga perlu baca data toko (nama, alamat, telp) buat tau tujuan kirim
do $$ begin
  create policy "kurir_lihat_client" on clients for select
    using (my_role() = 'kurir');
exception when duplicate_object then null; end $$;

-- Kurir perlu baca order_items & products (buat lihat rincian barang yang dikirim)
do $$ begin
  create policy "kurir_lihat_order_items" on order_items for select
    using (my_role() = 'kurir');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "kurir_lihat_products" on products for select
    using (my_role() = 'kurir');
exception when duplicate_object then null; end $$;

-- Owner perlu bisa lihat SEMUA profil staff (bukan cuma profilnya sendiri)
-- untuk menu Kelola Akun Staff
do $$ begin
  create policy "owner_lihat_semua_profiles" on profiles for select
    using (my_role() = 'owner');
exception when duplicate_object then null; end $$;
