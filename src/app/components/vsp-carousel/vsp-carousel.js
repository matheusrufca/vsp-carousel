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
import {
  isRegExp
} from 'util';


const content = Object.freeze(jsonContent);
const ContentData = (content.data).map((item, i) => {
  item.genre = item.genre.split('|')[0];
  return item;
});

// console.debug('Glide', Glide, Controls, Breakpoints);

let glideDirective = ($timeout) => {

  let mountComponent = (selector, settings) => {
    const glide = new Glide(selector, settings);

    return $timeout(function () {
      if (!angular.isString(selector)) throw 'Invalid Glide selector';
      if (angular.isDefined(settings) && !angular.isObject(settings)) throw 'Invalid Glide settings';

      glide.mount();
      return glide;
    }).catch(function (err) {
      throw err;
    });
  };



  return {
    template: require('./glide.html'),
    // controller: 'CarouselCtrl',
    // controllerAs: 'carouselCtrl',
    scope: {
      settings: '<',
      totalItems: '<',
      slideData: '<',
      navActive: '<'
    },
    link: (scope, element, attrs, controller) => {
      let loadComponent = () => {
        mountComponent('.glide', {
          type: 'carousel',
          perView: 5,
          focusAt: 0,
          gap: 10,
          peek: 130
        }).catch(err => console.warn('Glide:mountComponent', err));
      };

      angular.extend(scope, {
        onClick: clickHandler,
        onMouseOver: hoverHandler,
        onMouseLeave: mouseLeaveHandler
      });


      $timeout(loadComponent)
        .catch(err => {
          controller.error = err;
          console.warn('glideDirective', err);
        }, 1000);

      scope.$watch('navActive', handleNavActiveChange);

      console.debug('glideDirective:link', scope, element, attrs, controller);


      function growSlide(slideElem, state) {
        return $timeout(function () {
          slideElem.classList.toggle('grow', state);
          toggleOverlay(slideElem, state);

          return slideElem;
        });
      }

      function toggleOverlay(slideElem, state) {
        return $timeout(function () {
          let slideOverlayElem = slideElem.querySelector('.slide-item__overlay');
          slideOverlayElem.classList.toggle('hidden', !state);
          return slideOverlayElem;
        }, 250);
      }

      function handleNavActiveChange(newValue, oldValue) {
        if (newValue == oldValue) return;

        if (newValue == false)
          element.find('li.slide-item.nav-active').removeClass('nav-active', false);
      }

      function hoverHandler($event) {
        if (scope.navActive) return;
        if ($event.currentTarget.classList.contains('glide__slide--clone')) return;

        growSlide($event.currentTarget, true);
        console.debug('item:hover', $event);
      }

      function mouseLeaveHandler($event) {
        if (scope.navActive) return;
        if ($event.currentTarget.classList.contains('glide__slide--clone')) return;

        growSlide($event.currentTarget, false);
        console.debug('item:mouseleave', $event);
      }

      function clickHandler($event) {
        if ($event.currentTarget.classList.contains('glide__slide--clone')) return;

        const targetElem = $event.currentTarget,
          $current = element.find('li.slide-item.nav-active');

        if ($current.length) {
          $current.removeClass('nav-active');
        }

        scope.navActive = true;

        growSlide($event.currentTarget, false).then(function (slideElem) {
          slideElem.classList.toggle('nav-active', true);
        });

        console.debug('item:click', scope, targetElem);
      }
    },
    controller: ($scope) => {
      $scope.$on('item.details:closed', (event, args) => {
        $scope.navActive = false;
      });

      $scope.exitNavigation = () => {
        $scope.navActive = false;
      }
    }
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
