/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
fontFamily: {      'sans': ['Comic Sans MS', 'ui-sans-serif', 'system-ui']    },
      colors: {
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}

