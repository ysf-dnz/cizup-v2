// Auth
export interface TokenPair { access_token: string; refresh_token: string; expires_in: number }
export interface JWTPayload { uid: string; role: "student" | "instructor" | "admin"; exp: number }

// User
export interface User { id: string; username: string; email: string; role: string; avatar_url?: string; bio?: string; created_at: string }
export interface UserProfile extends User { xp: number; level: number; chapter: number }
export interface LeaderboardEntry { rank: number; user_id: string; username: string; xp: number }

// Course
export interface Lesson { id: string; section_id: string; title: string; type: string; position: number; is_free_preview: boolean; duration_sec?: number; youtube_video_id?: string; content?: string }
export interface Section { id: string; course_id: string; title: string; position: number; lessons: Lesson[] }
export interface Course { id: string; title: string; description: string; thumbnail_url?: string; price: number; is_published: boolean; sections?: Section[] }

// Quest
export interface QuestListItem { level: number; chapter: number; name: string; xp: number; passed: boolean; locked: boolean }
export interface Quest { id: string; chapter: number; level: number; name: string; description: string; xp: number; allowed_functions: string[]; type: boolean }
export interface UserProgress { user_id: string; xp: number; level: number; chapter: number }
export interface Hint { id: string; step: number; text: string; xp_cost: number; unlocked: boolean }
export interface HintsResponse { hints: Hint[]; current_step: number }
export interface SubmitResult { passed: boolean; output: string; xp_gained: number; new_level: number; new_xp: number; error_type?: string }

// Evo
export type EvoStatus = "pending" | "matched" | "active" | "in_progress" | "server_done" | "awaiting_rating" | "completed" | "expired" | "cancelled"
export interface Evo { id: string; client_id: string; server_id?: string; level: number; chapter: number; code?: string; client_code?: string; server_code?: string; status: EvoStatus; server_comment?: string; client_comment?: string; rate?: number; partner_username?: string; scheduled_at: string; expires_at?: string; completed_at?: string; created_at: string }
export interface UserSummary { username: string; email: string }
export interface MineResponse { has_evo: boolean; evo?: Evo; partner?: UserSummary }
export interface RequestItem { id: string; level: number; chapter: number; scheduled_at: string; expires_at?: string; client_username: string; code_preview?: string }
export interface EvoSummary { id: string; level: number; chapter: number; rate?: number; status: string; scheduled_at: string; completed_at?: string; partner_username: string }
export interface StatsResponse { completed: number; avg_rate?: number; chapter_pass: boolean; total: number; chapter?: number }

// Sandbox
export interface CompileResult { output: string; error: string; timed_out: boolean; time_ms: number }

// Notification
export interface Notification { id: string; type: string; title: string; body?: string; link?: string; is_read: boolean; created_at: string }
