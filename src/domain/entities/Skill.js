/**
 * Entidad de Dominio: Skill Operativa
 * Módulo autocontenido de triaje, árbol de decisión y comandos de red.
 */
export class Skill {
  static CATEGORIES = [
    'CONECTIVIDAD_BASICA',
    'LATENCIA_Y_PAQUETES',
    'RESOLUCION_DNS',
    'CONFIGURACION_LOCAL',
    'BITACORA_OPERATIVA',
    'ESCALAMIENTO_TECNICO',
    'COMUNICACION_USUARIO'
  ];

  constructor({
    code,
    title,
    category,
    summary,
    decisionTree = [],
    commands = [],
    checklists = [],
    isActive = true
  }) {
    if (!code || !title) throw new Error('Código y título requeridos para la Skill.');
    if (!Skill.CATEGORIES.includes(category)) {
      throw new Error(`Categoría inválida: ${category}. Permitidas: ${Skill.CATEGORIES.join(', ')}`);
    }

    this.code = code;
    this.title = title.trim();
    this.category = category;
    this.summary = summary;
    this.decisionTree = decisionTree;
    this.commands = commands;
    this.checklists = checklists;
    this.isActive = isActive;
  }
}
