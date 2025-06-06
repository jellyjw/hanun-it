import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// 댓글 수정 (PUT /api/comments/[id])
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();
    const commentId = params.id;

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: "content가 필요합니다." },
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

    // 댓글 수정 (RLS로 인해 본인 댓글만 수정 가능)
    const { data: comment, error: updateError } = await supabase
      .from("comments")
      .update({ content: content.trim() })
      .eq("id", commentId)
      .select("*")
      .single();

    if (updateError) {
      console.error("댓글 수정 오류:", updateError);
      return NextResponse.json(
        { success: false, error: "댓글 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          error: "댓글을 찾을 수 없거나 수정 권한이 없습니다.",
        },
        { status: 404 }
      );
    }

    // 사용자 프로필 정보는 저장된 데이터에서 가져오기
    const commentWithProfile = {
      ...comment,
      user_profile: {
        email: comment.user_email || "",
        full_name: comment.user_full_name || null,
        username: comment.user_username || null,
        avatar_url: comment.user_avatar_url || null,
      },
    };

    return NextResponse.json({
      success: true,
      comment: commentWithProfile,
    });
  } catch (error) {
    console.error("댓글 수정 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 댓글 삭제 (DELETE /api/comments/[id])
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
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

    // 댓글 삭제 (RLS로 인해 본인 댓글만 삭제 가능)
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("댓글 삭제 오류:", deleteError);
      return NextResponse.json(
        { success: false, error: "댓글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "댓글이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("댓글 삭제 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
