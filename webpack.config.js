const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: {
                // fontes servidas em /fonts (fora do bundle)
                filter: (url) => !url.startsWith('/'),
              },
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff2?)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/logo.svg',
      title: 'Infinity Forever',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      watch: true,
    },
    compress: true,
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: true,
    // backend local (testes, resolve, gateway de consumo)
    proxy: {
      '/api': 'http://localhost:3001',
      '/v1': 'http://localhost:3001',
    },
    hot: true,
    liveReload: true,
    // evita loop de rebuild: ignora artefatos de teste e o próprio log
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        ignored: [/node_modules/, /shots/, /build/, /\.log$/],
      },
    },
    client: {
      overlay: { errors: true, warnings: false },
      logging: 'warn',
    },
  },
};
