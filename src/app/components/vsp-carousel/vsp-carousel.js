import jsonContent from '../../../../resources/content.json';

// Slick
import '../../../../node_modules/slick-carousel/slick/slick.scss';
import '../../../../node_modules/slick-carousel/slick/slick-theme.scss';
import 'slick-carousel';
import 'angular-slick-carousel';

// Glide.js
import "../../../../node_modules/@glidejs/glide/src/assets/sass/glide.core.scss";
import "../../../../node_modules/@glidejs/glide/src/assets/sass/glide.theme.scss";

import Glide, {
  Controls,
  Breakpoints,
  Anchors,
  Images,
  Keyboard,
  Swipe,
  Autoplay
} from '@glidejs/glide/dist/glide.esm'


import './carousel.scss';


const content = Object.freeze(jsonContent);
const ContentData = (content.data).map((item, i) => {
  item.genre = item.genre.split('|')[0];
  return item;
});

// console.debug('Glide', Glide, Controls, Breakpoints);



let glideDirective = ($timeout) => {

  let mountComponent = (selector, settings) => {
    if (!angular.isString(selector)) throw 'Invalid Glide selector';
    if (angular.isDefined(settings) && !angular.isObject(settings)) throw 'Invalid Glide settings';

    let glide;
    try {
      glide = new Glide(selector, settings);

      $timeout(() => {
        glide.mount();
        console.debug('Glide', glide, settings);
      })
    } catch (err) {
      console.warn('Glide:mountComponent', err);
      throw err;
    }
    return glide;
  }




  return {
    template: require('./glide.html'),
    // controller: 'CarouselCtrl',
    // controllerAs: 'carouselCtrl',
    scope: {
      settings: '<',
      totalItems: '<',
      slideData: '<'
    },
    link: (scope, element, attrs, controller) => {

      let loadComponent = () => {
        $timeout(() => {
          mountComponent('.glide', {
            type: 'carousel',
            perView: 5,
            focusAt: 0,
            gap: 10,
            peek: 130
          })
        })
      }

      try {
        loadComponent();
      } catch (err) {
        console.warn('glideDirective', err);
        controller.error = err;
      }

      console.debug('glideDirective:link', scope, element, attrs, controller);
    },
    controller: () => {}
  }
};



let vspCarouselDirective = () => {
  return {
    template: require('./carousel.html'),
    controller: 'CarouselCtrl',
    controllerAs: 'carouselCtrl',
    scope: {
      totalItems: '<'
    },
    link: (scope, element, attrs, controller) => {

      try {} catch (err) {
        controller.error = err;
      }




      console.debug('vspCarouselDirective:link', scope, element, attrs, controller);
    }
  }
}



// CarouselCtrl.prototype.

class CarouselCtrl {
  constructor($scope, $timeout, ContentData) {
    this._imagePlaceholder = 'https://placeimg.com/650/374/arch';

    // this.sliderSettings = slickCarouselSettings;
    this.items = ContentData.map((item, i) => {
      item.thumbUrl = this.image(['650', '374']);
      item.imageUrl = this.image(['428', '240']);
      return item;
    });
    this.totalItems = $scope.totalItems;

    console.debug('CarouselCtrl', $scope, this, ContentData);
  }


  image(size) {
    let dimension = size.join('/'),
      timestamp = new Date().getTime();

    return `https://placeimg.com/${dimension}?i=${timestamp}`;
  }
}
const slickCarouselSettings = Object.freeze({
  lazyLoad: 'ondemand',
  autoplay: false,
  infinite: true,
  slidesToShow: 5,
  slidesToScroll: 3,
  variableWidth: true
});



const MODULE_NAME = 'vsp-carousel';

angular.module(MODULE_NAME, ['slickCarousel'])
  .factory('ContentData', () => {
    return ContentData;
  })
  .directive('vspCarousel', vspCarouselDirective)
  .directive('glide', glideDirective)
  .controller('CarouselCtrl', ['$scope', '$timeout', 'ContentData', CarouselCtrl]);

export default MODULE_NAME;