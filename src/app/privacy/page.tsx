import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 한눈IT',
  description: '한눈IT 서비스의 개인정보처리방침 및 구글 애드센스 광고 쿠키 정책 안내입니다.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <Link href="/" className="text-sm font-medium text-purple-600 hover:text-purple-800">
            &larr; 한눈IT 홈으로 돌아가기
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            개인정보처리방침
          </h1>
          <p className="mt-2 text-sm text-gray-500">최종 개정일: 2026년 11월 11일</p>
        </div>

        <div className="space-y-8 leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. 총칙</h2>
            <p>
              한눈IT(이하 &apos;서비스&apos;)은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 및 정보통신망 관련 법령을 준수하고 있습니다.
              본 개인정보처리방침은 서비스 이용 시 제공되는 개인정보가 어떤 용도와 방식으로 이용되며, 개인정보 보호를 위해 어떤 조치가 취해지고 있는지 알려드립니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. 수집하는 개인정보 항목 및 수집 방법</h2>
            <p className="mb-2">서비스는 다음과 같은 최소한의 개인정보를 수집 및 이용합니다:</p>
            <ul className="list-inside list-disc space-y-1 pl-2">
              <li>회원가입 및 로그인 시: 이메일 주소, 닉네임, 프로필 정보 (소셜 로그인 연동 시)</li>
              <li>뉴스레터 구독 시: 이메일 주소</li>
              <li>서비스 이용 과정에서 자동 수집: 접속 IP 주소, 쿠키(Cookie), 접속 로그, 기기 및 브라우저 정보</li>
            </ul>
          </section>

          <section className="rounded-xl border border-purple-100 bg-purple-50/50 p-6">
            <h2 className="mb-3 text-xl font-semibold text-purple-950">
              3. 제3자 광고 사업자(Google AdSense) 및 쿠키(Cookie) 정책
            </h2>
            <div className="space-y-3 text-gray-800">
              <p>
                본 사이트는 광고 게재를 위해 Google을 비롯한 제3자 광고 업체의 광고 서비스를 이용하고 있습니다.
              </p>
              <ul className="list-inside list-disc space-y-2 pl-2">
                <li>
                  Google을 포함한 제3자 공급업체는 쿠키를 사용하여 사용자의 본 웹사이트 및 인터넷상의 다른 웹사이트 이전 방문 기록을 바탕으로 광고를 게재합니다.
                </li>
                <li>
                  Google의 광고 쿠키 사용으로 인해 Google과 파트너는 사용자가 본 사이트 및/또는 다른 사이트를 방문한 정보를 바탕으로 개인 맞춤형 광고를 제공할 수 있습니다.
                </li>
                <li>
                  이용자는 개인화된 광고 설정을 언제든지 해제할 수 있습니다. 맞춤형 광고 게재를 원하지 않으시는 경우,{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-purple-700 underline"
                  >
                    Google 광고 설정
                  </a>
                  을 방문하여 개인 맞춤 광고를 해제하거나,{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-purple-700 underline"
                  >
                    www.aboutads.info
                  </a>
                  를 통해 제3자 공급업체의 맞춤형 광고 쿠키 사용을 차단할 수 있습니다.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">4. 개인정보의 보유 및 이용 기간</h2>
            <p>
              이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.
              단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 관련 법령에서 정한 일정 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">5. 이용자의 권리와 행사 방법</h2>
            <p>
              이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴 또는 뉴스레터 수신 거부를 통해 개인정보 삭제를 요청할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">6. 개인정보 보호책임자 및 문의처</h2>
            <p>
              서비스의 개인정보 처리에 관한 문의, 불만 처리, 피해 구제 등은 아래의 담당 부서로 문의해 주시기 바랍니다:
            </p>
            <div className="mt-3 rounded-lg bg-gray-50 p-4">
              <p className="font-medium text-gray-900">한눈IT 운영팀</p>
              <p className="mt-1 text-sm text-gray-600">이메일: hanun.help@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
