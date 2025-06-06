import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// 댓글 목록 조회 (GET /api/comments?article_id=xxx)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const article_id = searchParams.get("article_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!article_id) {
      return NextResponse.json(
        { success: false, error: "article_id가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // 댓글 목록 조회
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", article_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (commentsError) {
      console.error("댓글 조회 오류:", commentsError);
      return NextResponse.json(
        { success: false, error: "댓글을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 저장된 사용자 정보를 사용하여 댓글 목록 구성
    const commentsWithProfiles = (comments || []).map((comment) => ({
      ...comment,
      user_profile: {
        email: comment.user_email || "",
        full_name: comment.user_full_name || null,
        username: comment.user_username || null,
        avatar_url: comment.user_avatar_url || null,
      },
    }));

    // 전체 댓글 수 조회
    const { count, error: countError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("article_id", article_id);

    if (countError) {
      console.error("댓글 수 조회 오류:", countError);
      return NextResponse.json(
        { success: false, error: "댓글 수를 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      comments: commentsWithProfiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("댓글 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 댓글 작성 (POST /api/comments)
export async function POST(request: NextRequest) {
  try {
    const { article_id, content } = await request.json();

    if (!article_id || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: "article_id와 content가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 댓글 작성
    const { data: comment, error: insertError } = await supabase
      .from("comments")
      .insert({
        article_id,
        user_id: user.id,
        content: content.trim(),
        // 사용자 프로필 정보도 함께 저장 (스냅샷)
        user_email: user.email || "",
        user_full_name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || null,
        user_username:
          user.user_metadata?.username || user.email?.split("@")[0] || null,
        user_avatar_url: user.user_metadata?.avatar_url || null,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("댓글 작성 오류:", insertError);
      return NextResponse.json(
        { success: false, error: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    // 사용자 프로필 정보는 저장된 데이터에서 가져오기
    const commentWithProfile = {
      ...comment,
      user_profile: {
        email: comment.user_email,
        full_name: comment.user_full_name,
        username: comment.user_username,
        avatar_url: comment.user_avatar_url,
      },
    };

    return NextResponse.json({
      success: true,
      comment: commentWithProfile,
    });
  } catch (error) {
    console.error("댓글 작성 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
