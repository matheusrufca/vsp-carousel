import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../style/app.scss';

import angular from 'angular';
import vspCarousel from './components/vsp-carousel/vsp-carousel';

let appDirective = () => {
  return {
    template: require('./app.html'),
    controller: 'AppCtrl',
    controllerAs: 'app'
  }
};

class AppCtrl {
  constructor() {
    this.url = 'https://github.com/preboot/angular-webpack';
  }
}


const MODULE_NAME = 'app';

angular.module(MODULE_NAME, [vspCarousel])
  .directive('app', appDirective)
  .controller('AppCtrl', ['$scope', '$timeout', AppCtrl]);

export default MODULE_NAME;
