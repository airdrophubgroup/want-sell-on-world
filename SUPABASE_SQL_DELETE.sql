-- ===================================================
-- WantSell: Ad Delete RPC Function
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ===================================================
-- This lets users delete their own ads from the app.
-- Only soft-deletes (sets status='deleted'), SOW coins are NEVER touched.
-- Admin panel and Home feed will not show deleted ads.
-- ===================================================

CREATE OR REPLACE FUNCTION delete_ad(p_ad_id BIGINT, p_wallet TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- runs with elevated privileges, bypasses RLS
AS $$
DECLARE
  v_ad RECORD;
BEGIN
  -- Find the ad
  SELECT id, seller_address, status INTO v_ad
  FROM listings WHERE id = p_ad_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ad not found');
  END IF;

  -- Ownership check — only the seller can delete their own ad
  IF LOWER(v_ad.seller_address) != LOWER(p_wallet) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your ad');
  END IF;

  -- Already deleted
  IF v_ad.status = 'deleted' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already deleted');
  END IF;

  -- Soft delete — set status to 'deleted'. Do NOT touch sow_balances.
  UPDATE listings SET status = 'deleted' WHERE id = p_ad_id;

  RETURN jsonb_build_object('success', true, 'message', 'Ad deleted');
END;
$$;

-- ===================================================
-- Also fix the admin stats count to exclude deleted ads
-- (optional but recommended)
-- ===================================================
-- The app currently does: .select('*', { count: 'exact', head: true })
-- which counts ALL rows including deleted.
-- The app code has been updated to add .neq('status', 'deleted')
-- so this SQL is just for cleanup.
-- ===================================================

-- To verify: check that deleted ads are hidden
-- SELECT id, title, status FROM listings WHERE status = 'deleted';
