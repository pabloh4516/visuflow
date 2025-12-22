-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own bot detections" ON bot_detections;
DROP POLICY IF EXISTS "Users can delete own bot detections" ON bot_detections;

-- Criar nova política SELECT que verifica através da página
CREATE POLICY "Users can view own bot detections through page" ON bot_detections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM generated_pages gp
    WHERE gp.id = bot_detections.page_id
    AND gp.user_id = auth.uid()
  )
);

-- Criar nova política DELETE que verifica através da página
CREATE POLICY "Users can delete own bot detections through page" ON bot_detections
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM generated_pages gp
    WHERE gp.id = bot_detections.page_id
    AND gp.user_id = auth.uid()
  )
);