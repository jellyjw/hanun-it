import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserProfile from '@/components/auth/UserProfile';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">내 프로필</h1>
          <UserProfile />

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <h2 className="mb-2 text-lg font-semibold text-blue-900">인증 완료!</h2>
            <p className="text-blue-700">
              소셜 로그인이 성공적으로 완료되었습니다. 이 페이지는 로그인한 사용자만 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
