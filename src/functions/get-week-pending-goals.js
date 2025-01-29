"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekPendingGoals = getWeekPendingGoals;
const dayjs_1 = __importDefault(require("dayjs"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Pega as metas pendentes.
async function getWeekPendingGoals() {
    const firstDayOfWeek = (0, dayjs_1.default)().startOf('week').toDate();
    const lastDayOfWeek = (0, dayjs_1.default)().endOf('week').toDate();
    // Pega as metas criadas até o final da semana.
    const goalsCreatedUpToWeek = db_1.db.$with('goals_created_up_to_week').as(db_1.db
        .select({
        id: schema_1.goals.id,
        title: schema_1.goals.title,
        desiredWeeklyFrequency: schema_1.goals.desiredWeeklyFrequency,
        createdAt: schema_1.goals.createdAt,
    })
        .from(schema_1.goals)
        // lte - menor ou igual.
        .where((0, drizzle_orm_1.lte)(schema_1.goals.createdAt, lastDayOfWeek)));
    // Conta as vezes que a meta foi completada. 
    const goalCompletionCounts = db_1.db.$with('goal_completion_counts').as(db_1.db
        .select({
        goalId: schema_1.goalCompletions.goalId,
        completionCount: (0, drizzle_orm_1.count)(schema_1.goalCompletions.id)
            .as('completionCount'),
    })
        .from(schema_1.goalCompletions)
        .where((0, drizzle_orm_1.and)(
    // gte - maior ou igual.
    (0, drizzle_orm_1.gte)(schema_1.goalCompletions.createdAt, firstDayOfWeek), 
    // lte - menor ou igual.
    (0, drizzle_orm_1.lte)(schema_1.goalCompletions.createdAt, lastDayOfWeek)))
        .groupBy(schema_1.goalCompletions.goalId));
    // Pega as metas pendentes. 
    const pendingGoals = await db_1.db
        .with(goalsCreatedUpToWeek, goalCompletionCounts)
        .select({
        id: goalsCreatedUpToWeek.id,
        title: goalsCreatedUpToWeek.title,
        desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
        // COALESCE, garante que o retorno será 0 e não null.
        completionCount: (0, drizzle_orm_1.sql /*sql*/) `
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
        .from(goalsCreatedUpToWeek)
        // Junção que retorna todos os dados da esquerda.
        // eq - igual.
        .leftJoin(goalCompletionCounts, (0, drizzle_orm_1.eq)(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id));
    return { pendingGoals };
}
