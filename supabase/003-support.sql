-- ============================================================
--  003-SUPPORT.SQL - Sistema de apoyo/suscripción
--  Tabla copero_support: registra el plan de apoyo activo
--  por cuenta. RLS: cada usuario solo ve su propia fila.
-- ============================================================

-- Tabla de apoyos
CREATE TABLE IF NOT EXISTS copero_support (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'basico' CHECK (plan IN ('basico', 'premium')),
  active boolean NOT NULL DEFAULT true,
  started_at timestamptz NOT NULL DEFAULT now(),
  -- Metadatos para referencia del pagador (opcional)
  payment_ref text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para búsquedas rápidas por plan activo
CREATE INDEX IF NOT EXISTS idx_copero_support_active ON copero_support (active) WHERE active;

-- RLS: solo el dueño puede ver y actualizar su fila
ALTER TABLE copero_support ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_support" ON copero_support
  FOR SELECT USING (auth.uid() = user_id);

-- Solo se puede crear o actualizar la fila propia
CREATE POLICY "insert_own_support" ON copero_support
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_support" ON copero_support
  FOR UPDATE USING (auth.uid() = user_id);

-- Sin DELETE: la administración se hace desde el dashboard

-- COMMENT para documentar
COMMENT ON TABLE copero_support IS 'Planes de apoyo: basico (1 USD/mes) y premium (3 USD/mes). RLS: solo el dueño accede.';
COMMENT ON COLUMN copero_support.plan IS 'Plan activo: basico o premium';
COMMENT ON COLUMN copero_support.active IS 'true si la suscripción está activa';
