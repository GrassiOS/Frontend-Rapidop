module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel',
        ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
}; 


/*module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // sin jsxImportSource
    plugins: [
      'expo-router/babel',          // si usas expo-router
      'nativewind/babel',           // NativeWind v4
      'react-native-reanimated/plugin', // SIEMPRE al final
    ],
  };
}; */