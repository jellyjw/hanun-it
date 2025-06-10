import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat
    .config({
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        'unused-imports/no-unused-vars': 'warn',
        'unused-imports/no-unused-imports': 'warn',
      },
    })
    .extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
