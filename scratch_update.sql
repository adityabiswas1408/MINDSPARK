CREATE OR REPLACE FUNCTION test_raw_update(p_id UUID, p_table TEXT, p_col TEXT, p_val BOOLEAN) RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE %I SET %I = %L WHERE id = %L', p_table, p_col, p_val, p_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
