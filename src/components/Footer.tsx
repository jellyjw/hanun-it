import dayjs from 'dayjs';
import { Mail, Calendar, Code2, Github } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#262626] border-t border-gray-700 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="flex items-center justify-center h-10 rounded-xl bg-gradient-purple">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                한눈IT
              </h3>
            </Link>
            <p className="text-gray-300 mb-4 text-sm">
              국내, 해외의 IT 최신 아티클을 한눈에 확인하세요. <br />
              개발자와 IT 전문가를 위한 큐레이션된 최신 컨텐츠를 제공합니다.
            </p>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <section className="mt-2 pt-6 border-t border-gray-400">
          <div className="flex flex-col justify-start">
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              <span>&copy; {dayjs().year()} 한눈IT. All rights reserved.</span>
            </div>
            {/* <div className="mt-4 md:mt-0 text-sm text-gray-400">Made with ❤️ for developers</div> */}
            <div className="flex items-center text-sm text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              <span>hanun.help@gmail.com</span>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
