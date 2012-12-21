/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: Anton McConville - IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global dojo dijit widgets orion  window console define localStorage ActiveXObject DOMParser*/
/*jslint browser:true*/

define(['i18n!orion/settings/nls/messages', 'require', 'dojo', 'dijit'], 
	function(messages, require, dojo, dijit) {
	
		/* Synchronizing colors and styles for HTML, CSS and JS files like this ...
	
			Using Prospecto as an example:
			
			-----------------------------------------------
							CSS			HTML		JS
			-----------------------------------------------
			ORANGE			Class		Tag			Keyword
			darkSlateGray	Text		Text		Text
			darkSeaGreen	Comments	Comments	Comments
			cornFlowerblue	String		String		String
			----------------------------------------------- */
	

		function StyleSet(){
		
		}
		
		function multiply(a,b){
			var resultString = 'Result:';
			var result = a*b;
			return resultString + result;
		}
		
		
		StyleSet.prototype.name = 'prospecto';
		StyleSet.prototype.annotationRuler = 'darkSlateGray';
		StyleSet.prototype.background = '#EFEFEF';
		StyleSet.prototype.comment = '#3C802C';
		StyleSet.prototype.keyword = '#CC4C07';
		StyleSet.prototype.text = '#333';
		StyleSet.prototype.string = '#446FBD';
		StyleSet.prototype.overviewRuler = '#FBFBFB';
		StyleSet.prototype.lineNumberOdd = 'white';
		StyleSet.prototype.lineNumberEven = 'white';
		StyleSet.prototype.lineNumber = 'silver';
		StyleSet.prototype.tag = '#CC4C07';
		StyleSet.prototype.attribute = 'cadetBlue';
		StyleSet.prototypefontSize = '10pt';

			function ThemeData() {

		this.styles = [];

		var eclipse = new StyleSet();

		eclipse.name = 'Eclipse';
		eclipse.annotationRuler = 'white';
		eclipse.background = 'white';
		eclipse.comment = 'green';
		eclipse.keyword = '#7f0055';
		eclipse.text = 'darkSlateGray';
		eclipse.string = 'blue';
		eclipse.overviewRuler = 'white';
		eclipse.lineNumberOdd = '#444';
		eclipse.lineNumberEven = '#444';
		eclipse.lineNumber = '#444';
		eclipse.currentLine = '#EAF2FE';
		eclipse.tag = 'darkorange';
		eclipse.attribute = 'cadetBlue';
		eclipse.fontSize = '10pt';

		this.styles.push(eclipse);

		var prospecto = new StyleSet();

		prospecto.name = 'Prospecto';
		prospecto.annotationRuler = 'white';
		prospecto.background = 'white';
		prospecto.comment = '#3C802C';
		prospecto.keyword = '#CC4C07';
		prospecto.text = '#333';
		prospecto.string = '#446FBD';
		prospecto.overviewRuler = 'white';
		prospecto.lineNumberOdd = 'silver';
		prospecto.lineNumberEven = 'silver';
		prospecto.lineNumber = 'silver';
		prospecto.currentLine = '#EAF2FE';
		prospecto.tag = '#CC4C07';
		prospecto.attribute = 'cadetBlue';
		prospecto.fontSize = '10pt';


		this.styles.push(prospecto);

		var blue = new StyleSet();

		blue.name = 'Blue';
		blue.annotationRuler = 'lavender';
		blue.background = 'aliceBlue';
		blue.comment = 'indigo';
		blue.keyword = 'cornFlowerBlue';
		blue.text = 'navy';
		blue.string = 'cornFlowerBlue';
		blue.overviewRuler = 'lavender';
		blue.lineNumberOdd = 'darkSlateGray';
		blue.lineNumberEven = 'darkSlateGray';
		blue.lineNumber = 'darkSlateGray';
		blue.currentLine = 'white';
		blue.tag = 'cornFlowerBlue';
		blue.attribute = 'cadetBlue';
		blue.fontSize = '10pt';

		this.styles.push(blue);

		var ambience = new StyleSet();

		ambience.name = 'Ambience';
		ambience.annotationRuler = '#3D3D3D';
		ambience.background = '#202020';
		ambience.comment = 'mediumslateblue';
		ambience.keyword = 'cornFlowerBlue';
		ambience.text = 'darkseagreen';
		ambience.string = 'lightcoral';
		ambience.overviewRuler = 'white';
		ambience.lineNumberOdd = 'black';
		ambience.lineNumberEven = 'black';
		ambience.lineNumber = 'black';
		ambience.currentLine = 'lightcyan';
		ambience.tag = 'cornFlowerBlue';
		ambience.attribute = 'cadetBlue';
		ambience.fontSize = '10pt';

		this.styles.push(ambience);

		var tierra = new StyleSet();

		tierra.name = 'Tierra';
		tierra.annotationRuler = 'moccasin';
		tierra.background = 'lemonchiffon';
		tierra.comment = 'darkseagreen';
		tierra.keyword = 'darkred';
		tierra.text = '#555555';
		tierra.string = 'orangered';
		tierra.overviewRuler = 'moccasin';
		tierra.lineNumberOdd = 'chocolate';
		tierra.lineNumberEven = 'chocolate';
		tierra.lineNumber = 'chocolate';
		tierra.currentLine = '#baa289';
		tierra.tag = 'darkred';
		tierra.attribute = 'cadetBlue';
		tierra.fontSize = '10pt';

		this.styles.push(tierra);

		var nimbus = new StyleSet();

		nimbus.name = 'Nimbus';
		nimbus.annotationRuler = '#444';
		nimbus.background = 'dimgray';
		nimbus.comment = 'darkseagreen';
		nimbus.keyword = 'darkorange';
		nimbus.text = 'white';
		nimbus.string = 'cornflowerblue';
		nimbus.overviewRuler = '#444';
		nimbus.lineNumberOdd = '#aaa';
		nimbus.lineNumberEven = '#aaa';
		nimbus.lineNumber = '#aaa';
		nimbus.currentLine = '#aabfbb';
		nimbus.tag = 'darkorange';
		nimbus.attribute = 'cadetBlue';
		nimbus.fontSize = '10pt';

		this.styles.push(nimbus);

		var adelante = new StyleSet();

		adelante.name = 'Adelante';
		adelante.annotationRuler = '#E2D2B2';
		adelante.background = '#F1E7C8';
		adelante.comment = '#5D774E';
		adelante.keyword = '#AF473B';
		adelante.text = 'dimgray';
		adelante.string = '#DE5D3B';
		adelante.overviewRuler = '#E2D2B2';
		adelante.lineNumberOdd = '#AF473B';
		adelante.lineNumberEven = '#AF473B';
		adelante.lineNumber = '#AF473B';
		adelante.currentLine = '#9e937b';
		adelante.tag = '#AF473B';
		adelante.attribute = 'cadetBlue';
		adelante.fontSize = '10pt';

		this.styles.push(adelante);

		var raspberry = new StyleSet();

		raspberry.name = 'Raspberry Pi';
		raspberry.annotationRuler = 'seashell';
		raspberry.background = 'seashell';
		raspberry.comment = '#66B32F';
		raspberry.keyword = '#E73E36';
		raspberry.text = 'dimgray';
		raspberry.string = 'darkorange';
		raspberry.overviewRuler = 'seashell';
		raspberry.lineNumberOdd = '#E73E36';
		raspberry.lineNumberEven = '#E73E36';
		raspberry.lineNumber = '#E73E36';
		raspberry.currentLine = '#F5B1AE';
		raspberry.tag = '#E73E36';
		raspberry.attribute = 'cadetBlue';
		raspberry.fontSize = '10pt';

		this.styles.push(raspberry);

		}
		
		function getStyles(){
			return this.styles;
		}
		
		ThemeData.prototype.styles = [];
		ThemeData.prototype.getStyles = getStyles;
		
		var fontSettable = true;
		
		ThemeData.prototype.fontSettable = fontSettable;
		
		function getThemeStorageInfo(){
			var themeInfo = { storage:'/themes', styleset:'editorstyles', defaultTheme:'Prospecto' }; 
			return themeInfo;
		}

		ThemeData.prototype.getThemeStorageInfo = getThemeStorageInfo;

		function getViewData() {

		var dataset = {};
		dataset.top = 10;
		dataset.left = 10;
		dataset.width = 400;
		dataset.height = 350;

		var LEFT = dataset.left;
		var TOP = dataset.top;

		dataset.shapes = [{
			type: 'TEXT',
			name: 'Line Numbers',
			label: '1',
			x: LEFT + 20,
			y: TOP + 20,
			fill: 'darkSlateGray',
			family: 'lineNumber',
			font: '9pt sans-serif'
		},
		{
			type: 'RECTANGLE',
			name: 'Background',
			x: LEFT + 46,
			y: TOP,
			width: 290,
			height: dataset.height,
			family: 'background',
			fill: 'white'
		},
		{
			type: 'TEXT',
			name: 'Strings',
			label: "'text/javascript'",
			x: LEFT + 134,
			y: TOP + 20,
			fill: 'darkorange',
			family: 'string',
			font: '9pt sans-serif'
		},
		
		{
			type: 'TEXT',
			name: 'Foreground',
			label: '=',
			x: LEFT + 124,
			y: TOP + 20,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},

		
		{
			type: 'RECTANGLE',
			name: 'Current Line',
			x: LEFT + 46,
			y: TOP + 87,
			width: 290,
			height: 18,
			family: 'currentLine',
			fill: '#eaf2fd'
		},
		
		{
			type: 'TEXT',
			name: 'HTML Attribute',
			label: 'type',
			x: LEFT + 98,
			y: TOP + 20,
			fill: 'darkGray',
			family: 'attribute',
			font: '9pt sans-serif'
		},
		
		{
			type: 'RECTANGLE',
			name: 'Overview Ruler',
			x: LEFT + 336,
			y: TOP,
			width: 14,
			height: dataset.height,
			family: 'overviewRuler',
			fill: 'white'
		},	
		{
			type: 'TEXT',
			name: 'Comments',
			label: '/* comment */',
			x: LEFT + 75,
			y: TOP + 40,
			fill: 'darkSeaGreen',
			family: 'comment',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'HTML Tag',
			label: '<script',
			x: LEFT + 55,
			y: TOP + 20,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'HTML Tag',
			label: '>',
			x: LEFT + 213,
			y: TOP + 20,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'RECTANGLE',
			name: 'Current Line',
			x: LEFT + 46,
			y: TOP + 87,
			width: 290,
			height: 18,
			family: 'currentLine',
			fill: '#eaf2fd'
		},
		{
			type: 'TEXT',
			name: 'Strings',
			label: '\'Result\'',
			x: LEFT + 164,
			y: TOP + 80,
			fill: 'cornflowerBlue',
			family: 'string',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Foreground',
			label: 'multiply(a,b){',
			x: LEFT + 120,
			y: TOP + 60,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		
		{
			type: 'TEXT',
			name: 'keywords',
			label: 'function',
			x: LEFT + 75,
			y: TOP + 60,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Keywords',
			label: 'var',
			x: LEFT + 95,
			y: TOP + 80,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Foreground',
			label: 'output = ',
			x: LEFT + 115,
			y: TOP + 80,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Foreground',
			label: ';',
			x: LEFT + 205,
			y: TOP + 80,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'keywords',
			label: 'var',
			x: LEFT + 95,
			y: TOP + 100,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Foreground',
			label: 'result = a*b;',
			x: LEFT + 115,
			y: TOP + 100,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'keywords',
			label: 'return',
			x: LEFT + 95,
			y: TOP + 120,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Foreground',
			label: 'output + result;',
			x: LEFT + 135,
			y: TOP + 120,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Foreground',
			label: '}',
			x: LEFT + 75,
			y: TOP + 140,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'HTML Tag',
			label: '</script>',
			x: LEFT + 55,
			y: TOP + 160,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'HTML Tag',
			label: '<style',
			x: LEFT + 55,
			y: TOP + 200,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'HTML Attribute',
			label: 'type',
			x: LEFT + 95,
			y: TOP + 200,
			fill: 'darkGray',
			family: 'attribute',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Foreground',
			label: '=',
			x: LEFT + 121,
			y: TOP + 200,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'Strings',
			label: "'text/css'",
			x: LEFT + 131,
			y: TOP + 200,
			fill: 'darkorange',
			family: 'string',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'HTML Tag',
			label: '>',
			x: LEFT + 180,
			y: TOP + 200,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'CSS Class Name',
			label: '.some-class',
			x: LEFT + 75,
			y: TOP + 220,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'CSS Class Name',
			label: '{',
			x: LEFT + 145,
			y: TOP + 220,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'CSS Attribute',
			label: 'color:',
			x: LEFT + 95,
			y: TOP + 240,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'CSS Value',
			label: '#123456',
			x: LEFT + 130,
			y: TOP + 240,
			fill: 'darkSlateGray',
			family: 'string',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'CSS Text',
			label: ';',
			x: LEFT + 180,
			y: TOP + 240,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'CSS Class Name',
			label: '}',
			x: LEFT + 75,
			y: TOP + 260,
			fill: 'darkSlateGray',
			family: 'text',
			font: '9pt sans-serif'
		},
		{
			type: 'TEXT',
			name: 'HTML Tag',
			label: '</style>',
			x: LEFT + 55,
			y: TOP + 280,
			fill: 'darkorange',
			family: 'keyword',
			font: '9pt sans-serif'
		},
		/* <style type='text/css'></style> */
		{
			type: 'RECTANGLE',
			name: 'Annotation Ruler',
			x: LEFT,
			y: TOP,
			width: 46,
			height: dataset.height,
			family: 'annotationRuler',
			fill: 'white'
		}];

		for (var line = 0; line < 16; line++) {
			dataset.shapes.push({
				type: 'TEXT',
				name: 'Line Numbers',
				label: line + 1,
				x: LEFT + 20,
				y: TOP + (20 * line) + 20,
				fill: 'darkSlateGray',
				family: 'lineNumber',
				font: '9pt sans-serif'
			});
		}

		return dataset;
	}
		
		function parseToXML ( text ) {
		      try {
		        var xml = null;
		        
		        if ( window.DOMParser ) {
		
		          var parser = new DOMParser();
		          xml = parser.parseFromString( text, "text/xml" );
		          
		          var found = xml.getElementsByTagName( "parsererror" );
		
		          if ( !found || !found.length || !found[ 0 ].childNodes.length ) {
		            return xml;
		          }
		
		          return null;
		        } else {
		
		          xml = new ActiveXObject( "Microsoft.XMLDOM" );
		
		          xml.async = false;
		          xml.loadXML( text );
		
		          return xml;
		        }
		      } catch ( e ) {
		        // suppress
		      }
		 }
		 
		ThemeData.prototype.parseToXML = parseToXML;
		
		function selectFontSize( size ){
			console.log( 'fontsize: ' + size );
		}
		
		ThemeData.prototype.selectFontSize = selectFontSize;
		
		function importTheme(data){
			console.log( 'import theme' );
			console.log( data );
			
			var body = data.parameters.valueFor("name");
				
			var xml = this.parseToXML( body );
			
			var newStyle = new StyleSet();
			
			newStyle.name = xml.getElementsByTagName("colorTheme")[0].attributes[1].value;;
			newStyle.annotationRuler = xml.getElementsByTagName("background")[0].attributes[0].value; 
			newStyle.background = xml.getElementsByTagName("background")[0].attributes[0].value;
			newStyle.comment = xml.getElementsByTagName("singleLineComment")[0].attributes[0].value;
			newStyle.keyword = xml.getElementsByTagName("keyword")[0].attributes[0].value;
			newStyle.text = xml.getElementsByTagName("foreground")[0].attributes[0].value;
			newStyle.string = xml.getElementsByTagName("string")[0].attributes[0].value;
			newStyle.overviewRuler = xml.getElementsByTagName("background")[0].attributes[0].value;
			newStyle.lineNumberOdd = xml.getElementsByTagName("lineNumber")[0].attributes[0].value;
			newStyle.lineNumberEven = xml.getElementsByTagName("lineNumber")[0].attributes[0].value;
			newStyle.lineNumber = xml.getElementsByTagName("lineNumber")[0].attributes[0].value;
			newStyle.currentLine = xml.getElementsByTagName("selectionBackground")[0].attributes[0].value;
			
			data.items.styles.push( newStyle );
			data.items.updateThemePicker( newStyle.name );
			data.items.select( newStyle.name );
		}
		
		ThemeData.prototype.importTheme = importTheme;
		
		function processSettings( settings, preferences ){
			
			if( !settings['fontSize'] ){
				settings['fontSize'] = { value:'10pt' };
			}
		
			preferences.getPreferences('/settings', 2).then(function(prefs){ //$NON-NLS-0$
				
				var font = {};		
				font.label = 'Font';
				font.data = [ 	{ label:'Family', value: 'Sans Serif', ui:'Font' }, 
								{ label:'Size', value: settings['fontSize'].value, ui:'Font' }, 
								{ label:'Color', value: settings['text'].value }, 
								{ label:'Background', value: settings['background'].value } ];
					
				var subcategories = [ { element: 'fontFamily', value: 'sans serif' },
							          { element: 'fontSize', value:  settings['fontSize'].value },
							          { element: 'fontWeight', value: 'normal' },
									  { element: 'text', value: settings['text'].value }, 
									  { element: 'background', value: settings['background'].value },
									  { element: 'string', value: settings['string'].value },
									  { element: 'annotationRuler', value: settings['annotationRuler'].value },
									  { element: 'comment', value: settings['comment'].value },
									  { element: 'keyword', value: settings['keyword'].value },
									  { element: 'overviewRuler', value: settings['overviewRuler'].value },
									  { element: 'annotationRuler', value: settings['annotationRuler'].value },
									  { element: 'lineNumber', value: settings['lineNumber'].value },
									  { element: 'currentLine', value: settings['currentLine'].value },
									  { element: 'attribute', value: settings['attribute'].value }
									  ];

				prefs.put( 'JavaScript Editor', JSON.stringify(subcategories) );
				
			});
		}

		ThemeData.prototype.processSettings = processSettings;

		ThemeData.prototype.getViewData = getViewData;

		return{
			ThemeData:ThemeData,
			getStyles:getStyles
		};
	}
);