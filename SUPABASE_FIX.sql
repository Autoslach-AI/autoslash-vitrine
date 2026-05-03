-- Vérifier les policies existantes
SELECT * FROM pg_policies WHERE tablename = 'enterprises';

-- Recréer la policy INSERT pour les prospects vitrine
CREATE POLICY "Public can insert prospects"
ON enterprises
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- S'assurer que RLS est activé avec la bonne policy
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
