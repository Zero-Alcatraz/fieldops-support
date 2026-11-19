/**
 * Aplicación Frontend Principal - FieldOps & Support
 * Manejo reactivo del DOM, accesibilidad de teclado y validación en cliente.
 */

// Estado global de la interfaz
const state = {
  currentIncident: null,
  skillsList: [],
  currentSkill: null,
  decisionStepIndex: 0,
  activeReport: null
};

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupModals();
  setupForms();

  await initAuthentication();
  await loadInitialData();
});

// ==========================================================================
// 1. AUTENTICACIÓN Y ROLES RBAC
// ==========================================================================
async function initAuthentication() {
  if (!api.token) {
    try {
      // Login automático con usuario técnico demostrativo
      await api.login('tecnico1@fieldops.local', 'FieldOps2026!');
    } catch (err) {
      console.warn('No se pudo autenticar usuario por defecto:', err);
    }
  }

  updateUserDisplay();

  document.getElementById('btnSwitchUser').addEventListener('click', async () => {
    const roles = [
      { email: 'tecnico1@fieldops.local', label: 'Técnico en Campo (Andrés Morales)' },
      { email: 'mesa1@fieldops.local', label: 'HelpDesk L1 (Laura Gómez)' },
      { email: 'coordinador@fieldops.local', label: 'Coordinador Operativo (Carlos Mendoza)' },
      { email: 'admin@fieldops.local', label: 'Administrador General' }
    ];

    const currentEmail = api.currentUser?.email;
    const nextUser = roles.find(r => r.email !== currentEmail) || roles[0];

    try {
      await api.login(nextUser.email, 'FieldOps2026!');
      updateUserDisplay();
      showAlert(`Sesión cambiada a: ${nextUser.label}`, 'success');
      await loadInitialData();
    } catch (err) {
      showAlert(`Error al cambiar usuario: ${err.message}`, 'error');
    }
  });
}

function updateUserDisplay() {
  const user = api.currentUser;
  if (user) {
    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userRole').textContent = user.role.toUpperCase();
  } else {
    document.getElementById('userName').textContent = 'No autenticado';
    document.getElementById('userRole').textContent = 'OFFLINE';
  }
}

// ==========================================================================
// 2. NAVEGACIÓN POR PESTAÑAS (ACCESIBLE POR TECLADO)
// ==========================================================================
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanelId = tab.getAttribute('aria-controls');

      // Actualizar estado de tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Mostrar panel correspondiente
      document.querySelectorAll('.tab-content').forEach(panel => {
        panel.classList.remove('active');
      });
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Acciones por pestaña
      if (targetPanelId === 'tabReports') loadReports();
      if (targetPanelId === 'tabEscalations') loadEscalations();
      if (targetPanelId === 'tabQueue') loadQueueMetrics();
    });
  });
}

// ==========================================================================
// 3. CARGA DE DATOS INICIALES
// ==========================================================================
async function loadInitialData() {
  try {
    await Promise.all([loadSkills(), loadIncidents()]);
  } catch (err) {
    showAlert(`Error al cargar datos del servidor: ${err.message}`, 'error');
  }
}

async function loadSkills() {
  const skills = await api.getSkills();
  state.skillsList = skills;

  // Poblar select en el formulario de triaje
  const select = document.getElementById('selectSkillToApply');
  select.innerHTML = '';

  skills.forEach(skill => {
    const opt = document.createElement('option');
    opt.value = skill.code;
    opt.textContent = `${skill.code} - ${skill.title}`;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    selectSkill(select.value);
  });

  if (skills.length > 0) {
    selectSkill(skills[0].code);
  }

  renderSkillsCatalog(skills);
}

function selectSkill(code) {
  const skill = state.skillsList.find(s => s.code === code);
  if (!skill) return;

  state.currentSkill = skill;
  state.decisionStepIndex = 0;

  document.getElementById('skillSummaryText').textContent = skill.summary;
  renderDecisionTree(skill);
  renderReferenceCommands(skill);
}

async function loadIncidents() {
  const tbody = document.getElementById('incidentsTableBody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando incidentes...</td></tr>';

  try {
    const incidents = await api.getIncidents();
    tbody.innerHTML = '';

    if (incidents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay incidentes registrados.</td></tr>';
      return;
    }

    incidents.forEach(inc => {
      const tr = document.createElement('tr');
      const severityClass = `badge-${inc.severity.toLowerCase()}`;

      tr.innerHTML = `
        <td><strong>${inc.code}</strong></td>
        <td><span class="${severityClass}">${inc.severity} (${inc.getSlaHours ? inc.getSlaHours() : 'SLA'}h)</span></td>
        <td>
          <div style="font-weight: 600;">${inc.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${inc.title}</div>
        </td>
        <td><span class="user-badge" style="font-size: 0.75rem;">${inc.status}</span></td>
        <td>
          <button class="btn btn-primary btn-sm btn-select-inc" data-id="${inc.id}">
            Triaje
          </button>
        </td>
      `;

      tr.querySelector('.btn-select-inc').addEventListener('click', () => {
        selectIncident(inc);
      });

      tbody.appendChild(tr);
    });

    // Seleccionar automáticamente el primero si ninguno está seleccionado
    if (!state.currentIncident && incidents.length > 0) {
      selectIncident(incidents[0]);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: var(--color-danger); text-align: center;">Error: ${err.message}</td></tr>`;
  }
}

function selectIncident(inc) {
  state.currentIncident = inc;
  const badge = document.getElementById('selectedIncidentBadge');
  badge.className = `badge-${inc.severity.toLowerCase()}`;
  badge.textContent = `${inc.code} - ${inc.severity}`;

  // Pre-llenar campo de síntoma en el formulario de bitácora
  document.getElementById('diagSymptom').value = `Incidente en ${inc.customerName}: ${inc.title}. Dispositivo reportado: ${inc.deviceType} (${inc.ipAddress || 'IP por DHCP'}).`;

  // Asignar en modal de escalamiento
  document.getElementById('escIncidentId').value = inc.id;

  showAlert(`Incidente seleccionado: ${inc.code} (${inc.title})`, 'success');
}

// ==========================================================================
// 4. ÁRBOL DE DECISIÓN Y COMANDOS DE RED INTERACTIVOS
// ==========================================================================
function renderDecisionTree(skill) {
  const container = document.getElementById('decisionTreeContainer');
  container.innerHTML = '';

  const steps = skill.decisionTree || [];
  if (steps.length === 0) {
    container.innerHTML = '<p class="form-hint">Esta skill no contiene un árbol de decisión interactivo.</p>';
    return;
  }

  const currentStep = steps[state.decisionStepIndex] || steps[0];

  const card = document.createElement('div');
  card.className = 'decision-step-card';
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
      <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-primary); font-weight: 700;">
        Paso ${currentStep.step} de ${steps.length}
      </span>
      <span class="user-badge" style="font-size: 0.7rem;">Árbol de Decisión de Red</span>
    </div>
    <div class="decision-step-title">${currentStep.question}</div>
    <div class="decision-actions">
      <button class="btn btn-primary btn-sm" id="btnTreeYes">✅ SÍ</button>
      <button class="btn btn-secondary btn-sm" id="btnTreeNo">❌ NO</button>
      ${state.decisionStepIndex > 0 ? '<button class="btn btn-secondary btn-sm" id="btnTreeBack">↩ Volver</button>' : ''}
    </div>
    <div id="treeOutcomeBox" style="display: none;" class="decision-outcome"></div>
  `;

  container.appendChild(card);

  const outcomeBox = card.querySelector('#treeOutcomeBox');

  card.querySelector('#btnTreeYes').addEventListener('click', () => {
    outcomeBox.style.display = 'block';
    outcomeBox.innerHTML = `<strong>Resultado (SÍ):</strong> ${currentStep.ifYes}`;
    
    // Si hay un siguiente paso, habilitar avance
    if (state.decisionStepIndex < steps.length - 1) {
      setTimeout(() => {
        state.decisionStepIndex++;
        renderDecisionTree(skill);
      }, 1200);
    }
  });

  card.querySelector('#btnTreeNo').addEventListener('click', () => {
    outcomeBox.style.display = 'block';
    outcomeBox.innerHTML = `<strong>Resultado (NO / Causa):</strong> ${currentStep.ifNo}`;

    // Pre-llenar causa raíz y acción recomendada en el formulario
    document.getElementById('diagProbableCause').value = currentStep.ifNo;
  });

  const btnBack = card.querySelector('#btnTreeBack');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      state.decisionStepIndex = Math.max(0, state.decisionStepIndex - 1);
      renderDecisionTree(skill);
    });
  }
}

function renderReferenceCommands(skill) {
  const container = document.getElementById('referenceCommandsContainer');
  container.innerHTML = '<h4 style="font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; margin: 0.75rem 0 0.35rem 0;">Comandos de Referencia Verificables:</h4>';

  const commands = skill.commands || [];
  if (commands.length === 0) {
    container.innerHTML += '<p class="form-hint">No hay comandos específicos para esta skill.</p>';
    return;
  }

  commands.forEach(cmd => {
    const block = document.createElement('div');
    block.className = 'terminal-block';
    block.innerHTML = `
      <div class="terminal-header">${cmd.description}</div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <code class="terminal-code">${cmd.command}</code>
        <button class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;" data-cmd="${cmd.command}">
          Copiar
        </button>
      </div>
      <div class="terminal-desc">Salida esperada: ${cmd.expectedOutput}</div>
    `;

    block.querySelector('button').addEventListener('click', (e) => {
      navigator.clipboard.writeText(cmd.command);
      e.target.textContent = '¡Copiado!';
      setTimeout(() => { e.target.textContent = 'Copiar'; }, 2000);
    });

    container.appendChild(block);
  });
}

// ==========================================================================
// 5. BANCO DE SKILLS (CATÁLOGO MODULAR)
// ==========================================================================
function renderSkillsCatalog(skills) {
  const container = document.getElementById('skillsListGrid');
  container.innerHTML = '';

  skills.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <span class="brand-badge">${skill.code}</span>
        <span class="user-badge" style="font-size: 0.75rem;">${skill.category}</span>
      </div>
      <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: #fff;">${skill.title}</h3>
      <p style="font-size: 0.825rem; color: var(--color-text-muted); margin-bottom: 1rem;">
        ${skill.summary}
      </p>
      <div style="font-size: 0.75rem; color: #38bdf8; margin-bottom: 1rem;">
        ✔ ${skill.commands?.length || 0} Comandos · ✔ ${skill.decisionTree?.length || 0} Pasos de Decisión
      </div>
      <button class="btn btn-secondary btn-sm" style="width: 100%;" data-code="${skill.code}">
        Aplicar en Triaje
      </button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      // Cambiar a la pestaña de triaje y seleccionar la skill
      document.getElementById('tabBtnTriage').click();
      document.getElementById('selectSkillToApply').value = skill.code;
      selectSkill(skill.code);
    });

    container.appendChild(card);
  });
}

// ==========================================================================
// 6. FORMULARIOS: BITÁCORA DE CIERRE, NUEVO INCIDENTE Y ESCALAMIENTO
// ==========================================================================
function setupForms() {
  // Guardar Bitácora de Diagnóstico
  const formDiag = document.getElementById('formDiagnosticReport');
  formDiag.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.currentIncident) {
      showAlert('Seleccione un incidente antes de guardar la bitácora.', 'error');
      return;
    }

    const payload = {
      incidentId: state.currentIncident.id,
      skillCode: state.currentSkill?.code || 'SKILL-NET-01',
      symptom: document.getElementById('diagSymptom').value,
      testsPerformed: document.getElementById('diagTestsPerformed').value,
      probableRootCause: document.getElementById('diagProbableCause').value,
      actionApplied: document.getElementById('diagActionApplied').value,
      resolveIncident: document.getElementById('chkResolveIncident').checked
    };

    try {
      const btn = document.getElementById('btnSaveDiagnostic');
      btn.disabled = true;
      btn.textContent = 'Guardando bitácora...';

      const result = await api.saveDiagnostic(payload);
      showAlert('¡Bitácora técnica guardada y acta generada con éxito!', 'success');

      // Mostrar modal con el acta generada
      state.activeReport = result;
      openReportViewer(result);

      // Recargar lista de incidentes
      await loadIncidents();
    } catch (err) {
      showAlert(`Error al guardar bitácora: ${err.message}`, 'error');
    } finally {
      const btn = document.getElementById('btnSaveDiagnostic');
      btn.disabled = false;
      btn.textContent = '💾 Guardar y Generar Acta Formal';
    }
  });

  // Registrar Nuevo Incidente
  const formInc = document.getElementById('formNewIncident');
  formInc.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      title: document.getElementById('newIncTitle').value,
      severity: document.getElementById('newIncSeverity').value,
      deviceType: document.getElementById('newIncDeviceType').value,
      customerName: document.getElementById('newIncCustomer').value,
      location: document.getElementById('newIncLocation').value || null,
      ipAddress: document.getElementById('newIncIp').value || null
    };

    try {
      const created = await api.createIncident(payload);
      showAlert(`Incidente ${created.code} creado exitosamente.`, 'success');
      closeModal('modalNewIncident');
      formInc.reset();
      await loadIncidents();
      selectIncident(created);
    } catch (err) {
      showAlert(`Error al crear incidente: ${err.message}`, 'error');
    }
  });

  // Escalamiento con Validación de Evidencia Mínima
  const formEsc = document.getElementById('formEscalateIncident');
  formEsc.addEventListener('submit', async (e) => {
    e.preventDefault();

    const incidentId = document.getElementById('escIncidentId').value;
    if (!incidentId) {
      showAlert('No hay un incidente seleccionado para escalar.', 'error');
      return;
    }

    const payload = {
      incidentId,
      targetLevel: document.getElementById('escTargetLevel').value,
      reason: document.getElementById('escReason').value,
      evidence: {
        pingTest: document.getElementById('evPing').value || null,
        ipConfig: document.getElementById('evIpConfig').value || null,
        tracerouteTest: document.getElementById('evTracert').value || null
      }
    };

    try {
      await api.escalateIncident(payload);
      showAlert('Incidente escalado exitosamente hacia el nivel superior con evidencias mínimas verificadas.', 'success');
      closeModal('modalEscalate');
      formEsc.reset();
      await loadIncidents();
    } catch (err) {
      showAlert(`Escalamiento rechazado: ${err.message}`, 'error');
    }
  });
}

// ==========================================================================
// 7. BITÁCORAS GENERADAS Y ESCALAMIENTOS
// ==========================================================================
async function loadReports() {
  const tbody = document.getElementById('reportsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando bitácoras...</td></tr>';

  try {
    const diagnostics = await api.getDiagnostics();
    tbody.innerHTML = '';

    if (diagnostics.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay bitácoras generadas aún.</td></tr>';
      return;
    }

    diagnostics.forEach(diag => {
      const tr = document.createElement('tr');
      const dateFormatted = new Date(diag.createdAt).toLocaleString();

      tr.innerHTML = `
        <td><small>${dateFormatted}</small></td>
        <td><strong>${diag.incidentCode || diag.incidentId}</strong></td>
        <td><span class="user-badge">${diag.skillCode}</span></td>
        <td>${diag.technicianName}</td>
        <td><small>${diag.probableRootCause.substring(0, 60)}...</small></td>
        <td>
          <button class="btn btn-secondary btn-sm btn-view-report" data-id="${diag.id}">
            Ver Acta
          </button>
        </td>
      `;

      tr.querySelector('.btn-view-report').addEventListener('click', () => {
        openReportViewer({
          plainTextReport: diag.toPlainTextReport ? diag.toPlainTextReport() : [
            `ACTA DE SERVICIO TÉCNICO - FIELDOPS & SUPPORT`,
            `Incidente: ${diag.incidentId} | Skill: ${diag.skillCode}`,
            `Fecha: ${diag.createdAt}`,
            `Técnico: ${diag.technicianName}`,
            `------------------------------------------------------------`,
            `1. SÍNTOMA: ${diag.symptom}`,
            `2. PRUEBAS: ${diag.testsPerformed}`,
            `3. CAUSA RAÍZ: ${diag.probableRootCause}`,
            `4. ACCIÓN: ${diag.actionApplied}`
          ].join('\n'),
          jsonReport: diag.toJsonReport ? diag.toJsonReport() : diag
        });
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color: var(--color-danger); text-align: center;">Error: ${err.message}</td></tr>`;
  }
}

async function loadEscalations() {
  const tbody = document.getElementById('escalationsTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando escalamientos...</td></tr>';

  try {
    const escalations = await api.getEscalations();
    tbody.innerHTML = '';

    if (escalations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay escalamientos registrados.</td></tr>';
      return;
    }

    escalations.forEach(esc => {
      const tr = document.createElement('tr');
      const evidenceCount = Object.values(esc.evidence || {}).filter(v => v).length;

      tr.innerHTML = `
        <td><small>${new Date(esc.createdAt).toLocaleString()}</small></td>
        <td><strong>${esc.incidentCode || esc.incidentId}</strong></td>
        <td><span class="badge-${(esc.incidentSeverity || 'P2').toLowerCase()}">${esc.incidentSeverity || 'P2'}</span></td>
        <td><span class="user-badge" style="color: #f87171;">${esc.targetLevel}</span></td>
        <td>${esc.escalatedByName || 'Técnico'}</td>
        <td><span class="user-badge">${esc.status}</span></td>
        <td><small>✔ ${evidenceCount} evidencias técnicas verificadas</small></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--color-danger); text-align: center;">Error: ${err.message}</td></tr>`;
  }
}

// ==========================================================================
// 8. MONITOR DE COLA ASÍNCRONA Y DEAD LETTER QUEUE (DLQ)
// ==========================================================================
async function loadQueueMetrics() {
  try {
    const data = await api.getQueueMetrics();
    const metrics = data.metrics || {};
    
    document.getElementById('statPending').textContent = metrics.PENDING || 0;
    document.getElementById('statProcessing').textContent = metrics.PROCESSING || 0;
    document.getElementById('statCompleted').textContent = metrics.COMPLETED || 0;
    document.getElementById('statDlq').textContent = metrics.DEAD_LETTER || 0;

    const tbody = document.getElementById('queueJobsTableBody');
    tbody.innerHTML = '';

    const jobs = data.recentJobs || [];
    if (jobs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay tareas en cola actualmente.</td></tr>';
      return;
    }

    jobs.forEach(job => {
      const tr = document.createElement('tr');
      const isDlq = job.status === 'DEAD_LETTER';

      tr.innerHTML = `
        <td><code>${job.type}</code></td>
        <td><span class="user-badge" style="${isDlq ? 'color: #f87171;' : ''}">${job.status}</span></td>
        <td>${job.attempts} / ${job.max_attempts}</td>
        <td>
          ${isDlq ? `<button class="btn btn-primary btn-sm btn-replay-job" data-id="${job.id}">Replay (DLQ)</button>` : '-'}
        </td>
      `;

      if (isDlq) {
        tr.querySelector('.btn-replay-job').addEventListener('click', async () => {
          try {
            await api.replayJob(job.id);
            showAlert(`Tarea ${job.id} reencolada desde Dead Letter Queue.`, 'success');
            await loadQueueMetrics();
          } catch (err) {
            showAlert(`Fallo en replay: ${err.message}`, 'error');
          }
        });
      }

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.warn('Error cargando métricas de cola:', err);
  }
}

// ==========================================================================
// 9. MODALES Y VISOR DE ACTAS
// ==========================================================================
function setupModals() {
  // Modal Nuevo Incidente
  document.getElementById('btnNewIncidentModal').addEventListener('click', () => {
    openModal('modalNewIncident');
  });
  document.getElementById('btnCloseIncModal').addEventListener('click', () => closeModal('modalNewIncident'));
  document.getElementById('btnCancelIncModal').addEventListener('click', () => closeModal('modalNewIncident'));

  // Modal Escalamiento
  document.getElementById('btnOpenEscalateModal').addEventListener('click', () => {
    if (!state.currentIncident) {
      showAlert('Seleccione un incidente primero.', 'error');
      return;
    }
    openModal('modalEscalate');
  });
  document.getElementById('btnCloseEscModal').addEventListener('click', () => closeModal('modalEscalate'));
  document.getElementById('btnCancelEscModal').addEventListener('click', () => closeModal('modalEscalate'));

  // Modal Visor de Acta
  document.getElementById('btnCloseRepModal').addEventListener('click', () => closeModal('modalReportViewer'));

  document.getElementById('btnViewPlainText').addEventListener('click', () => {
    if (state.activeReport?.plainTextReport) {
      document.getElementById('reportViewerCode').textContent = state.activeReport.plainTextReport;
    }
  });

  document.getElementById('btnViewJson').addEventListener('click', () => {
    if (state.activeReport?.jsonReport) {
      document.getElementById('reportViewerCode').textContent = JSON.stringify(state.activeReport.jsonReport, null, 2);
    }
  });

  document.getElementById('btnCopyReport').addEventListener('click', (e) => {
    const text = document.getElementById('reportViewerCode').textContent;
    navigator.clipboard.writeText(text);
    e.target.textContent = '¡Copiado!';
    setTimeout(() => { e.target.textContent = '📋 Copiar al Portapapeles'; }, 2000);
  });

  document.getElementById('btnDownloadJson').addEventListener('click', () => {
    const data = JSON.stringify(state.activeReport?.jsonReport || {}, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitacora-${state.activeReport?.jsonReport?.incidentId || 'reporte'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btnRefreshQueue').addEventListener('click', () => {
    loadQueueMetrics();
  });

  // Botón directo a Contexto del Proyecto en el Header
  const btnContext = document.getElementById('btnHeaderContext');
  if (btnContext) {
    btnContext.addEventListener('click', () => {
      document.getElementById('tabBtnContext').click();
    });
  }

  // Visor interactivo de Manuales Oficiales (docs/)
  document.querySelectorAll('.btn-open-doc').forEach(btn => {
    btn.addEventListener('click', async () => {
      const docType = btn.getAttribute('data-doc');
      try {
        const res = await fetch(`/api/docs/${docType}`);
        const data = await res.json();
        if (data.success) {
          openReportViewer({
            plainTextReport: data.data.content,
            jsonReport: { file: data.data.fileName }
          });
          document.getElementById('modalRepTitle').textContent = `📄 Documentación Oficial: ${data.data.fileName}`;
        } else {
          showAlert(data.error?.message || 'Error al abrir documento', 'error');
        }
      } catch (e) {
        showAlert('No se pudo cargar el documento: ' + e.message, 'error');
      }
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openReportViewer(reportData) {
  state.activeReport = reportData;
  document.getElementById('reportViewerCode').textContent = reportData.plainTextReport || JSON.stringify(reportData, null, 2);
  openModal('modalReportViewer');
}

function showAlert(message, type = 'success') {
  const alert = document.getElementById('globalAlert');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.style.display = 'block';

  setTimeout(() => {
    alert.style.display = 'none';
  }, 4000);
}
