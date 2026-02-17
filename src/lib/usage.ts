import { insforge } from "./insforge";

// ─── Plan Definitions ────────────────────────────────────────────────
export const PLANS = {
    starter: {
        name: "Starter",
        price: 0,
        aiConversionsLimit: 50,
        maxBatchSize: 5,
    },
    pro: {
        name: "Pro",
        price: 7,
        aiConversionsLimit: 3000,
        maxBatchSize: 50,
    },
    agency: {
        name: "Agency",
        price: 24,
        aiConversionsLimit: 20000,
        maxBatchSize: 100,
    },
} as const;

export type PlanKey = keyof typeof PLANS;

export interface UserProfile {
    id: string;
    user_id: string;
    plan: PlanKey;
    ai_conversions_used: number;
    ai_conversions_limit: number;
    max_batch_size: number;
    period_start: string;
    created_at: string;
}

export interface ConversionLog {
    id: string;
    user_id: string;
    file_count: number;
    ai_used: boolean;
    created_at: string;
}

// ─── Get or create user profile ──────────────────────────────────────
export async function getUserProfile(
    userId: string
): Promise<UserProfile | null> {
    // Try to fetch existing profile
    const { data, error } = await insforge.database
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (data) return data as UserProfile;

    // Auto-create a starter profile if not found
    const plan = PLANS.starter;
    const { data: newProfile, error: insertErr } = await insforge.database
        .from("user_profiles")
        .insert({
            user_id: userId,
            plan: "starter",
            ai_conversions_used: 0,
            ai_conversions_limit: plan.aiConversionsLimit,
            max_batch_size: plan.maxBatchSize,
            period_start: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertErr) {
        console.error("Error creating user profile:", insertErr);
        // Could be a race condition — try fetching again
        const { data: retryData } = await insforge.database
            .from("user_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
        return (retryData as UserProfile) ?? null;
    }

    return newProfile as UserProfile;
}

// ─── Check usage limits ──────────────────────────────────────────────
export interface UsageCheck {
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    maxBatchSize: number;
    plan: PlanKey;
}

export async function checkUsageLimit(
    userId: string,
    fileCount: number,
    useAi: boolean
): Promise<UsageCheck> {
    const profile = await getUserProfile(userId);

    if (!profile) {
        return {
            allowed: false,
            remaining: 0,
            limit: PLANS.starter.aiConversionsLimit,
            used: 0,
            maxBatchSize: PLANS.starter.maxBatchSize,
            plan: "starter",
        };
    }

    // Check if the period needs to be reset (monthly)
    const periodStart = new Date(profile.period_start);
    const now = new Date();
    const daysSincePeriodStart = Math.floor(
        (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePeriodStart >= 30) {
        // Reset the period
        await insforge.database
            .from("user_profiles")
            .update({
                ai_conversions_used: 0,
                period_start: now.toISOString(),
            })
            .eq("user_id", userId);

        profile.ai_conversions_used = 0;
        profile.period_start = now.toISOString();
    }

    // If not using AI, always allow (WebP conversion is free)
    if (!useAi) {
        return {
            allowed: true,
            remaining: profile.ai_conversions_limit - profile.ai_conversions_used,
            limit: profile.ai_conversions_limit,
            used: profile.ai_conversions_used,
            maxBatchSize: profile.max_batch_size,
            plan: profile.plan,
        };
    }

    const remaining = profile.ai_conversions_limit - profile.ai_conversions_used;
    const allowed = remaining >= fileCount;

    return {
        allowed,
        remaining,
        limit: profile.ai_conversions_limit,
        used: profile.ai_conversions_used,
        maxBatchSize: profile.max_batch_size,
        plan: profile.plan,
    };
}

// ─── Log a conversion ────────────────────────────────────────────────
export async function logConversion(
    userId: string,
    fileCount: number,
    aiUsed: boolean
): Promise<void> {
    // Insert the conversion log
    await insforge.database.from("conversion_logs").insert({
        user_id: userId,
        file_count: fileCount,
        ai_used: aiUsed,
    });

    // If AI was used, increment the counter
    if (aiUsed) {
        const profile = await getUserProfile(userId);
        if (profile) {
            await insforge.database
                .from("user_profiles")
                .update({
                    ai_conversions_used: profile.ai_conversions_used + fileCount,
                })
                .eq("user_id", userId);
        }
    }
}

// ─── Get conversion history ──────────────────────────────────────────
export async function getConversionHistory(
    userId: string,
    limit = 20
): Promise<ConversionLog[]> {
    const { data, error } = await insforge.database
        .from("conversion_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching conversion history:", error);
        return [];
    }

    return (data as ConversionLog[]) ?? [];
}
