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
	'../Cell',
	'dijit/form/TextBox'
], function(declare, lang, Cell, TextBox) {
	
	return declare('Aras.View.Cells.String', [TextBox, Cell], {
		
		_valueHandle: null,
		
		constructor: function() {
			
		},
		
		startup: function() {
			this.inherited(arguments);
			
			// Call Control Startup
			this._startup();
			
			this._updateString();
		},
		
		destroy: function() {
			this.inherited(arguments);	

			// Call Control Destroy
			this._destroy();
			
			if (this._valueHandle)
			{
				this._valueHandle.unwatch();
			}
		},
		
		_updateString: function() {

			if (this.ViewModel != null)
			{
				// Set Value from ViewModel
				this.set("value", this.ViewModel.Value);
			
				if (this._valueHandle)
				{
					this._valueHandle.unwatch();
				}
				
				// Watch for changes in Control value
				this._valueHandle = this.watch('value', lang.hitch(this, function(name, oldValue, newValue) {
				
					if (oldValue !== newValue)
					{										
						if (!this._updateFromViewModel)
						{
							// Update ViewModel Value
							this.ViewModel.set('UpdateValue', newValue);
							this.ViewModel.Write();
						}
					}

				}));
			}
			else
			{
				this.set("value", null);
				
				if (this._valueHandle)
				{
					this._valueHandle.unwatch();
				}
			}
		},
		
		OnViewModelChanged: function(name, oldValue, newValue) {
			this.inherited(arguments);	
			
			// Update String
			this._updateString();	
		}

	});
});