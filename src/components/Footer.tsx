import dayjs from 'dayjs';
import { Mail, Calendar, Code2, Github } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="mt-6 border-t border-gray-700 bg-[#262626]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <div className="bg-gradient-purple flex h-10 items-center justify-center rounded-xl">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                한눈IT
              </h3>
            </Link>
            <p className="mb-4 text-sm text-gray-300">
              국내, 해외의 IT 최신 아티클을 한눈에 확인하세요. <br />
              개발자와 IT 전문가를 위한 큐레이션된 최신 컨텐츠를 제공합니다.
            </p>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <section className="mt-2 border-t border-gray-400 pt-6">
          <div className="flex flex-col justify-start">
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="mr-2 h-4 w-4" />
              <span>&copy; {dayjs().year()} 한눈IT. All rights reserved.</span>
            </div>
            {/* <div className="mt-4 md:mt-0 text-sm text-gray-400">Made with ❤️ for developers</div> */}
            <div className="flex items-center text-sm text-gray-400">
              <Mail className="mr-2 h-4 w-4" />
              <span>hanun.help@gmail.com</span>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
