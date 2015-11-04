/*
  Aras.HTML5 provides a HTML5 client library to build Aras Innovator Applications

  Copyright (C) 2015 Processwall Limited.

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see http://opensource.org/licenses/AGPL-3.0.
 
  Company: Processwall Limited
  Address: The Winnowing House, Mill Lane, Askham Richard, York, YO23 3NW, United Kingdom
  Tel:     +44 113 815 3440
  Email:   support@processwall.com
*/

define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dijit/layout/BorderContainer',
	'./Control',
	'../ViewModel/Server'
], function(declare, lang, array, BorderContainer, Control, Server) {
	
	return declare('Aras.View.Plugin', [BorderContainer, Control], {
		
		URL: null,
		
		DatabaseID: null,
		
		Username: null,
		
		Password: null,
		
		Name: null,
		
		TopAras: null,
		
		Context: null,
		
		constructor: function(args) {
			
		},
		
		startup: function() {
			this.inherited(arguments);
			
			// Check for Top Aras and update connection parameters
			
			if (this.TopAras != null)
			{
				this.DatabaseID = this.TopAras.commonProperties.database;
				this.Username = this.TopAras.commonProperties.loginName;
				this.Password = this.TopAras.commonProperties.password;
			}
			
			// Create Server
			var server = new Server({ URL: this.URL });
			
			// Get Database
			server.Database(this.DatabaseID).then(lang.hitch(this, function(database) {
		
				// Login
				database.Login(this.Username, this.Password).then(lang.hitch(this, function(session){

					// Get Application ViewModel
					session.Plugin(this.Name, this.Context).then(lang.hitch(this, function(plugin){ 
								
						// Set ViewModel
						this.set("ViewModel", plugin);
										
					}));
				}));
			}));
		},
		
		Refresh: function () {
			
		}
		
	});
});