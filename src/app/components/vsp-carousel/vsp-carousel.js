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

    if (!angular.isString(selector)) throw 'Invalid Glide selector';
    if (angular.isDefined(settings) && !angular.isObject(settings)) throw 'Invalid Glide settings';

    const glide = new Glide(selector, settings);
    glide.mount();
    return glide;
  };

  let loadComponent = (data) => {
    return $timeout(function () {
      mountComponent('.glide', {
        type: 'carousel',
        perView: 5,
        focusAt: 0,
        gap: 10,
        peek: 130
      });
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

      scope.$watch('navActive', handleNavActiveChange);

      angular.extend(scope, {
        onClick: clickHandler,
        onMouseOver: hoverHandler,
        onMouseLeave: mouseLeaveHandler
      });

      init();


      function init() {
        $timeout(loadComponent, 1000)
          .catch(err => {
            controller.error = err;
            console.warn('glideDirective', err);
          });
      }

      function setSlideActiveTimeout(slideElem, timeout) {
        cancelSlideActivation();

        scope._activationTimeout = $timeout(function () {
          setSlideActive(slideElem);
        }, timeout);
      }

      function cancelSlideActivation() {
        if (angular.isUndefined(scope._activationTimeout)) return;

        $timeout.cancel(scope._activationTimeout);
      }

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
        const targetElem = $event.currentTarget;

        if (targetElem.classList.contains('glide__slide--clone')) return;
        if (scope.navActive && targetElem.classList.contains('nav-active')) return;


        if (scope.navActive) {
          setSlideActiveTimeout(targetElem, 3000);
        } else {
          growSlide(targetElem, true);
        }
        console.debug('item:hover', $event);
      }

      function mouseLeaveHandler($event) {
        if ($event.currentTarget.classList.contains('glide__slide--clone')) return;

        if (scope.navActive) {
          cancelSlideActivation();
        } else {
          growSlide($event.currentTarget, false);
          console.debug('item:mouseleave', $event);
        }
      }

      function clickHandler($event) {
        const targetElem = $event.currentTarget;

        if (targetElem.classList.contains('glide__slide--clone')) return;

        scope.navActive = true;
        setSlideActive(targetElem);
        console.debug('item:click', scope, targetElem);
      }

      function setSlideActive(slideElem) {
        const $current = element.find('li.slide-item.nav-active');

        if ($current.length) {
          $current.removeClass('nav-active');
        }

        growSlide(slideElem, false).then(function (slideElem) {
          slideElem.classList.toggle('nav-active', true);
        });
      }

      console.debug('glideDirective:link', scope, element, attrs, controller);
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
