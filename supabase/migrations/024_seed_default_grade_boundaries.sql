CREATE OR REPLACE FUNCTION seed_default_grade_boundaries()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO grade_boundaries (institution_id, grade_name, min_percentage, color_hex)
  VALUES
    (NEW.id, 'O', 90, '#22c55e'),
    (NEW.id, 'A+', 80, '#3b82f6'),
    (NEW.id, 'A', 70, '#eab308'),
    (NEW.id, 'B', 60, '#f97316'),
    (NEW.id, 'C', 50, '#ef4444');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_institution_created
AFTER INSERT ON institutions
FOR EACH ROW EXECUTE FUNCTION seed_default_grade_boundaries();
