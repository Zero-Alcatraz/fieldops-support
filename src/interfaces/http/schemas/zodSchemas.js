import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const createIncidentSchema = z.object({
  title: z.string().min(5, 'El título del incidente debe tener al menos 5 caracteres'),
  severity: z.enum(['P1', 'P2', 'P3', 'P4'], {
    errorMap: () => ({ message: 'La severidad debe ser P1, P2, P3 o P4' })
  }),
  customerName: z.string().min(3, 'El nombre de cliente o sede es obligatorio'),
  location: z.string().optional(),
  deviceType: z.string().default('ROUTER'),
  ipAddress: z.string().optional().nullable(),
  technicianId: z.string().optional().nullable()
});

export const runDiagnosticSchema = z.object({
  incidentId: z.string().min(1, 'ID de incidente obligatorio'),
  skillCode: z.string().min(1, 'Código de skill técnica obligatoria'),
  symptom: z.string().min(5, 'El síntoma reportado debe contener al menos 5 caracteres'),
  probableRootCause: z.string().min(5, 'La causa raíz probable debe contener al menos 5 caracteres'),
  testsPerformed: z.string().min(5, 'Debe especificar los comandos y pruebas técnicas realizadas'),
  actionApplied: z.string().min(5, 'Debe especificar la acción técnica aplicada'),
  checklistResults: z.array(z.any()).optional().default([]),
  networkMetrics: z.record(z.any()).optional().default({}),
  resolveIncident: z.boolean().optional().default(false)
});

export const escalateIncidentSchema = z.object({
  incidentId: z.string().min(1, 'ID de incidente obligatorio'),
  targetLevel: z.enum(['L2_ESPECIALISTA', 'L3_INGENIERIA_RED', 'PROVEEDOR_ISP', 'GARANTIA_HARDWARE'], {
    errorMap: () => ({ message: 'Nivel de escalamiento no válido' })
  }),
  reason: z.string().min(10, 'La justificación del escalado debe tener mínimo 10 caracteres explicativos'),
  evidence: z.object({
    pingTest: z.string().min(3, 'Evidencia de ping cuantitativo requerida').optional(),
    ipConfig: z.string().min(3, 'Evidencia de ipconfig requerida').optional(),
    tracerouteTest: z.string().min(3, 'Evidencia de trazado tracert requerida').optional()
  }).refine((ev) => {
    // Al menos 2 evidencias requeridas según especificación FieldOps
    const count = Object.values(ev).filter(v => v && String(v).trim().length > 3).length;
    return count >= 2;
  }, {
    message: 'Debe adjuntar al menos 2 evidencias técnicas válidas (pingTest, ipConfig, tracerouteTest)'
  })
});
