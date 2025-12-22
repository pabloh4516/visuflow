-- Corrigir registros históricos com razões informativas incorretamente marcados como bloqueados
UPDATE bot_detections
SET blocked = false
WHERE blocked = true
AND detection_reason IN (
  'timing_no_precision',
  'webgl_no_debug', 
  'audio_anomaly',
  'no_permissions_api',
  'fingerprint_only'
);