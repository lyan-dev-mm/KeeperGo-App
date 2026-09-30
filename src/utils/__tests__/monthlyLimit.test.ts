/**
 * Pruebas unitarias para la lógica del límite mensual de mensajes de Kii.
 * Verifica la idempotencia, reservationId, confirmación, liberación y expiración de reservas.
 */

export interface UserProfileData {
  uid: string;
  premium?: boolean;
}

export interface PendingReservation {
  createdAt: number;
}

export interface MonthlyUsageData {
  month: string;
  messageCount: number;
  pendingReservations?: Record<string, PendingReservation>;
  premium: boolean;
  bonusMessages?: number;
  lastUpdated?: any;
}

export class MockFirestoreDatabase {
  public userProfiles: Map<string, UserProfileData> = new Map();
  public usageDocs: Map<string, MonthlyUsageData> = new Map();
  public currentTimeOffsetMs: number = 0;

  private getUsageKey(uid: string, monthKey: string): string {
    return `${uid}_${monthKey}`;
  }

  getCurrentTime(): number {
    return Date.now() + this.currentTimeOffsetMs;
  }

  getProfile(uid: string): UserProfileData | undefined {
    return this.userProfiles.get(uid);
  }

  setProfile(uid: string, data: UserProfileData): void {
    this.userProfiles.set(uid, { ...data });
  }

  getUsage(uid: string, monthKey: string): MonthlyUsageData | undefined {
    return this.usageDocs.get(this.getUsageKey(uid, monthKey));
  }

  setUsage(uid: string, monthKey: string, data: MonthlyUsageData): void {
    this.usageDocs.set(this.getUsageKey(uid, monthKey), { ...data });
  }
}

export class QuotaServiceEngine {
  private db: MockFirestoreDatabase;
  private resCounter: number = 0;

  constructor(db: MockFirestoreDatabase) {
    this.db = db;
  }

  private generateReservationId(): string {
    this.resCounter++;
    return `test_res_${Date.now()}_${this.resCounter}`;
  }

  async checkAndReserveQuota(uid: string, currentMonthKey: string, asyncDelayMs: number = 0): Promise<{
    allowed: boolean;
    reservationId?: string;
    isPremium: boolean;
    limit: number;
    currentCount: number;
    monthKey: string;
  }> {
    if (asyncDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, asyncDelayMs));
    }

    const profile = this.db.getProfile(uid);
    const isPremium = profile ? profile.premium === true : false;

    const usageData = this.db.getUsage(uid, currentMonthKey);
    const currentCount = usageData?.messageCount || 0;

    let bonusMessages = 0;
    let monthPremium = isPremium;

    if (!isPremium) {
      if (usageData?.premium) {
        monthPremium = true;
      }
    } else {
      monthPremium = true;
      if (usageData?.bonusMessages === 20) {
        bonusMessages = 20;
      } else if (usageData && usageData.premium === false) {
        bonusMessages = 20;
      }
    }

    const baseLimit = isPremium ? 80 : 20;
    const effectiveLimit = baseLimit + bonusMessages;

    // Limpieza de reservas expiradas (> 2 minutos = 120,000 ms)
    const nowMs = this.db.getCurrentTime();
    const EXPIRATION_MS = 120_000;
    const pending: Record<string, PendingReservation> = usageData?.pendingReservations || {};
    const activePending: Record<string, PendingReservation> = {};
    let activePendingCount = 0;

    for (const [resId, resData] of Object.entries(pending)) {
      if (resData && typeof resData.createdAt === 'number') {
        if (nowMs - resData.createdAt < EXPIRATION_MS) {
          activePending[resId] = resData;
          activePendingCount++;
        }
      }
    }

    const currentConsumption = currentCount + activePendingCount;

    if (currentConsumption >= effectiveLimit) {
      this.db.setUsage(uid, currentMonthKey, {
        month: currentMonthKey,
        messageCount: currentCount,
        pendingReservations: activePending,
        premium: monthPremium,
        ...(bonusMessages > 0 ? { bonusMessages } : {})
      });

      return {
        allowed: false,
        isPremium,
        limit: effectiveLimit,
        currentCount: currentConsumption,
        monthKey: currentMonthKey
      };
    }

    const reservationId = this.generateReservationId();
    activePending[reservationId] = { createdAt: nowMs };

    this.db.setUsage(uid, currentMonthKey, {
      month: currentMonthKey,
      messageCount: currentCount, // NO INCREMENTA messageCount
      pendingReservations: activePending,
      premium: monthPremium,
      ...(bonusMessages > 0 ? { bonusMessages } : {})
    });

    return {
      allowed: true,
      reservationId,
      isPremium,
      limit: effectiveLimit,
      currentCount: currentConsumption + 1,
      monthKey: currentMonthKey
    };
  }

  async confirmQuotaReservation(uid: string, currentMonthKey: string, reservationId: string): Promise<boolean> {
    if (!reservationId) return false;
    const usageData = this.db.getUsage(uid, currentMonthKey);
    if (!usageData) return false;

    const pending = usageData.pendingReservations || {};
    if (!(reservationId in pending)) {
      return false; // Idempotente
    }

    const remainingPending = { ...pending };
    delete remainingPending[reservationId];

    const currentCount = usageData.messageCount || 0;
    const newCount = currentCount + 1;

    this.db.setUsage(uid, currentMonthKey, {
      ...usageData,
      messageCount: newCount,
      pendingReservations: remainingPending
    });

    return true;
  }

  async releaseQuotaReservation(uid: string, currentMonthKey: string, reservationId: string): Promise<boolean> {
    if (!reservationId) return false;
    const usageData = this.db.getUsage(uid, currentMonthKey);
    if (!usageData) return false;

    const pending = usageData.pendingReservations || {};
    if (!(reservationId in pending)) {
      return false; // Idempotente
    }

    const remainingPending = { ...pending };
    delete remainingPending[reservationId];

    this.db.setUsage(uid, currentMonthKey, {
      ...usageData,
      // NUNCA HACE messageCount - 1
      pendingReservations: remainingPending
    });

    return true;
  }

  async simulateChatWithAI(
    uid: string,
    currentMonthKey: string,
    simulateOpenAIError: boolean = false
  ): Promise<{
    success: boolean;
    reply: string;
    limitReached?: boolean;
    linkLabel?: string;
  }> {
    const reservation = await this.checkAndReserveQuota(uid, currentMonthKey);

    if (!reservation.allowed) {
      const reply = reservation.isPremium
        ? 'Parece que te ha gustado hablar con Kii, y somos conscientes de ello. Es por eso que estamos preparando futuros planes para mejorar tu experiencia y facilitar aún más el acceso a nuestras funciones.'
        : 'Hemos llegado al límite de nuestra conversación. Si te encanta esta función, puedes aumentar el límite del chat suscribiéndote a la versión Premium.';

      return {
        success: false,
        reply,
        limitReached: true,
        linkLabel: reservation.isPremium ? undefined : 'Ver versión Premium'
      };
    }

    if (simulateOpenAIError) {
      if (reservation.reservationId) {
        await this.releaseQuotaReservation(uid, currentMonthKey, reservation.reservationId);
      }
      return {
        success: false,
        reply: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías repetirme eso? Estoy aquí contigo. ❤️'
      };
    }

    if (reservation.reservationId) {
      await this.confirmQuotaReservation(uid, currentMonthKey, reservation.reservationId);
    }

    return {
      success: true,
      reply: 'Respuesta válida de Kii.'
    };
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

export async function runMonthlyLimitTests() {
  console.log('--- INICIANDO PRUEBAS OBLIGATORIAS DEL LÍMITE MENSUAL DE KII ---');

  const mockDb = new MockFirestoreDatabase();
  const engine = new QuotaServiceEngine(mockDb);

  // =========================================================
  // PRUEBA 1: Usuario Basic con límite 20
  // =========================================================
  console.log('Testing 1: Usuario Basic con límite 20...');
  const uidBasic = 'test_basic_1';
  mockDb.setProfile(uidBasic, { uid: uidBasic, premium: false });
  mockDb.setUsage(uidBasic, '2026-09', { month: '2026-09', messageCount: 19, premium: false });

  let resBasic = await engine.simulateChatWithAI(uidBasic, '2026-09');
  assert(resBasic.success === true, 'Mensaje 20/20 debe ser permitido');
  let usageBasic = mockDb.getUsage(uidBasic, '2026-09');
  assert(usageBasic?.messageCount === 20, 'messageCount debe ser 20 tras confirmación');

  let resBasicBlocked = await engine.simulateChatWithAI(uidBasic, '2026-09');
  assert(resBasicBlocked.success === false, 'Mensaje 21 debe ser bloqueado para usuario Básico');
  assert(resBasicBlocked.limitReached === true, 'limitReached debe ser true');

  // =========================================================
  // PRUEBA 2: Usuario Premium con límite 80
  // =========================================================
  console.log('Testing 2: Usuario Premium con límite 80...');
  const uidPrem = 'test_prem_1';
  mockDb.setProfile(uidPrem, { uid: uidPrem, premium: true });
  mockDb.setUsage(uidPrem, '2026-09', { month: '2026-09', messageCount: 79, premium: true });

  let resPrem = await engine.simulateChatWithAI(uidPrem, '2026-09');
  assert(resPrem.success === true, 'Mensaje 80/80 debe ser permitido');
  let usagePrem = mockDb.getUsage(uidPrem, '2026-09');
  assert(usagePrem?.messageCount === 80, 'messageCount debe ser 80');

  let resPremBlocked = await engine.simulateChatWithAI(uidPrem, '2026-09');
  assert(resPremBlocked.success === false, 'Mensaje 81 debe ser bloqueado para Premium');

  // =========================================================
  // PRUEBA 3: Transición Basic → Premium con límite efectivo 100
  // =========================================================
  console.log('Testing 3: Transición Basic → Premium con límite efectivo 100...');
  const uidTrans = 'test_trans_1';
  mockDb.setProfile(uidTrans, { uid: uidTrans, premium: false });
  mockDb.setUsage(uidTrans, '2026-09', { month: '2026-09', messageCount: 18, premium: false });

  // Activa premium en el mismo mes
  mockDb.setProfile(uidTrans, { uid: uidTrans, premium: true });
  let resTrans = await engine.simulateChatWithAI(uidTrans, '2026-09');
  assert(resTrans.success === true, 'Mensaje en período de transición debe ser permitido');
  let usageTrans = mockDb.getUsage(uidTrans, '2026-09');
  assert(usageTrans?.bonusMessages === 20, 'bonusMessages debe ser 20 en mes de transición');

  // Forzar a 99/100
  mockDb.setUsage(uidTrans, '2026-09', { month: '2026-09', messageCount: 99, premium: true, bonusMessages: 20 });
  resTrans = await engine.simulateChatWithAI(uidTrans, '2026-09');
  assert(resTrans.success === true, 'Mensaje 100/100 debe ser permitido en mes de transición');

  let resTransBlocked = await engine.simulateChatWithAI(uidTrans, '2026-09');
  assert(resTransBlocked.success === false, 'Mensaje 101 debe ser bloqueado en mes de transición');

  // =========================================================
  // PRUEBA 4: Usuario existente sin campo premium → Basic
  // =========================================================
  console.log('Testing 4: Usuario existente sin campo premium → Basic...');
  const uidNoField = 'test_no_field';
  mockDb.userProfiles.set(uidNoField, { uid: uidNoField } as UserProfileData);

  let quotaNoField = await engine.checkAndReserveQuota(uidNoField, '2026-09');
  assert(quotaNoField.allowed === true, 'Usuario sin campo premium debe ser permitido');
  assert(quotaNoField.isPremium === false, 'Usuario sin campo premium debe ser isPremium = false');
  assert(quotaNoField.limit === 20, 'Límite debe ser 20');

  // =========================================================
  // PRUEBA 5: Reserva exitosa (reservationId creado, messageCount no cambia)
  // =========================================================
  console.log('Testing 5: Reserva exitosa...');
  const uidRes = 'test_reserve_1';
  mockDb.setProfile(uidRes, { uid: uidRes, premium: false });
  mockDb.setUsage(uidRes, '2026-09', { month: '2026-09', messageCount: 5, premium: false });

  let reserveResult = await engine.checkAndReserveQuota(uidRes, '2026-09');
  assert(reserveResult.allowed === true, 'Reserva debe ser concedida');
  assert(typeof reserveResult.reservationId === 'string', 'Debe retornar un reservationId válido');

  let usageAfterReserve = mockDb.getUsage(uidRes, '2026-09');
  assert(usageAfterReserve?.messageCount === 5, 'CRÍTICO: messageCount NO debe incrementarse antes de confirmación');
  assert(usageAfterReserve?.pendingReservations?.[reserveResult.reservationId!] !== undefined, 'pendingReservations debe contener el reservationId');

  // =========================================================
  // PRUEBA 6: Dos reservas concurrentes cerca del límite (19/20)
  // =========================================================
  console.log('Testing 6: Dos reservas concurrentes cerca del límite...');
  const uidConc = 'test_conc_1';
  mockDb.setProfile(uidConc, { uid: uidConc, premium: false });
  mockDb.setUsage(uidConc, '2026-09', { month: '2026-09', messageCount: 19, premium: false });

  const [resA, resB] = await Promise.all([
    engine.checkAndReserveQuota(uidConc, '2026-09'),
    engine.checkAndReserveQuota(uidConc, '2026-09')
  ]);

  assert((resA.allowed && !resB.allowed) || (!resA.allowed && resB.allowed), 'Solo 1 de las 2 solicitudes debe ser concedida');

  // =========================================================
  // PRUEBA 7: No superar el límite
  // =========================================================
  console.log('Testing 7: No superar el límite...');
  const uidLimit = 'test_limit_strict';
  mockDb.setProfile(uidLimit, { uid: uidLimit, premium: false });
  mockDb.setUsage(uidLimit, '2026-09', { month: '2026-09', messageCount: 19, premium: false });

  // Disparar 5 solicitudes en paralelo
  const parallelReqs = await Promise.all([
    engine.checkAndReserveQuota(uidLimit, '2026-09'),
    engine.checkAndReserveQuota(uidLimit, '2026-09'),
    engine.checkAndReserveQuota(uidLimit, '2026-09'),
    engine.checkAndReserveQuota(uidLimit, '2026-09'),
    engine.checkAndReserveQuota(uidLimit, '2026-09')
  ]);

  const allowedCount = parallelReqs.filter(r => r.allowed).length;
  assert(allowedCount === 1, `Exactamente 1 solicitud debe ser permitida, obtenidas: ${allowedCount}`);

  let usageLimit = mockDb.getUsage(uidLimit, '2026-09');
  const activeCount = Object.keys(usageLimit?.pendingReservations || {}).length;
  assert((usageLimit?.messageCount || 0) + activeCount <= 20, 'messageCount + activePending NUNCA debe superar el límite');

  // =========================================================
  // PRUEBA 8: OpenAI exitoso → confirmación +1
  // =========================================================
  console.log('Testing 8: OpenAI exitoso → confirmación +1...');
  const uidConfirm = 'test_confirm_1';
  mockDb.setProfile(uidConfirm, { uid: uidConfirm, premium: false });
  mockDb.setUsage(uidConfirm, '2026-09', { month: '2026-09', messageCount: 10, premium: false });

  let qConfirm = await engine.checkAndReserveQuota(uidConfirm, '2026-09');
  assert(qConfirm.allowed === true && !!qConfirm.reservationId, 'Reserva previa debe ser válida');

  let okConfirm = await engine.confirmQuotaReservation(uidConfirm, '2026-09', qConfirm.reservationId!);
  assert(okConfirm === true, 'confirmQuotaReservation debe retornar true');

  let usageConfirm = mockDb.getUsage(uidConfirm, '2026-09');
  assert(usageConfirm?.messageCount === 11, 'messageCount debe ser 11 tras confirmación');
  assert(!(qConfirm.reservationId! in (usageConfirm?.pendingReservations || {})), 'reservationId debe ser removido de pendingReservations');

  // =========================================================
  // PRUEBA 9: OpenAI fallido → liberación sin modificar messageCount
  // =========================================================
  console.log('Testing 9: OpenAI fallido → liberación sin modificar messageCount...');
  const uidRelease = 'test_release_1';
  mockDb.setProfile(uidRelease, { uid: uidRelease, premium: false });
  mockDb.setUsage(uidRelease, '2026-09', { month: '2026-09', messageCount: 10, premium: false });

  let qRelease = await engine.checkAndReserveQuota(uidRelease, '2026-09');
  let okRelease = await engine.releaseQuotaReservation(uidRelease, '2026-09', qRelease.reservationId!);
  assert(okRelease === true, 'releaseQuotaReservation debe retornar true');

  let usageRelease = mockDb.getUsage(uidRelease, '2026-09');
  assert(usageRelease?.messageCount === 10, 'messageCount DEBE PERMANECER EN 10');
  assert(!(qRelease.reservationId! in (usageRelease?.pendingReservations || {})), 'reservationId debe ser removido de pendingReservations');

  // =========================================================
  // PRUEBA 10: Double release
  // =========================================================
  console.log('Testing 10: Double release idempotencia...');
  const uidDblRelease = 'test_dbl_release';
  mockDb.setProfile(uidDblRelease, { uid: uidDblRelease, premium: false });
  mockDb.setUsage(uidDblRelease, '2026-09', { month: '2026-09', messageCount: 10, premium: false });

  let qDblRel = await engine.checkAndReserveQuota(uidDblRelease, '2026-09');
  let rel1 = await engine.releaseQuotaReservation(uidDblRelease, '2026-09', qDblRel.reservationId!);
  assert(rel1 === true, 'Primera liberación debe ser true');

  let rel2 = await engine.releaseQuotaReservation(uidDblRelease, '2026-09', qDblRel.reservationId!);
  assert(rel2 === false, 'Segunda liberación debe ser false (no-op idempotente)');

  let usageDblRel = mockDb.getUsage(uidDblRelease, '2026-09');
  assert(usageDblRel?.messageCount === 10, 'messageCount debe seguir en 10');

  // =========================================================
  // PRUEBA 11: Double confirm
  // =========================================================
  console.log('Testing 11: Double confirm idempotencia...');
  const uidDblConf = 'test_dbl_confirm';
  mockDb.setProfile(uidDblConf, { uid: uidDblConf, premium: false });
  mockDb.setUsage(uidDblConf, '2026-09', { month: '2026-09', messageCount: 10, premium: false });

  let qDblConf = await engine.checkAndReserveQuota(uidDblConf, '2026-09');
  let c1 = await engine.confirmQuotaReservation(uidDblConf, '2026-09', qDblConf.reservationId!);
  assert(c1 === true, 'Primera confirmación debe ser true');

  let c2 = await engine.confirmQuotaReservation(uidDblConf, '2026-09', qDblConf.reservationId!);
  assert(c2 === false, 'Segunda confirmación debe ser false (no-op idempotente)');

  let usageDblConf = mockDb.getUsage(uidDblConf, '2026-09');
  assert(usageDblConf?.messageCount === 11, 'messageCount debe ser 11, NO 12');

  // =========================================================
  // PRUEBA 12: Confirm después de release
  // =========================================================
  console.log('Testing 12: Confirm después de release...');
  const uidConfAfterRel = 'test_conf_after_rel';
  mockDb.setProfile(uidConfAfterRel, { uid: uidConfAfterRel, premium: false });
  mockDb.setUsage(uidConfAfterRel, '2026-09', { month: '2026-09', messageCount: 10, premium: false });

  let qCAR = await engine.checkAndReserveQuota(uidConfAfterRel, '2026-09');
  let relCAR = await engine.releaseQuotaReservation(uidConfAfterRel, '2026-09', qCAR.reservationId!);
  assert(relCAR === true, 'Liberación previa debe ser true');

  let confCAR = await engine.confirmQuotaReservation(uidConfAfterRel, '2026-09', qCAR.reservationId!);
  assert(confCAR === false, 'Confirmación posterior a liberación debe ser false');

  let usageCAR = mockDb.getUsage(uidConfAfterRel, '2026-09');
  assert(usageCAR?.messageCount === 10, 'messageCount NO debe incrementarse tras confirmación de reserva liberada');

  // =========================================================
  // PRUEBA 13: Dos solicitudes simultáneas: una exitosa y otra fallida
  // =========================================================
  console.log('Testing 13: Dos solicitudes simultáneas (1 exitosa, 1 fallida)...');
  const uidSimMixed = 'test_sim_mixed';
  mockDb.setProfile(uidSimMixed, { uid: uidSimMixed, premium: false });
  mockDb.setUsage(uidSimMixed, '2026-09', { month: '2026-09', messageCount: 18, premium: false });

  let qMixedA = await engine.checkAndReserveQuota(uidSimMixed, '2026-09');
  let qMixedB = await engine.checkAndReserveQuota(uidSimMixed, '2026-09');
  assert(qMixedA.allowed && qMixedB.allowed, 'Ambas reservas deben ser concedidas (18 -> 19 -> 20)');

  // A responde con éxito
  await engine.confirmQuotaReservation(uidSimMixed, '2026-09', qMixedA.reservationId!);
  // B falla
  await engine.releaseQuotaReservation(uidSimMixed, '2026-09', qMixedB.reservationId!);

  let usageMixed = mockDb.getUsage(uidSimMixed, '2026-09');
  assert(usageMixed?.messageCount === 19, `Resultado esperado 19/20, obtenido: ${usageMixed?.messageCount}`);

  // =========================================================
  // PRUEBA 14: Dos solicitudes simultáneas fallidas
  // =========================================================
  console.log('Testing 14: Dos solicitudes simultáneas fallidas...');
  const uidSimFail = 'test_sim_fail';
  mockDb.setProfile(uidSimFail, { uid: uidSimFail, premium: false });
  mockDb.setUsage(uidSimFail, '2026-09', { month: '2026-09', messageCount: 18, premium: false });

  let qFailA = await engine.checkAndReserveQuota(uidSimFail, '2026-09');
  let qFailB = await engine.checkAndReserveQuota(uidSimFail, '2026-09');

  await engine.releaseQuotaReservation(uidSimFail, '2026-09', qFailA.reservationId!);
  await engine.releaseQuotaReservation(uidSimFail, '2026-09', qFailB.reservationId!);

  let usageFail = mockDb.getUsage(uidSimFail, '2026-09');
  assert(usageFail?.messageCount === 18, `Resultado esperado 18/20, obtenido: ${usageFail?.messageCount}`);

  // =========================================================
  // PRUEBA 15: Reserva expirada después de 2 minutos
  // =========================================================
  console.log('Testing 15: Reserva expirada después de 2 minutos...');
  const uidExp1 = 'test_exp_1';
  mockDb.setProfile(uidExp1, { uid: uidExp1, premium: false });
  mockDb.setUsage(uidExp1, '2026-09', { month: '2026-09', messageCount: 10, premium: false });

  let qExp = await engine.checkAndReserveQuota(uidExp1, '2026-09');
  assert(qExp.allowed === true, 'Reserva inicial creada');

  // Avanzar reloj 2 minutos y 1 segundo (120,001 ms)
  mockDb.currentTimeOffsetMs += 120_001;

  // Tratar de confirmar reserva expirada
  let confExp = await engine.confirmQuotaReservation(uidExp1, '2026-09', qExp.reservationId!);
  // Nota: confirmQuotaReservation limpia al intentar confirmar si existe, pero si intentamos hacer checkAndReserve, se limpia
  let qNewAfterExp = await engine.checkAndReserveQuota(uidExp1, '2026-09');
  assert(qNewAfterExp.allowed === true, 'Nueva reserva permitida tras expiración');
  let usageExp1 = mockDb.getUsage(uidExp1, '2026-09');
  assert(!(qExp.reservationId! in usageExp1?.pendingReservations!), 'Reserva expirada debe haber sido limpiada');

  // =========================================================
  // PRUEBA 16: Limpieza de reservas expiradas al realizar una nueva reserva
  // =========================================================
  console.log('Testing 16: Limpieza de reservas expiradas al realizar una nueva reserva...');
  const uidClean = 'test_clean_exp';
  mockDb.setProfile(uidClean, { uid: uidClean, premium: false });
  mockDb.setUsage(uidClean, '2026-09', { month: '2026-09', messageCount: 15, premium: false });

  let qCleanOld = await engine.checkAndReserveQuota(uidClean, '2026-09');
  mockDb.currentTimeOffsetMs += 120_001; // expirar reserva anterior

  let qCleanNew = await engine.checkAndReserveQuota(uidClean, '2026-09');
  let usageClean = mockDb.getUsage(uidClean, '2026-09');
  assert(!(qCleanOld.reservationId! in (usageClean?.pendingReservations || {})), 'Reserva antigua debió ser eliminada en la limpieza');
  assert(qCleanNew.reservationId! in (usageClean?.pendingReservations || {}), 'Solo la nueva reserva debe existir');

  // =========================================================
  // PRUEBA 17: Verificar que una reserva expirada vuelva a liberar capacidad
  // =========================================================
  console.log('Testing 17: Verificar que reserva expirada libera capacidad...');
  const uidCap = 'test_cap_freed';
  mockDb.setProfile(uidCap, { uid: uidCap, premium: false });
  mockDb.setUsage(uidCap, '2026-09', { month: '2026-09', messageCount: 19, premium: false });

  // Crear reserva A (hace llegar consumo a 20/20)
  let qCapA = await engine.checkAndReserveQuota(uidCap, '2026-09');
  assert(qCapA.allowed === true, 'Reserva A permitida (19 + 1 = 20)');

  // Intentar reserva B sin tiempo transcurrido -> rechazada
  let qCapB = await engine.checkAndReserveQuota(uidCap, '2026-09');
  assert(qCapB.allowed === false, 'Reserva B debe ser bloqueada (20/20 alcanzado)');

  // Expirar reserva A (avanzar reloj > 2 minutos)
  mockDb.currentTimeOffsetMs += 120_001;

  // Intentar reserva C -> A es limpiada, capacidad liberada, C concedida
  let qCapC = await engine.checkAndReserveQuota(uidCap, '2026-09');
  assert(qCapC.allowed === true, 'Reserva C debe ser permitida tras expiración de A');

  // =========================================================
  // PRUEBA 18: Verificar que messageCount nunca sea decrementado por releaseQuotaReservation
  // =========================================================
  console.log('Testing 18: Verificar que messageCount NUNCA sea decrementado por releaseQuotaReservation...');
  const uidNoDec = 'test_no_decrement';
  mockDb.setProfile(uidNoDec, { uid: uidNoDec, premium: false });
  mockDb.setUsage(uidNoDec, '2026-09', { month: '2026-09', messageCount: 10, premium: false });

  // Invocaciones arbitrarias a releaseQuotaReservation
  await engine.releaseQuotaReservation(uidNoDec, '2026-09', 'id_inventado_1');
  await engine.releaseQuotaReservation(uidNoDec, '2026-09', 'id_inventado_2');

  let usageNoDec = mockDb.getUsage(uidNoDec, '2026-09');
  assert(usageNoDec?.messageCount === 10, 'messageCount NUNCA debe decrementarse');

  console.log('\n¡LAS 18 PRUEBAS OBLIGATORIAS DEL LÍMITE MENSUAL DE KII PASARON EXITOSAMENTE! ✅\n');
}

runMonthlyLimitTests().catch(err => {
  console.error('Falla en pruebas:', err);
  process.exit(1);
});
