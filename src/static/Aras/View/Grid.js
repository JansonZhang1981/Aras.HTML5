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
	'dojo/when',
	'dojo/promise/all',
	'dojo/_base/array',
	'./_Grid',
	'dijit/layout/BorderContainer',
	'./Control'
], function(declare, lang, when, all, array, _Grid, BorderContainer, Control) {
	
	return declare('Aras.View.Grid', [BorderContainer, Control], {
			
		_grid: null,
		
		_columns: null,
		
		_rowsHandle: null,
				
		constructor: function() {
			
		},
		
		startup: function() {
			this.inherited(arguments);
			
			// Create Grid
			this._grid = new _Grid({ region: 'center', selectionMode: 'single' });
			this.addChild(this._grid);
			
			// Connect to Grid Selection Changed
			this._grid.on('dgrid-select', lang.hitch(this, function(event) {
				when(this.ViewModel, lang.hitch(this, function(viewmodel){
					viewmodel.Properties.Selected.Value = viewmodel.Session.Control(event.rows[0].data.id);
					viewmodel.Session.UpdateProperty(viewmodel.Properties.Selected);
				}));
			}));
		},
		
		OnViewModelChange: function(name, oldValue, newValue) {
			this.inherited(arguments);
					
			// Update Grid
			when(this.ViewModel, lang.hitch(this, function(viewmodel){
								
				// Update Columns
				this._columns = all(viewmodel.Properties.Columns.Value).then(lang.hitch(this, function(columns){
					var gridcolumns = {};
					
					array.forEach(columns, lang.hitch(this, function(column){
						gridcolumns[column.Properties.Name.Value] = column.Properties.Label.Value;
					}));
					
					// Set Grid Columns
					this._grid._setColumns(gridcolumns);
					
					// Watch Rows
					if (this._rowsHandle != null)
					{
						this._rowsHandle.unwatch();
					}
				
					this._rowsHandle = viewmodel.Properties.Rows.watch("Value", lang.hitch(this, this.OnRowsChange));
			
					// Process Rows
					this._processRows(viewmodel.Properties.Rows.Value);
				
					return columns;
				}));	
			}));
		},

		_processRows: function(rowsresponse) {

			// Update Rows once columns are completed
			when(this._columns, lang.hitch(this, function(columns){
				
				all(rowsresponse).then(lang.hitch(this, function(rows) {
					
					// Ensure have all cells
					var cells = [rows.length];
									
					array.forEach(rows, lang.hitch(this, function(row, i) {
							cells[i] = all(row.Properties.Cells.Value).then(lang.hitch(this, function(cells) {
							return cells;
						}));
					}));
					
					// When all cells are received update Grid
					all(cells).then(lang.hitch(this, function(cells) {
						
						var rowdata = new Array(rows.length);
						
						array.forEach(rows, lang.hitch(this, function(row, i) {
							rowdata[i] = new Object();
							rowdata[i]['id'] = row.ID;
							
							array.forEach(cells[i], lang.hitch(this, function(cell, j) {

								console.debug(cell.Properties.Value);
								// Set Cell Value
								rowdata[i][columns[j].Properties.Name.Value] = "Hello";						
							}));
							
						}));
												
						// Refresh Grid
						this._grid.refresh();
						this._grid.renderArray(rowdata);
					}));

				}));
			}));	
		},
		
		OnRowsChange: function(name, oldValue, newValue) {
			this.inherited(arguments);
			
			// Process Rows
			this._processRows(newValue);
		}
		
	});
});