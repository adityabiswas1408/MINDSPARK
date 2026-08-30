ALTER TABLE levels ADD CONSTRAINT unique_institution_sequence_order UNIQUE (institution_id, sequence_order);
