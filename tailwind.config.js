module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
      extend: {
        colors: {
          'status-applied': '#3B82F6',
          'status-interview': '#F59E0B',
          'status-offer': '#10B981',
          'status-rejected': '#EF4444'
        }
      }
    },
    plugins: []
  };