-- =============================================
-- SEED DATA: Categories
-- =============================================
insert into categories (name, slug, platform, icon, description) values
  ('Tăng tương tác', 'tang-tuong-tac', 'facebook', '🔥', 'Các thủ thuật tăng like, comment, share trên Facebook'),
  ('Kiếm tiền', 'kiem-tien', 'facebook', '💰', 'Hướng dẫn monetize Facebook page và profile'),
  ('Quảng cáo', 'quang-cao', 'facebook', '📢', 'Mẹo chạy Facebook Ads hiệu quả'),
  ('Tăng follower', 'tang-follower', 'tiktok', '👥', 'Cách tăng follower TikTok nhanh chóng'),
  ('Viral content', 'viral-content', 'tiktok', '🚀', 'Bí quyết tạo video viral trên TikTok'),
  ('TikTok Shop', 'tiktok-shop', 'tiktok', '🛒', 'Hướng dẫn bán hàng trên TikTok Shop'),
  ('Reels', 'reels', 'instagram', '🎬', 'Mẹo tạo Reels triệu view'),
  ('Stories', 'stories', 'instagram', '📱', 'Cách dùng Instagram Stories hiệu quả'),
  ('Hashtag', 'hashtag', 'instagram', '#️⃣', 'Chiến lược hashtag Instagram'),
  ('SEO YouTube', 'seo-youtube', 'youtube', '🔍', 'Tối ưu SEO cho video YouTube'),
  ('Monetize', 'monetize', 'youtube', '💵', 'Cách kiếm tiền từ YouTube'),
  ('Thumbnail', 'thumbnail', 'youtube', '🖼️', 'Thiết kế thumbnail thu hút click')
on conflict (slug) do nothing;

-- =============================================
-- SEED DATA: Tags
-- =============================================
insert into tags (name, slug) values
  ('facebook', 'facebook'),
  ('tiktok', 'tiktok'),
  ('instagram', 'instagram'),
  ('youtube', 'youtube'),
  ('tăng-follower', 'tang-follower'),
  ('kiếm-tiền', 'kiem-tien'),
  ('viral', 'viral'),
  ('quảng-cáo', 'quang-cao'),
  ('content', 'content'),
  ('seo', 'seo'),
  ('reels', 'reels'),
  ('shorts', 'shorts'),
  ('live-stream', 'live-stream'),
  ('affiliate', 'affiliate'),
  ('dropshipping', 'dropshipping')
on conflict (slug) do nothing;
