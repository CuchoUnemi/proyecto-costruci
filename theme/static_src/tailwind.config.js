// /**
//  * This is a minimal config.
//  *
//  * If you need the full config, get it from here:
//  * https://unpkg.com/browse/tailwindcss@latest/stubs/defaultConfig.stub.js
//  */
//
// module.exports = {
//     content: [
//         /**
//          * HTML. Paths to Django template files that will contain Tailwind CSS classes.
//          */
//
//         /*  Templates within theme app (<tailwind_app_name>/templates), e.g. base.html. */
//         '../templates/**/*.html',
//
//         /*
//          * Main templates directory of the project (BASE_DIR/templates).
//          * Adjust the following line to match your project structure.
//          */
//         '../../templates/**/*.html',
//
//         /*
//          * Templates in other django apps (BASE_DIR/<any_app_name>/templates).
//          * Adjust the following line to match your project structure.
//          */
//         '../../**/templates/**/*.html',
//
//         /**
//          * JS: If you use Tailwind CSS in JavaScript, uncomment the following lines and make sure
//          * patterns match your project structure.
//          */
//         /* JS 1: Ignore any JavaScript in node_modules folder. */
//         // '!../../**/node_modules',
//         /* JS 2: Process all JavaScript files in the project. */
//         // '../../**/*.js',
//
//
//         // './src/**/*.{html,js}',
//         'node_modules/preline/dist/*.js',
//
//         /**
//          * Python: If you use Tailwind CSS classes in Python, uncomment the following line
//          * and make sure the pattern below matches your project structure.
//          */
//         // '../../**/*.py'
//     ],
//     theme: {
//         extend: {},
//     },
//     plugins: [
//         /**
//          * '@tailwindcss/forms' is the forms plugin that provides a minimal styling
//          * for forms. If you don't like it or have own styling for forms,
//          * comment the line below to disable '@tailwindcss/forms'.
//          */
//         require('@tailwindcss/forms'),
//         require('@tailwindcss/typography'),
//         require('@tailwindcss/aspect-ratio'),
//
//         // require('@tailwindcss/forms'),
//         require('preline/plugin'),
//     ],
// }

module.exports = {
  content: [
    './src/**/*.{html,js}',
    'node_modules/preline/dist/*.js',
    '../../templates/**/*.html',
    '../../static/**/*.js',
    '../**/*.py',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 6s linear infinite',
        'bounce-custom': 'bounce-custom 0.2s linear infinite alternate',
        'dark-mode-fade-in': 'darkModeFadeIn 0.3s ease-in-out',
        'dark-mode-fade-out': 'darkModeFadeOut 0.3s ease-in-out',
        'light-mode-fade-in': 'lightModeFadeIn 0.3s ease-in-out',
        'light-mode-fade-out': 'lightModeFadeOut 0.3s ease-in-out',
      },
      keyframes: {
        spin: {
          to: { transform: 'rotate(-1turn)' },
        },
        'bounce-custom': {
          to: { transform: 'translateY(20px)' },
        },
        darkModeFadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        darkModeFadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        lightModeFadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        lightModeFadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      },
      maxWidth: {
        '3xl': '48rem',
        '4xl': '56rem',
      },
      colors: {
        principal: '#050812',
        secundario: '#070B15',
        contenedores: '#0A0F1A',
        inputs: '#030306',
        orangered: {
          300: '#FF6347',
          700: '#FF4500',
        },
        'mint-green': '#3EB489',
        'mint-dark': '#2E8B6E',
      },
      fontFamily: {
        Quicksand: ['Quicksand', 'sans-serif'],
        Mukta: ['Mukta', 'sans-serif'],
        Pacifico: ['Pacifico', 'cursive'],
        Tiny5: ['Tiny5', 'cursive'],
        body: ['Inter'],
      },
      transitionProperty: {
        colors: 'background-color, border-color, color, fill, stroke',
        transform: 'transform',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('preline/plugin'),

      function ({ addComponents }) {
        addComponents({
          '.information-card, .characteristics-card': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            backgroundColor: 'rgb(255 255 255)',
            padding: '1.5rem',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#e5e7eb',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
          },
          '.information-card-title': {
            fontSize: '22px',
            textTransform: 'uppercase',
            fontWeight: '800',
            color: '#0A3D62',
            marginBottom: '0.5rem',
          },
          '.information-card-img': {
            width: '70%',
            height: 'auto',
            borderRadius: '10%',
          },
          '.characteristics-card': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '18px',
          },
          '.characteristics-card img': {
            width: '100%',
            borderRadius: '10%',
          },
          '.characteristics-card-title': {
            fontSize: '16px',
            textTransform: 'capitalize',
            color: '#0A3D62',
            marginLeft: '20px',
            textAlign: 'center',
          },
          '.card-header': {
            width: '50%',
            margin: '10px',
          },
          '.card-body': {
            backgroundColor: '#FAFAFA',
            margin: '6px',
            padding: '6px',
            borderRadius: '20px',
          },
          '.card-footer': {
            backgroundColor: '#FAFAFA',
            margin: '10px',
            padding: '10px',
            borderRadius: '10px',
          },
          '.custom-transform': {
            transform: 'scale(1)',
            transitionProperty: 'transform',
            transitionDuration: '300ms',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
          '#carousel-inner': {
            display: 'flex',
            transition: 'transform 0.5s ease-in-out',
          },
          '@keyframes slideRight': {
            from: {
              transform: 'translateX(0)',
            },
            to: {
              transform: 'translateX(-100%)',
            },
          },
          '.animate-slide-right': {
            animation: 'slideRight 0.5s ease-in-out',
          },
          '.pedro-pedro': {
            display: 'block',
            width: '100%',
            animation: 'bounce 0.2s linear infinite alternate',
          },
          '.spinner': {
            width: '200px',
            height: '200px',
            background: 'rgb(59 130 246)',
            borderRadius: '50%',
            overflow: 'hidden',
            animation: 'spin 6s linear infinite',
          },
        });
      },
    ],
  };
