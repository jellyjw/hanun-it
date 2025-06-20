'use client';

import { Badge } from '@/components/ui/badge';

export default function TestBadgesPage() {
  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Badge Component Test</h1>

      {/* Heavy 스타일 */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Heavy</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="info">Badge label</Badge>
          <Badge variant="success">Badge label</Badge>
          <Badge variant="warning">Badge label</Badge>
          <Badge variant="destructive">Badge label</Badge>
          <Badge variant="default">Badge label</Badge>
          <Badge variant="hot">HOT</Badge>
        </div>
      </div>

      {/* Medium 스타일 */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Medium</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="info-medium">Badge label</Badge>
          <Badge variant="success-medium">Badge label</Badge>
          <Badge variant="warning-medium">Badge label</Badge>
          <Badge variant="destructive-medium">Badge label</Badge>
          <Badge variant="default-medium">Badge label</Badge>
        </div>
      </div>

      {/* Light 스타일 */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Light</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="info-light">Badge label</Badge>
          <Badge variant="success-light">Badge label</Badge>
          <Badge variant="warning-light">Badge label</Badge>
          <Badge variant="destructive-light">Badge label</Badge>
          <Badge variant="default-light">Badge label</Badge>
        </div>
      </div>

      {/* 사이즈 테스트 */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="info" size="sm">
            Small
          </Badge>
          <Badge variant="info" size="default">
            Default
          </Badge>
          <Badge variant="info" size="lg">
            Large
          </Badge>
        </div>
      </div>

      {/* 아이콘 없는 버전 */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Without Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="info" showIcon={false}>
            Badge label
          </Badge>
          <Badge variant="success" showIcon={false}>
            Badge label
          </Badge>
          <Badge variant="warning" showIcon={false}>
            Badge label
          </Badge>
          <Badge variant="destructive" showIcon={false}>
            Badge label
          </Badge>
          <Badge variant="hot" showIcon={false}>
            HOT
          </Badge>
        </div>
      </div>
    </div>
  );
}
