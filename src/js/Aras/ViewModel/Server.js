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
	'dojo/request',
	'dojo/_base/array',
	'dojo/_base/lang',
	'dojo/Stateful',
	'./Database'
], function(declare, request, array, lang, Stateful, Database) {
	
	return declare('Aras.ViewModel.Server', Stateful, {
		
		URL: null,
		
		InError: null,
		
		ErrorCode: null,
		
		ErrorMessage: null,
		
		_databaseCache: new Object(),
		
		constructor: function(args) {
			
			declare.safeMixin(this, args);
		
			this.ResetError();
		},
		
		ResetError: function() {
		
			this.set('InError', false);
			this.set('ErrorCode', null);
			this.set('ErrorMessage', null);
		},
		
		ProcessError: function(error) {
						
			this.set('ErrorCode', error.response.status);
			
			if (error.response.text.charAt(0) === '"' && error.response.text.charAt(error.response.text.length - 1) === '"')
			{
				this.set('ErrorMessage', error.response.text.substr(1, error.response.text.length - 2));
			}
			else
			{
				this.set('ErrorMessage', error.response.text);
			}
			
			this.set('InError', true);
			
		},
		
		Databases: function() {
			return request.get(this.URL + '/databases', 
							   { headers: {'Accept': 'application/json'}, 
								 handleAs: 'json'
							   }).then(
				lang.hitch(this, function(result) {
			
					var ret = [];
			
					array.forEach(result, lang.hitch(this, function(entry) {
						
						if (!this._databaseCache[entry.ID])
						{
							entry['Server'] = this;
							this._databaseCache[entry.ID] = new Database(entry);
						}

						ret.push(this._databaseCache[entry.ID]);
					}));
					
					return ret;
				}),
				lang.hitch(this, function(error) {
					this.ProcessError(error);
					return [];
				})
			);
		},
		
		Database: function(ID) {
			return request.get(this.URL + '/databases/' + ID, 
							   { headers: {'Accept': 'application/json'}, 
								 handleAs: 'json'
							   }).then(
				lang.hitch(this, function(entry) {
					
					if (!this._databaseCache[entry.ID])
					{
						entry['Server'] = this;
						this._databaseCache[entry.ID] = new Database(entry);
					}

					return this._databaseCache[entry.ID];
				}),
				lang.hitch(this, function(error) {
					this.ProcessError(error);
					return null;
				})
			);
		}
		
	});
});
