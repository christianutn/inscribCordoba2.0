import path from 'path';

export default {
  entry: './src/index.js', // Asegúrate de especificar tu archivo de entrada correcto
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Nombre de tu archivo de salida
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Asegúrate de tener configurado Babel si estás usando ES6+
        },
      },
      // Puedes agregar más reglas aquí para manejar otros tipos de archivos (CSS, imágenes, etc.)
    ],
  },
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc'
    },
  },
  // Otras configuraciones como plugins pueden ir aquí
};
