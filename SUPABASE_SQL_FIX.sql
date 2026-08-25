-- RUN THIS IN SUPABASE DASHBOARD > SQL EDITOR
-- This creates a server-side function that bypasses RLS for marking ads as sold

CREATE OR REPLACE FUNCTION mark_ad_sold(p_ad_id BIGINT, p_wallet TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with owner privileges, bypasses RLS
AS $$
DECLARE
  v_result JSONB;
  v_ad RECORD;
BEGIN
  -- Verify the ad exists and belongs to this wallet
  SELECT id, seller_address, status INTO v_ad
  FROM listings
  WHERE id = p_ad_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ad not found');
  END IF;

  IF LOWER(v_ad.seller_address) != LOWER(p_wallet) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your ad');
  END IF;

  IF v_ad.status = 'sold' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already sold');
  END IF;

  -- Update status to sold
  UPDATE listings SET status = 'sold' WHERE id = p_ad_id;

  RETURN jsonb_build_object('success', true, 'message', 'Marked as sold');
END;
$$;

-- Also fix RLS policies so direct updates work for own ads
-- (Alternative: if you prefer client-side updates, run this instead)
-- ALTER POLICY listings_update ON listings
--   USING (seller_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');
