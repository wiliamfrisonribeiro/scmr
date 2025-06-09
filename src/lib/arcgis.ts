import config from '@arcgis/core/config';

// Configuração global do ArcGIS
export function configureArcGIS() {
  // Definir API Key
  config.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurGmqqIlr3TBprlsff3Mud5GOjsXtvQaQaJyhnOKZ07m3xrQhk6R6SRuVvQ8q9wJ4Pjd4XFufKKct8Jt3JhlNbH9rpzxoqRxKjFCNhFdL3HFerQyLsYDUirkfe6-4WktboS0iiecgZpqu-3iHJIBbGPWqOtLnuvKdq-PbQSOwN6V28DusnChUNi21eqm19XwZGhWKkt6aigaDBrUrZgYmHSY.AT1_YjOrnQiE';

  // Configurar URLs base (apenas se usar deploy manual de assets)
  config.assetsPath = './assets';

  // Configurações adicionais
  config.request.useIdentity = false;
}

// Carregamento de estilos CSS do ArcGIS
export function loadArcGISStyles() {
  import('@arcgis/core/assets/esri/themes/light/main.css');
}
