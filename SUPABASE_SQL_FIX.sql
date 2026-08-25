-- ============================================
-- RUN THIS IN SUPABASE DASHBOARD > SQL EDITOR
-- This fixes the "Mark as Sold" button error
-- ============================================

CREATE OR REPLACE FUNCTION mark_ad_sold(p_ad_id BIGINT, p_wallet TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ad RECORD;
BEGIN
  SELECT id, seller_address, status INTO v_ad
  FROM listings WHERE id = p_ad_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ad not found');
  END IF;

  IF LOWER(v_ad.seller_address) != LOWER(p_wallet) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your ad');
  END IF;

  IF v_ad.status = 'sold' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already sold');
  END IF;

  UPDATE listings SET status = 'sold' WHERE id = p_ad_id;
  RETURN jsonb_build_object('success', true, 'message', 'Marked as sold');
END;
$$;
