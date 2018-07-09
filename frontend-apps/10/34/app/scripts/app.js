"use strict";

/**
 * @ngdoc overview
 * @name routingQuizApp
 * @description
 * # routingQuizApp
 *
 * Main module of the application.
 */
angular
  .module("routingQuizApp", ["ui.router"])
  .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
      .state("home", {
        url: "/",
        templateUrl: "views/instructions.html",
      })
      .state("bricks", {})
      .state("bricks.red", {
        url: "/bricks/red",
        templateUrl: "views/bricks.html",
        controller: "RedBricksCtrl as brick",
      })
      .state("bricks.blue", {
        url: "/bricks/blue",
        templateUrl: "views/bricks.html",
        controller: "BlueBricksCtrl as brick",
      })
      .state("bricks.green", {
        url: "/bricks/green",
        templateUrl: "views/bricks.html",
        controller: "GreenBricksCtrl as brick",
      })
      .state("cart", {
        templateUrl: "views/cart.html",
        controller: "CartCtrl as cart",
      })
      .state("bricks.red.cart", {
        templateUrl: "views/cart.html",
        controller: "CartCtrl as cart",
      })
      .state("bricks.blue.cart", {
        templateUrl: "views/cart.html",
        controller: "CartCtrl as cart",
      })
      .state("bricks.green.cart", {
        templateUrl: "views/cart.html",
        controller: "CartCtrl as cart",
      })
    ;
  }])
;
