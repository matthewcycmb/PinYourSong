import { getSupabaseAdmin } from "@/lib/supabase";
import SongWall from "@/components/SongWall";

export const dynamic = "force-dynamic";

export default async function Home() {
  let songs = [];
  let totalCount = 0;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      songs = data.map((s) => ({ ...s, liked: false }));
    }

    const { count } = await getSupabaseAdmin()
      .from("songs")
      .select("*", { count: "exact", head: true });

    totalCount = count ?? 0;
  } catch {
    // App will render with empty state
  }

  return <SongWall initialSongs={songs} initialCount={totalCount} />;
}
