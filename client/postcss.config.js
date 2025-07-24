import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

/** @type {import('postcss').Postcss} */
export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
  ]
}
