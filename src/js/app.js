(function() {
  	'use strict';
  	angular.module('app', ['ui.router','ngResource'])
	  	.config( function($stateProvider,$urlRouterProvider) {
	    	$urlRouterProvider.otherwise("main");
	    	$stateProvider.state('main',{
	    		url : '/main',
	    		templateUrl : 'main.html'
	    	})
	    	.state('form',{
	    		url : '/form',
	    		templateUrl : 'form.html',
	    		controller : 'formController'
	    	})
	    	.state('resource',{
	    		url : '/resource',
	    		templateUrl : 'resource.html',
	    		controller : 'resourceController'
	    	})
	    	.state('resource.show',{
	    		url:'/show/:id',
	    		params : {},
	    		templateUrl : 'form.html',
	    		controller : 'resourceUpdateController'
	    	})
	  	})
	  	.directive("errorMessage",function () {
	  		return {		       
		        restrict: 'E',
			    scope: {
	                'messages': '=',
	                'error': '=',
	                'touched': '='
	            },
	            template: '<div ng-messages="error" ng-if="touched">' +
	                    '<div ng-repeat="(key, message) in messages">' +
	                        '<div ng-message="key" class="text-danger">{{message}}</div>' +
	                    '</div>' +
	                '</div>',
	            link: function (scope, elem, attrs) {
	                scope.error = attrs.error;
	                scope.touched = attrs.touched;
	                scope.messages = scope.$eval(attrs.messages); // this works
	                console.log(scope.error);
	                console.log(scope.touched)
	            }
		    }
	  	})
	  	.controller("formController", function($scope, Blog){
	  		$scope.formData = {
	  			title : "",
	  			subject : "",
	  			body : ""
	  		};
	  		$scope.successMsg = "";
	  		$scope.isCreate = true;
	  		$scope.saveForm = function(){	  			
		  		var blog = new Blog($scope.formData);		  		
		  		Blog.save($scope.formData, function() {
		  			$scope.formData = {
			  			title : "",
			  			subject : "",
			  			body : ""
			  		};
	  				$scope.successMsg = "Blog created successfully";
	  			});
	  		}
	  	})	  	
	  	.factory('Blog', function($resource) {
		  	return $resource('/api/blog/:id',{ id: '@_id' },{
		  		update: {
			      	method: 'PUT' 
			    }
		  	});
		})
		.controller("resourceController", function($scope, Blog){
	  		$scope.blog_list = [];
	  		$scope.entry = {};
	  		var entries = Blog.query(function() {
			    $scope.blog_list = entries;
			});
			$scope.$on('refresh', function(){
				var entries = Blog.query(function() {
				    $scope.blog_list = entries;
				});
			});
			
 	  	})
 	  	.controller("resourceUpdateController", function($scope, $state,$stateParams, Blog){
 	  		$scope.id = $stateParams.id;
   			$scope.isCreate = false;
   			$scope.entry = {};
   			$scope.formData = {};
   			$scope.successMsg = "";
   			$scope.getBlog = function( id ){
				$scope.entry = Blog.get({ id: id }, function() {
			    	$scope.formData = $scope.entry;
			  	});
			}
			$scope.update = function(){
				$scope.entry = Blog.get({ id: $scope.formData._id }, function() {
					$scope.entry.title = $scope.formData.title;
					$scope.entry.subject = $scope.formData.subject;
					$scope.entry.body = $scope.formData.body;
				  	$scope.entry.$update(function() {
				    	$scope.successMsg = "updated successfully";
				    	$scope.$emit('refresh');
				  	});
				});
			}
			$scope.deleteData = function( ){
				$scope.entry = Blog.get({ id: $scope.formData._id }, function() {
				  	$scope.entry.$delete(function() {
				    	$scope.successMsg = "deleted successfully";
				  	});
				});
				$scope.$emit("refresh");
				$state.go("resource");
			}
			$scope.getBlog( $scope.id );
 	  	})
})();